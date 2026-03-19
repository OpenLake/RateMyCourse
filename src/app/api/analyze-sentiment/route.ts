import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SENTIMENT_CONFIG } from '@/lib/sentiment-config';
import { analyzeSentiment, isAIServiceConfigured } from '@/lib/ai-service';

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
 * Store sentiment analysis result in database
 */
async function storeSentimentResult(
  reviewId: string,
  overallSentiment: number,
  overallConfidence: number,
  aspectSentiments: any,
  primaryEmotion: string | null,
  emotionIntensity: number | null,
  rawResponse: any
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('review_sentiments')
    .upsert({
      review_id: reviewId,
      overall_sentiment: overallSentiment,
      overall_confidence: overallConfidence,
      aspect_sentiments: aspectSentiments,
      primary_emotion: primaryEmotion,
      emotion_intensity: emotionIntensity,
      model_version: SENTIMENT_CONFIG.gemini.model,
      raw_response: rawResponse,
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

    // Check if AI service is configured
    if (!isAIServiceConfigured()) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Analyze sentiment using centralized AI service
    const aiResult = await analyzeSentiment(
      preprocessResult.preprocessed!,
      targetType
    );

    if (!aiResult.success || !aiResult.data) {
      return NextResponse.json(
        { error: aiResult.error || 'Failed to analyze sentiment' },
        { status: 500 }
      );
    }

    const sentimentData = aiResult.data;

    // Store result in database (this will trigger aggregation via database triggers)
    await storeSentimentResult(
      reviewId,
      sentimentData.overallSentiment,
      sentimentData.overallConfidence,
      sentimentData.aspectSentiments,
      sentimentData.primaryEmotion,
      sentimentData.emotionIntensity,
      aiResult.rawResponse
    );

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        reviewId,
        overallSentiment: sentimentData.overallSentiment,
        overallConfidence: sentimentData.overallConfidence,
        aspectSentiments: sentimentData.aspectSentiments,
        primaryEmotion: sentimentData.primaryEmotion,
        emotionIntensity: sentimentData.emotionIntensity,
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
