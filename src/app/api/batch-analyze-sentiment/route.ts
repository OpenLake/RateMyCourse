import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { SENTIMENT_CONFIG } from '@/lib/sentiment-config';
import { analyzeSentiment, isAIServiceConfigured } from '@/lib/ai-service';

interface BatchAnalysisRequest {
  limit?: number;
  targetType?: 'course' | 'professor';
  reviewIds?: string[];
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

    const maxLimit = 100;
    const parsedLimit = Number(limit);
    const integerLimit = Number.isFinite(parsedLimit)
      ? Math.floor(parsedLimit)
      : 50;
    const safeLimit = Math.min(maxLimit, Math.max(1, integerLimit));

    // Check if AI service is configured
    if (!isAIServiceConfigured()) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Build query to get reviews needing analysis
    let query = supabaseAdmin
      .from('reviews')
      .select('id, comment, target_type');

    // Filter by review IDs if provided
    if (reviewIds && reviewIds.length > 0) {
      query = query.in('id', reviewIds.slice(0, safeLimit));
    } else {
      // Get reviews without sentiment analysis
      const { data: analyzedReviews, error: analyzedReviewsError } = await supabaseAdmin
        .from('review_sentiments')
        .select('review_id');

      if (analyzedReviewsError) {
        console.error('Failed to fetch analyzed reviews:', analyzedReviewsError);
        return NextResponse.json(
          { error: 'Failed to fetch analyzed reviews' },
          { status: 500 }
        );
      }
      
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

    query = query.limit(safeLimit);

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

    const reviewsToProcess = reviews.slice(0, safeLimit);

    // Process each review
    const results = {
      total: reviewsToProcess.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const review of reviewsToProcess) {
      try {
        // Validate comment
        if (!review.comment || review.comment.length < SENTIMENT_CONFIG.preprocessing.minCommentLength) {
          results.skipped++;
          continue;
        }

        // Analyze sentiment using centralized AI service
        const aiResult = await analyzeSentiment(
          review.comment,
          review.target_type
        );

        if (!aiResult.success || !aiResult.data) {
          throw new Error(aiResult.error || 'Sentiment analysis failed');
        }

        // Store result
        await storeSentiment(review.id, {
          overallSentiment: aiResult.data.overallSentiment,
          overallConfidence: aiResult.data.overallConfidence,
          aspectSentiments: aiResult.data.aspectSentiments,
          primaryEmotion: aiResult.data.primaryEmotion,
          emotionIntensity: aiResult.data.emotionIntensity,
          rawResponse: aiResult.rawResponse,
        });

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
