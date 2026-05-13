/**
 * Sentiment Analysis Testing Guide
 * 
 * This file provides examples and instructions for testing the sentiment analysis implementation
 */

import { supabaseAdmin } from '@/lib/supabase-admin';

// ============================================================================
// MANUAL TESTING INSTRUCTIONS
// ============================================================================

/**
 * 1. TEST SENTIMENT ANALYSIS API
 * 
 * After submitting a review through the UI, you can manually test the API:
 * 
 * curl -X POST http://localhost:3000/api/analyze-sentiment \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "reviewId": "your-review-uuid",
 *     "comment": "This course was excellent! The professor explained concepts clearly and the assignments were challenging but fair.",
 *     "targetType": "course"
 *   }'
 * 
 * Expected Response:
 * {
 *   "success": true,
 *   "data": {
 *     "reviewId": "...",
 *     "overallSentiment": 4.5,
 *     "overallConfidence": 0.85,
 *     "aspectSentiments": { ... },
 *     "primaryEmotion": "satisfied",
 *     "emotionIntensity": 0.8
 *   }
 * }
 */

/**
 * 2. TEST BATCH PROCESSING
 * 
 * Check how many reviews need analysis:
 * 
 * curl http://localhost:3000/api/batch-analyze-sentiment
 * 
 * Process pending reviews:
 * 
 * curl -X POST http://localhost:3000/api/batch-analyze-sentiment \
 *   -H "Content-Type: application/json" \
 *   -d '{"limit": 10}'
 */

/**
 * 3. TEST REVIEW SUBMISSION FLOW
 * 
 * Steps:
 * 1. Go to a course page
 * 2. Click "Rate This Course"
 * 3. Submit a rating with a detailed comment (>10 characters)
 * 4. Review should be saved immediately
 * 5. Check browser console - you should see sentiment analysis triggered
 * 6. Wait a few seconds, then check the database
 * 7. Query: SELECT * FROM review_sentiments WHERE review_id = 'your-review-id';
 * 8. Should see the sentiment data populated
 */

// ============================================================================
// AUTOMATED TEST EXAMPLES
// ============================================================================

/**
 * Test Case 1: Validate Input Preprocessing
 */
export async function testInputValidation() {
  console.log('Testing input validation...');
  
  const testCases = [
    {
      name: 'Comment too short',
      comment: 'Good',
      expectError: true,
    },
    {
      name: 'Valid comment',
      comment: 'This course was really great and I learned a lot from it.',
      expectError: false,
    },
    {
      name: 'Empty comment',
      comment: '',
      expectError: true,
    },
    {
      name: 'Only spaces',
      comment: '    ',
      expectError: true,
    },
  ];

  for (const test of testCases) {
    try {
      const response = await fetch('/api/analyze-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: 'test-uuid',
          comment: test.comment,
          targetType: 'course',
        }),
      });

      const data = await response.json();
      
      if (test.expectError && response.ok) {
        console.error(`❌ ${test.name}: Expected error but got success`);
      } else if (!test.expectError && !response.ok) {
        console.error(`❌ ${test.name}: Expected success but got error`);
      } else {
        console.log(`✅ ${test.name}: Passed`);
      }
    } catch (error) {
      console.error(`❌ ${test.name}: ${error}`);
    }
  }
}

/**
 * Test Case 2: Verify Database Triggers
 */
export async function testDatabaseTriggers() {
  console.log('Testing database triggers...');
  
  try {
    // 1. Get a course with reviews
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id, sentiment_score, sentiment_distribution')
      .limit(1)
      .single();

    if (!course) {
      console.log('⚠️ No courses found to test');
      return;
    }

    console.log('Course before:', course);

    // 2. Get a review for this course
    const { data: review } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('target_id', course.id)
      .eq('target_type', 'course')
      .limit(1)
      .single();

    if (!review) {
      console.log('⚠️ No reviews found to test');
      return;
    }

    // 3. Insert a test sentiment
    await supabaseAdmin
      .from('review_sentiments')
      .upsert({
        review_id: review.id,
        overall_sentiment: 4.5,
        overall_confidence: 0.85,
        aspect_sentiments: { content: { score: 5, confidence: 0.9 } },
        primary_emotion: 'satisfied',
        emotion_intensity: 0.8,
        model_version: 'test',
        processed_at: new Date().toISOString(),
      });

    // 4. Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. Check if course sentiment was updated
    const { data: updatedCourse } = await supabaseAdmin
      .from('courses')
      .select('sentiment_score, sentiment_distribution, sentiment_updated_at')
      .eq('id', course.id)
      .single();

    console.log('Course after:', updatedCourse);

    if (updatedCourse?.sentiment_updated_at) {
      console.log('✅ Database trigger working correctly');
    } else {
      console.log('❌ Database trigger may not be working');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

/**
 * Test Case 3: Error Handling
 */
export async function testErrorHandling() {
  console.log('Testing error handling...');

  const testCases = [
    {
      name: 'Missing reviewId',
      body: { comment: 'Test', targetType: 'course' },
      expectedStatus: 400,
    },
    {
      name: 'Invalid targetType',
      body: { reviewId: 'test', comment: 'Test comment here', targetType: 'invalid' },
      expectedStatus: 400,
    },
    {
      name: 'Non-existent review',
      body: { 
        reviewId: '00000000-0000-0000-0000-000000000000', 
        comment: 'Test comment here', 
        targetType: 'course' 
      },
      expectedStatus: 404,
    },
  ];

  for (const test of testCases) {
    try {
      const response = await fetch('/api/analyze-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.body),
      });

      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: Correct status ${test.expectedStatus}`);
      } else {
        console.error(`❌ ${test.name}: Expected ${test.expectedStatus}, got ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${test.name}: ${error}`);
    }
  }
}

/**
 * Test Case 4: Verify Sentiment Utils
 */
export async function testSentimentUtils() {
  console.log('Testing sentiment utility functions...');

  try {
    // Import utilities
    const { 
      getSentimentLabel, 
      getEmotionColor 
    } = await import('@/lib/sentiment-utils');

    // Test sentiment label mapping
    const sentimentTests = [
      { score: 5, expected: 'very_positive' },
      { score: 4.5, expected: 'very_positive' },
      { score: 4, expected: 'positive' },
      { score: 3, expected: 'neutral' },
      { score: 2, expected: 'negative' },
      { score: 1, expected: 'very_negative' },
    ];

    for (const test of sentimentTests) {
      const result = getSentimentLabel(test.score);
      if (result === test.expected) {
        console.log(`✅ Sentiment label for ${test.score}: ${result}`);
      } else {
        console.error(`❌ Expected ${test.expected}, got ${result}`);
      }
    }

    // Test emotion color mapping
    const emotionTests = [
      'satisfied',
      'frustrated',
      'excited',
      'neutral',
    ];

    for (const emotion of emotionTests) {
      const color = getEmotionColor(emotion);
      console.log(`✅ Emotion ${emotion}: ${color}`);
    }

  } catch (error) {
    console.error('❌ Utility test failed:', error);
  }
}

// ============================================================================
// INTEGRATION TEST WORKFLOW
// ============================================================================

/**
 * Complete integration test workflow
 * Run this after starting the development server
 */
export async function runFullTest() {
  console.log('🧪 Starting Full Sentiment Analysis Test Suite\n');

  console.log('📋 Test 1: Input Validation');
  await testInputValidation();
  console.log('');

  console.log('📋 Test 2: Database Triggers');
  await testDatabaseTriggers();
  console.log('');

  console.log('📋 Test 3: Error Handling');
  await testErrorHandling();
  console.log('');

  console.log('📋 Test 4: Utility Functions');
  await testSentimentUtils();
  console.log('');

  console.log('✅ Test suite completed!\n');
}

// ============================================================================
// SQL QUERIES FOR MANUAL VERIFICATION
// ============================================================================

/**
 * Useful SQL queries for checking sentiment data:
 * 
 * -- Check if sentiment analysis is running
 * SELECT COUNT(*) FROM review_sentiments;
 * 
 * -- Get recent sentiment analyses
 * SELECT 
 *   rs.review_id,
 *   rs.overall_sentiment,
 *   rs.primary_emotion,
 *   rs.processed_at,
 *   r.comment
 * FROM review_sentiments rs
 * JOIN reviews r ON rs.review_id = r.id
 * ORDER BY rs.processed_at DESC
 * LIMIT 10;
 * 
 * -- Check aggregated course sentiments
 * SELECT 
 *   c.code,
 *   c.title,
 *   c.sentiment_score,
 *   c.sentiment_distribution,
 *   c.review_count
 * FROM courses c
 * WHERE c.sentiment_score > 0
 * ORDER BY c.sentiment_score DESC
 * LIMIT 10;
 * 
 * -- Find reviews without sentiment analysis
 * SELECT r.id, r.comment, r.target_type
 * FROM reviews r
 * LEFT JOIN review_sentiments rs ON r.id = rs.review_id
 * WHERE r.comment IS NOT NULL
 *   AND rs.id IS NULL
 * LIMIT 10;
 * 
 * -- Check sentiment distribution
 * SELECT 
 *   get_sentiment_label(overall_sentiment) as sentiment,
 *   COUNT(*) as count
 * FROM review_sentiments
 * GROUP BY get_sentiment_label(overall_sentiment)
 * ORDER BY count DESC;
 */

// Export for use in other test files
export default {
  testInputValidation,
  testDatabaseTriggers,
  testErrorHandling,
  testSentimentUtils,
  runFullTest,
};
