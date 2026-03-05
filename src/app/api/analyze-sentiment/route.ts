import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SENTIMENT_CONFIG } from '@/lib/sentiment-config';

// Type definitions for the sentiment analysis
interface SentimentRequest {
  reviewId: string;
  comment: string;
  targetType: 'course' | 'professor';
}

interface AspectSentiment {
  [key: string]: {
    score: number;
    confidence: number;
  };
}

interface SentimentResult {
  overallSentiment: number;
  overallConfidence: number;
  aspectSentiments: AspectSentiment;
  primaryEmotion: string | null;
  emotionIntensity: number | null;
  rawResponse: any;
}

/**
 * Preprocess and validate comment text
 */
function preprocessComment(comment: string): { valid: boolean; error?: string; preprocessed?: string } {
  // Check minimum length
  if (!comment || comment.trim().length < SENTIMENT_CONFIG.preprocessing.minCommentLength) {
    return {
      valid: false,
      error: `Comment must be at least ${SENTIMENT_CONFIG.preprocessing.minCommentLength} characters`
    };
  }

  // Check maximum length
  if (comment.length > SENTIMENT_CONFIG.preprocessing.maxCommentLength) {
    return {
      valid: false,
      error: `Comment exceeds maximum length of ${SENTIMENT_CONFIG.preprocessing.maxCommentLength} characters`
    };
  }

  // Check word count
  const wordCount = comment.trim().split(/\s+/).length;
  if (wordCount < SENTIMENT_CONFIG.preprocessing.minWordCount) {
    return {
      valid: false,
      error: `Comment must contain at least ${SENTIMENT_CONFIG.preprocessing.minWordCount} words`
    };
  }

  // Basic preprocessing
  const preprocessed = comment.trim();

  return {
    valid: true,
    preprocessed
  };
}

/**
 * Call Gemini API to analyze sentiment
 */
async function analyzeWithGemini(
  comment: string,
  targetType: 'course' | 'professor'
): Promise<SentimentResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Get aspect configuration based on target type
  const aspects = targetType === 'course' 
    ? SENTIMENT_CONFIG.aspects.course 
    : SENTIMENT_CONFIG.aspects.professor;

  // Build aspect list for prompt
  const aspectList = Object.keys(aspects).join(', ');

  const prompt = `Analyze the sentiment of this ${targetType} review and return ONLY a JSON object (no markdown, no explanations).

Review: "${comment}"

Return this exact JSON structure:
{
  "overallSentiment": <number 1-5, where 1=very negative, 3=neutral, 5=very positive>,
  "overallConfidence": <number 0-1, confidence in the overall sentiment>,
  "aspectSentiments": {
    ${Object.keys(aspects).map(aspect => `"${aspect}": {"score": <1-5>, "confidence": <0-1>}`).join(',\n    ')}
  },
  "primaryEmotion": <one of: "satisfied", "frustrated", "excited", "disappointed", "neutral", "overwhelmed", "grateful" or null>,
  "emotionIntensity": <number 0-1 or null>
}

Guidelines:
- Analyze sentiment for each aspect: ${aspectList}
- If an aspect is not mentioned, set score to 3 (neutral) and confidence to 0
- overallSentiment should be a weighted average of mentioned aspects
- primaryEmotion should reflect the dominant emotional tone
- Return valid JSON only`;

  let retries = 0;
  let lastError: Error | null = null;

  while (retries < SENTIMENT_CONFIG.gemini.retryAttempts) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${SENTIMENT_CONFIG.gemini.model}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: SENTIMENT_CONFIG.gemini.temperature,
              topK: SENTIMENT_CONFIG.gemini.topK,
              topP: SENTIMENT_CONFIG.gemini.topP,
              maxOutputTokens: SENTIMENT_CONFIG.gemini.maxOutputTokens,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const text = data.candidates[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      // Parse JSON response (handle potential markdown code blocks)
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const result = JSON.parse(jsonText);

      // Validate response structure
      if (
        typeof result.overallSentiment !== 'number' ||
        typeof result.overallConfidence !== 'number' ||
        !result.aspectSentiments
      ) {
        throw new Error('Invalid response structure from Gemini API');
      }

      return {
        overallSentiment: result.overallSentiment,
        overallConfidence: result.overallConfidence,
        aspectSentiments: result.aspectSentiments,
        primaryEmotion: result.primaryEmotion || null,
        emotionIntensity: result.emotionIntensity || null,
        rawResponse: data,
      };

    } catch (error) {
      lastError = error as Error;
      retries++;
      
      if (retries < SENTIMENT_CONFIG.gemini.retryAttempts) {
        // Wait before retrying
        await new Promise(resolve => 
          setTimeout(resolve, SENTIMENT_CONFIG.gemini.retryDelay * retries)
        );
      }
    }
  }

  // All retries failed
  throw new Error(`Failed to analyze sentiment after ${retries} attempts: ${lastError?.message}`);
}

/**
 * Store sentiment analysis result in database
 */
async function storeSentimentResult(
  reviewId: string,
  result: SentimentResult
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('review_sentiments')
    .upsert({
      review_id: reviewId,
      overall_sentiment: result.overallSentiment,
      overall_confidence: result.overallConfidence,
      aspect_sentiments: result.aspectSentiments,
      primary_emotion: result.primaryEmotion,
      emotion_intensity: result.emotionIntensity,
      model_version: SENTIMENT_CONFIG.gemini.model,
      raw_response: result.rawResponse,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'review_id'
    });

  if (error) {
    throw new Error(`Failed to store sentiment result: ${error.message}`);
  }
}

/**
 * POST /api/analyze-sentiment
 * Analyze sentiment for a single review
 */
export async function POST(request: Request) {
  try {
    const body: SentimentRequest = await request.json();
    const { reviewId, comment, targetType } = body;

    // Validate required fields
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      );
    }

    if (!targetType || (targetType !== 'course' && targetType !== 'professor')) {
      return NextResponse.json(
        { error: 'Invalid target type. Must be "course" or "professor"' },
        { status: 400 }
      );
    }

    // Preprocess comment
    const preprocessResult = preprocessComment(comment);
    if (!preprocessResult.valid) {
      return NextResponse.json(
        { error: preprocessResult.error },
        { status: 400 }
      );
    }

    // Verify review exists
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, target_type')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify target type matches
    if (review.target_type !== targetType) {
      return NextResponse.json(
        { error: 'Review target type does not match provided target type' },
        { status: 400 }
      );
    }

    // Analyze sentiment with Gemini
    const sentimentResult = await analyzeWithGemini(
      preprocessResult.preprocessed!,
      targetType
    );

    // Store result in database (this will trigger aggregation via database triggers)
    await storeSentimentResult(reviewId, sentimentResult);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        reviewId,
        overallSentiment: sentimentResult.overallSentiment,
        overallConfidence: sentimentResult.overallConfidence,
        aspectSentiments: sentimentResult.aspectSentiments,
        primaryEmotion: sentimentResult.primaryEmotion,
        emotionIntensity: sentimentResult.emotionIntensity,
      },
    });

  } catch (error) {
    console.error('Error in sentiment analysis:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Sentiment analysis service is not configured' },
          { status: 503 }
        );
      }

      if (error.message.includes('Gemini API error')) {
        return NextResponse.json(
          { error: 'External sentiment analysis service error' },
          { status: 503 }
        );
      }

      if (error.message.includes('Failed to store')) {
        return NextResponse.json(
          { error: 'Failed to save sentiment analysis results' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred during sentiment analysis' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze-sentiment?reviewId=xxx
 * Get existing sentiment analysis for a review
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Fetch sentiment analysis
    const { data, error } = await supabase
      .from('review_sentiments')
      .select('*')
      .eq('review_id', reviewId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sentiment analysis not found for this review' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch sentiment analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        reviewId: data.review_id,
        overallSentiment: data.overall_sentiment,
        overallConfidence: data.overall_confidence,
        aspectSentiments: data.aspect_sentiments,
        primaryEmotion: data.primary_emotion,
        emotionIntensity: data.emotion_intensity,
        processedAt: data.processed_at,
        modelVersion: data.model_version,
      },
    });

  } catch (error) {
    console.error('Error fetching sentiment analysis:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
