# Sentiment Analysis Backend - Implementation Summary

## ✅ Implementation Status

All required sentiment analysis backend features have been successfully implemented:

### 1. ✅ Sentiment Detection Logic
**Location:** `/src/app/api/analyze-sentiment/route.ts`

**Features:**
- Integrates with Gemini AI API for sentiment analysis
- Aspect-based sentiment analysis (different aspects for courses vs professors)
- Overall sentiment scoring (1-5 scale)
- Confidence scores for reliability assessment
- Emotion detection (satisfied, frustrated, excited, etc.)
- Emotion intensity measurement

**Key Functions:**
- `analyzeWithGemini()` - Core sentiment analysis using Gemini API
- `preprocessComment()` - Input validation and preprocessing
- `storeSentimentResult()` - Persist analysis to database

### 2. ✅ Integration with Review Flow
**Locations:** 
- `/src/pages/api/ratings/route.ts` - Rating submission endpoint
- `/src/components/courses/AddReviewButton.tsx` - Course review UI
- `/src/components/professors/AddReviewButtonProfessor.tsx` - Professor review UI
- `/src/lib/sentiment-utils.ts` - Utility functions

**Integration Points:**
1. **New Review Submission** - When a rating with comment is submitted via `/api/ratings`, sentiment analysis is automatically triggered
2. **Review Update** - When a user adds/updates a comment on existing review, sentiment is re-analyzed
3. **Async Processing** - Sentiment analysis runs asynchronously to not block review submission
4. **Database Triggers** - Automatic aggregation of sentiment scores via PostgreSQL triggers

**Flow:**
```
User submits review with comment
    ↓
Review saved to database
    ↓
Sentiment analysis triggered (async)
    ↓
Gemini API analyzes sentiment
    ↓
Results stored in review_sentiments table
    ↓
Database triggers update aggregated scores
    ↓
Course/Professor sentiment scores updated
```

### 3. ✅ Store Sentiment Scores
**Location:** Database schema in `/src/migrations/sentiment_analysis.sql`

**Database Structure:**
- `review_sentiments` table - Individual review sentiment data
  - overall_sentiment (1-5)
  - overall_confidence (0-1)
  - aspect_sentiments (JSONB)
  - primary_emotion (TEXT)
  - emotion_intensity (0-1)
  - model_version, processed_at, raw_response

- `courses` table additions:
  - sentiment_score
  - sentiment_distribution
  - aspect_sentiments
  - sentiment_updated_at

- `professors` table additions:
  - sentiment_score
  - sentiment_distribution
  - aspect_sentiments
  - sentiment_updated_at

**Automatic Aggregation:**
- PostgreSQL triggers automatically recalculate aggregate scores
- Sentiment distribution categorized (very_positive, positive, neutral, negative, very_negative)
- Aspect sentiments averaged across all reviews

### 4. ✅ Error Handling & Edge Cases
Multiple layers of error handling implemented:

#### A. Input Validation
**Location:** `/src/app/api/analyze-sentiment/route.ts`

```typescript
- Missing required fields (reviewId, comment, targetType)
- Invalid target type (must be 'course' or 'professor')
- Comment too short (< 10 characters)
- Comment too long (> 2000 characters)
- Insufficient word count (< 3 words)
- Review doesn't exist
- Target type mismatch
```

#### B. API Integration Errors
**Location:** `/src/app/api/analyze-sentiment/route.ts`

```typescript
- Missing Gemini API key → 503 Service Unavailable
- Gemini API failures → Retry logic (3 attempts with exponential backoff)
- Empty/invalid responses → Validation and fallback
- Rate limiting → Configured delays between requests
- Malformed JSON responses → Parser handles markdown code blocks
```

**Retry Logic:**
```typescript
- Max retries: 3 (configurable)
- Delay: 1000ms * retry_count (exponential backoff)
- Each retry logged for debugging
```

#### C. Database Errors
**Location:** All API endpoints

```typescript
- Failed to store sentiment → 500 with specific error message
- Failed to fetch reviews → 500 with error details
- Database triggers handle constraint violations
- Transaction rollback on failures
```

#### D. Edge Cases Handled

**Empty/Null Comments:**
- Skipped in batch processing
- Validation prevents analysis of empty comments
- Minimum length requirements enforced

**Duplicate Analysis:**
- Upsert operation (ON CONFLICT) prevents duplicates
- Existing sentiment can be re-analyzed (updates record)

**Missing Configuration:**
- Gemini API key check before processing
- Graceful degradation if sentiment service unavailable
- Review submission succeeds even if sentiment analysis fails

**Rate Limiting:**
- 1 second delay between batch requests
- Configurable limits in sentiment-config.ts
- Prevents API quota exhaustion

**Concurrent Requests:**
- Database triggers handle concurrent updates
- Upsert operations prevent race conditions
- Aggregation functions use transactions

**Invalid Sentiment Data:**
- Response structure validation
- Type checking for all fields
- Default values for missing aspects
- Confidence scores validate assumptions

**Background Processing Failures:**
- Async sentiment analysis doesn't block review submission
- Errors logged but not shown to users
- Failed analyses can be retried via batch endpoint

#### E. Logging & Monitoring
**Implemented throughout codebase:**

```typescript
- All errors logged to console with context
- Success confirmations logged
- API response details captured in raw_response field
- Processing timestamps for tracking
```

#### F. Graceful Degradation
**Behavior when sentiment analysis fails:**

```typescript
1. Review submission always succeeds
2. Sentiment analysis triggered asynchronously
3. If analysis fails:
   - Error logged but review remains valid
   - User can continue using platform
   - Batch endpoint can retry failed analyses
4. Missing sentiment data handled gracefully in UI
```

## Additional Features

### Batch Processing
**Location:** `/src/app/api/batch-analyze-sentiment/route.ts`

- Process multiple reviews at once
- Useful for analyzing existing reviews
- Status endpoint shows progress
- Configurable limits and filters

### Utility Functions
**Location:** `/src/lib/sentiment-utils.ts`

- `triggerSentimentAnalysis()` - Trigger analysis for single review
- `hasSentimentAnalysis()` - Check if review analyzed
- `getSentimentAnalysis()` - Retrieve sentiment data
- `getReviewsNeedingAnalysis()` - Find unanalyzed reviews
- `batchAnalyzeSentiment()` - Process multiple reviews
- `getSentimentStats()` - Get aggregated statistics
- `getSentimentLabel()` - Convert score to label
- `getEmotionColor()` - UI helper for emotion display

## API Endpoints

### 1. POST /api/analyze-sentiment
Analyze sentiment for a single review.

**Request:**
```json
{
  "reviewId": "uuid",
  "comment": "review text",
  "targetType": "course" | "professor"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviewId": "uuid",
    "overallSentiment": 4.2,
    "overallConfidence": 0.85,
    "aspectSentiments": { ... },
    "primaryEmotion": "satisfied",
    "emotionIntensity": 0.7
  }
}
```

### 2. GET /api/analyze-sentiment?reviewId=xxx
Retrieve existing sentiment analysis.

### 3. POST /api/batch-analyze-sentiment
Process multiple reviews.

**Request:**
```json
{
  "limit": 50,
  "targetType": "course",
  "reviewIds": ["uuid1", "uuid2", ...]
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "total": 50,
    "successful": 48,
    "failed": 2,
    "skipped": 0,
    "errors": ["..."]
  }
}
```

### 4. GET /api/batch-analyze-sentiment
Get status of sentiment analysis coverage.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReviewsWithComments": 1000,
    "reviewsAnalyzed": 850,
    "reviewsNeedingAnalysis": 150,
    "analysisPercentage": 85
  }
}
```

## Configuration

All sentiment analysis settings centralized in `/src/lib/sentiment-config.ts`:

- Gemini API parameters
- Text preprocessing rules
- Sentiment thresholds
- Aggregation settings
- Error handling policies
- Feature flags

## Testing Recommendations

1. **Unit Tests:**
   - Test preprocessComment() validation
   - Test sentiment label mapping
   - Test error handling paths

2. **Integration Tests:**
   - Test review submission → sentiment analysis flow
   - Test batch processing with various inputs
   - Test database trigger functionality

3. **E2E Tests:**
   - Submit review and verify sentiment appears
   - Update review and verify sentiment updates
   - Test with various comment lengths and content

4. **Load Tests:**
   - Batch process large number of reviews
   - Monitor API rate limits
   - Verify database performance under load

## Environment Variables Required

```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # or production URL
```

## Migration Instructions

To apply the sentiment analysis database schema:

```bash
# Connect to your Supabase database
psql $DATABASE_URL

# Run the migration
\i src/migrations/sentiment_analysis.sql
```

## Summary

✅ **All four required features implemented:**

1. ✅ **Sentiment detection logic** - Gemini AI integration with aspect-based analysis
2. ✅ **Integration with review flow** - Automatic analysis on review submission/update
3. ✅ **Store sentiment scores** - Complete database schema with triggers
4. ✅ **Handle errors & edge cases** - Comprehensive error handling at all levels

The implementation is production-ready with:
- Robust error handling
- Async processing
- Batch capabilities
- Logging and monitoring
- Graceful degradation
- Configurable parameters
- Full test coverage readiness
