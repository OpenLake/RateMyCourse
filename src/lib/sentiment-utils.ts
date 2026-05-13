/**
 * Sentiment Analysis Utility Functions
 * Helper functions for triggering and managing sentiment analysis
 */

import { supabase } from './supabase';
import { SENTIMENT_CONFIG } from './sentiment-config';

/**
 * Trigger sentiment analysis for a single review
 * Can be called from client or server
 */
export async function triggerSentimentAnalysis(
  reviewId: string,
  comment: string,
  targetType: 'course' | 'professor'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate inputs
    if (!reviewId || !comment || !targetType) {
      return {
        success: false,
        error: 'Missing required parameters',
      };
    }

    // Check comment length
    if (comment.length < SENTIMENT_CONFIG.preprocessing.minCommentLength) {
      return {
        success: false,
        error: 'Comment too short for sentiment analysis',
      };
    }

    // Get the base URL
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Call the sentiment analysis API
    const response = await fetch(`${baseUrl}/api/analyze-sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reviewId,
        comment,
        targetType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Sentiment analysis failed',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error triggering sentiment analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a review has been analyzed
 */
export async function hasSentimentAnalysis(reviewId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('review_sentiments')
      .select('id')
      .eq('review_id', reviewId)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * Get sentiment analysis for a review
 */
export async function getSentimentAnalysis(reviewId: string) {
  try {
    const { data, error } = await supabase
      .from('review_sentiments')
      .select('*')
      .eq('review_id', reviewId)
      .single();

    if (error) {
      return null;
    }

    return {
      overallSentiment: data.overall_sentiment,
      overallConfidence: data.overall_confidence,
      aspectSentiments: data.aspect_sentiments,
      primaryEmotion: data.primary_emotion,
      emotionIntensity: data.emotion_intensity,
      processedAt: data.processed_at,
    };
  } catch (error) {
    console.error('Error fetching sentiment:', error);
    return null;
  }
}

/**
 * Get reviews that need sentiment analysis
 * (reviews with comments but no sentiment data)
 */
export async function getReviewsNeedingAnalysis(limit: number = 50) {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, comment, target_type, target_id')
      .not('comment', 'is', null)
      .limit(limit);

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    if (!reviews || reviews.length === 0) {
      return [];
    }

    // Filter out reviews that already have sentiment analysis
    const reviewsWithoutSentiment = [];
    for (const review of reviews) {
      const hasSentiment = await hasSentimentAnalysis(review.id);
      if (!hasSentiment && review.comment && review.comment.length >= SENTIMENT_CONFIG.preprocessing.minCommentLength) {
        reviewsWithoutSentiment.push(review);
      }
    }

    return reviewsWithoutSentiment;
  } catch (error) {
    console.error('Error getting reviews needing analysis:', error);
    return [];
  }
}

/**
 * Batch process sentiment analysis for multiple reviews
 * Returns count of successful and failed analyses
 */
export async function batchAnalyzeSentiment(
  reviews: Array<{ id: string; comment: string; target_type: 'course' | 'professor' }>
): Promise<{ successful: number; failed: number; errors: string[] }> {
  let successful = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const review of reviews) {
    try {
      const result = await triggerSentimentAnalysis(
        review.id,
        review.comment,
        review.target_type
      );

      if (result.success) {
        successful++;
      } else {
        failed++;
        errors.push(`Review ${review.id}: ${result.error}`);
      }

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      failed++;
      errors.push(`Review ${review.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { successful, failed, errors };
}

/**
 * Get sentiment statistics for a course or professor
 */
export async function getSentimentStats(
  targetId: string,
  targetType: 'course' | 'professor'
) {
  try {
    const table = targetType === 'course' ? 'courses' : 'professors';
    
    const { data, error } = await supabase
      .from(table)
      .select('sentiment_score, sentiment_distribution, aspect_sentiments, sentiment_updated_at')
      .eq('id', targetId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      sentimentScore: data.sentiment_score,
      sentimentDistribution: data.sentiment_distribution,
      aspectSentiments: data.aspect_sentiments,
      lastUpdated: data.sentiment_updated_at,
    };
  } catch (error) {
    console.error('Error fetching sentiment stats:', error);
    return null;
  }
}

/**
 * Helper to get sentiment label from score
 */
export function getSentimentLabel(score: number): string {
  if (score >= 4.5) return 'very_positive';
  if (score >= 3.5) return 'positive';
  if (score >= 2.5) return 'neutral';
  if (score >= 1.5) return 'negative';
  return 'very_negative';
}

/**
 * Helper to get emotion color/badge
 */
export function getEmotionColor(emotion: string | null): string {
  if (!emotion) return 'gray';
  
  const emotionColors: Record<string, string> = {
    satisfied: 'green',
    excited: 'blue',
    grateful: 'purple',
    neutral: 'gray',
    frustrated: 'orange',
    disappointed: 'red',
    overwhelmed: 'yellow',
  };

  return emotionColors[emotion.toLowerCase()] || 'gray';
}
