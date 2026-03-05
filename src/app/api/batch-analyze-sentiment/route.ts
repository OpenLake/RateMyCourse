import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SENTIMENT_CONFIG } from '@/lib/sentiment-config';

interface BatchAnalysisRequest {
  limit?: number;
  targetType?: 'course' | 'professor';
  reviewIds?: string[];
}

/**
 * Analyze sentiment with Gemini API
 */
async function analyzeWithGemini(
  comment: string,
  targetType: 'course' | 'professor'
): Promise<any> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  const aspects = targetType === 'course' 
    ? SENTIMENT_CONFIG.aspects.course 
    : SENTIMENT_CONFIG.aspects.professor;

  const aspectList = Object.keys(aspects).join(', ');

  const prompt = `Analyze the sentiment of this ${targetType} review and return ONLY a JSON object (no markdown, no explanations).

Review: "${comment}"

Return this exact JSON structure:
{
  "overallSentiment": <number 1-5>,
  "overallConfidence": <number 0-1>,
  "aspectSentiments": {
    ${Object.keys(aspects).map(aspect => `"${aspect}": {"score": <1-5>, "confidence": <0-1>}`).join(',\n    ')}
  },
  "primaryEmotion": <"satisfied"|"frustrated"|"excited"|"disappointed"|"neutral"|"overwhelmed"|"grateful"|null>,
  "emotionIntensity": <number 0-1 or null>
}

Guidelines:
- Analyze sentiment for: ${aspectList}
- If an aspect is not mentioned, set score to 3 and confidence to 0
- Return valid JSON only`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${SENTIMENT_CONFIG.gemini.model}:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
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
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  // Parse JSON (handle markdown)
  let jsonText = text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '');
  }

  const result = JSON.parse(jsonText);
  return { ...result, rawResponse: data };
}

/**
 * Store sentiment result
 */
async function storeSentiment(reviewId: string, result: any): Promise<void> {
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
    throw new Error(`Failed to store sentiment: ${error.message}`);
  }
}

/**
 * POST /api/batch-analyze-sentiment
 * Process sentiment analysis for multiple reviews
 */
export async function POST(request: Request) {
  try {
    const body: BatchAnalysisRequest = await request.json();
    const { limit = 50, targetType, reviewIds } = body;

    // Build query to get reviews needing analysis
    let query = supabaseAdmin
      .from('reviews')
      .select('id, comment, target_type');

    // Filter by review IDs if provided
    if (reviewIds && reviewIds.length > 0) {
      query = query.in('id', reviewIds);
    } else {
      // Get reviews without sentiment analysis
      const { data: analyzedReviews } = await supabaseAdmin
        .from('review_sentiments')
        .select('review_id');
      
      const analyzedIds = (analyzedReviews || []).map(r => r.review_id);
      
      if (analyzedIds.length > 0) {
        query = query.not('id', 'in', `(${analyzedIds.join(',')})`);
      }
    }

    // Apply filters
    query = query.not('comment', 'is', null);
    
    if (targetType) {
      query = query.eq('target_type', targetType);
    }

    query = query.limit(limit);

    const { data: reviews, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No reviews found requiring analysis',
        results: {
          total: 0,
          successful: 0,
          failed: 0,
          skipped: 0,
        },
      });
    }

    // Process each review
    const results = {
      total: reviews.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const review of reviews) {
      try {
        // Validate comment
        if (!review.comment || review.comment.length < SENTIMENT_CONFIG.preprocessing.minCommentLength) {
          results.skipped++;
          continue;
        }

        // Analyze sentiment
        const sentimentResult = await analyzeWithGemini(
          review.comment,
          review.target_type
        );

        // Store result
        await storeSentiment(review.id, sentimentResult);

        results.successful++;

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Review ${review.id}: ${errorMsg}`);
        console.error(`Failed to analyze review ${review.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });

  } catch (error) {
    console.error('Error in batch sentiment analysis:', error);
    return NextResponse.json(
      { error: 'Batch processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/batch-analyze-sentiment/status
 * Get count of reviews needing analysis
 */
export async function GET(request: Request) {
  try {
    // Get total reviews with comments
    const { count: totalWithComments, error: totalError } = await supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .not('comment', 'is', null);

    if (totalError) {
      return NextResponse.json(
        { error: 'Failed to count reviews' },
        { status: 500 }
      );
    }

    // Get reviews already analyzed
    const { count: analyzed, error: analyzedError } = await supabaseAdmin
      .from('review_sentiments')
      .select('*', { count: 'exact', head: true });

    if (analyzedError) {
      return NextResponse.json(
        { error: 'Failed to count analyzed reviews' },
        { status: 500 }
      );
    }

    const needingAnalysis = (totalWithComments || 0) - (analyzed || 0);

    return NextResponse.json({
      success: true,
      data: {
        totalReviewsWithComments: totalWithComments || 0,
        reviewsAnalyzed: analyzed || 0,
        reviewsNeedingAnalysis: Math.max(0, needingAnalysis),
        analysisPercentage: totalWithComments 
          ? Math.round(((analyzed || 0) / totalWithComments) * 100) 
          : 0,
      },
    });

  } catch (error) {
    console.error('Error getting batch status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
