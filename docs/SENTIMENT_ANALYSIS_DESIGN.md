# Sentiment Analysis Design Document
**RateMyCourse - Week 1 Deliverable**

---

## 1. Executive Summary

This document finalizes the sentiment analysis approach for the RateMyCourse platform. The goal is to automatically analyze student review comments to extract sentiment insights, providing students with quick, data-driven understanding of course and professor experiences.

---

## 2. Sentiment Analysis Approach

### 2.1 Overall Strategy

We will implement a **hybrid sentiment analysis system** that combines:

1. **AI-Powered Analysis**: Leverage Google Gemini API (already integrated) for nuanced sentiment extraction
2. **Multi-Dimensional Sentiment**: Go beyond simple positive/negative to capture aspect-based sentiment
3. **Aggregated Insights**: Compute sentiment scores at review, course, and professor levels
4. **Real-time Processing**: Analyze sentiment when reviews are submitted

### 2.2 Why This Approach?

- **Existing Infrastructure**: We already use Gemini API successfully for theme extraction
- **Accuracy**: AI models excel at understanding context, sarcasm, and nuanced opinions
- **Scalability**: Gemini can handle varying review lengths and styles
- **Cost-Effective**: Gemini 1.5 Flash is efficient for production use
- **Maintainability**: Minimal ML infrastructure required

---

## 3. Preprocessing Pipeline Design

### 3.1 Input Data Flow

```
Review Submission → Validation → Text Preprocessing → Sentiment Detection → Storage → Aggregation
```

### 3.2 Text Preprocessing Steps

#### Step 1: Input Validation
```typescript
interface ReviewInput {
  comment: string;
  rating_value: number;
  difficulty_rating?: number;
  workload_rating?: number;
  // ... other ratings
}

function validateReviewInput(input: ReviewInput): boolean {
  // Minimum length requirement (e.g., 10 characters)
  // Maximum length enforcement (e.g., 2000 characters)
  // Profanity filtering
  // Spam detection
}
```

#### Step 2: Text Cleaning
- **Trim whitespace**: Remove leading/trailing spaces
- **Normalize unicode**: Handle special characters, emojis
- **Preserve context**: Keep punctuation that affects sentiment (!, ?, ...)
- **Case normalization**: Convert to lowercase for consistency (but preserve for AI)

#### Step 3: Content Filtering
- Filter out reviews that are too short (< 10 words)
- Flag potentially spam/abusive content
- Identify language (support English primarily)

#### Step 4: Context Enrichment
Combine comment with numerical ratings for better sentiment understanding:
```typescript
interface EnrichedReview {
  comment: string;
  overallRating: number;      // 1-5
  difficultyRating?: number;  // 1-5
  workloadRating?: number;    // 1-5
  // For professors:
  knowledgeRating?: number;
  teachingRating?: number;
  approachabilityRating?: number;
}
```

---

## 4. Sentiment Categories

### 4.1 Overall Sentiment Scale

**Primary Sentiment** (5-point scale for granularity):
- **Very Positive** (5): Enthusiastic, highly recommended
- **Positive** (4): Generally favorable, recommended
- **Neutral** (3): Balanced, mixed feelings
- **Negative** (2): Generally unfavorable, concerns
- **Very Negative** (1): Strong criticism, not recommended

### 4.2 Aspect-Based Sentiment

For **Courses**:
```typescript
interface CourseSentiment {
  overall: SentimentScore;
  aspects: {
    content: SentimentScore;        // Course material quality
    instruction: SentimentScore;    // Teaching effectiveness
    workload: SentimentScore;       // Time commitment
    difficulty: SentimentScore;     // Challenge level
    assignments: SentimentScore;    // Projects/homework quality
    exams: SentimentScore;          // Assessment fairness
    practical: SentimentScore;      // Real-world applicability
    interest: SentimentScore;       // Engagement level
  };
  emotion: EmotionType;  // frustrated, excited, satisfied, overwhelmed, etc.
  confidence: number;    // 0-1 confidence score
}
```

For **Professors**:
```typescript
interface ProfessorSentiment {
  overall: SentimentScore;
  aspects: {
    teaching: SentimentScore;        // Teaching style
    knowledge: SentimentScore;       // Subject expertise
    approachability: SentimentScore; // Accessibility
    clarity: SentimentScore;         // Explanation quality
    responsiveness: SentimentScore;  // Communication
    fairness: SentimentScore;        // Grading fairness
    engagement: SentimentScore;      // Student interaction
  };
  emotion: EmotionType;
  confidence: number;
}
```

### 4.3 Emotion Detection

Beyond sentiment polarity, detect emotional tones:
- **Positive Emotions**: excited, inspired, satisfied, grateful, motivated
- **Negative Emotions**: frustrated, overwhelmed, disappointed, confused, stressed
- **Neutral Emotions**: indifferent, uncertain, calm

---

## 5. Backend API & Database Design

### 5.1 Database Schema Changes

#### New Table: `review_sentiments`
```sql
CREATE TABLE review_sentiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  
  -- Overall sentiment
  overall_sentiment INTEGER NOT NULL CHECK (overall_sentiment BETWEEN 1 AND 5),
  overall_confidence NUMERIC(3,2) CHECK (overall_confidence BETWEEN 0 AND 1),
  
  -- Aspect-based sentiments (JSON for flexibility)
  aspect_sentiments JSONB NOT NULL DEFAULT '{}',
  -- Example: {"content": 4, "workload": 2, "difficulty": 3, "instruction": 5}
  
  -- Emotion detection
  primary_emotion TEXT,
  emotion_intensity NUMERIC(3,2),
  
  -- Metadata
  model_version TEXT NOT NULL DEFAULT 'gemini-flash-latest',
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Raw AI response for debugging/reprocessing
  raw_response JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_sentiments_review_id ON review_sentiments(review_id);
CREATE INDEX idx_review_sentiments_overall ON review_sentiments(overall_sentiment);
```

#### Add to `courses` table:
```sql
ALTER TABLE courses ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3,2) DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS sentiment_distribution JSONB DEFAULT '{
  "very_positive": 0,
  "positive": 0,
  "neutral": 0,
  "negative": 0,
  "very_negative": 0
}'::jsonb;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS aspect_sentiments JSONB DEFAULT '{}'::jsonb;
```

#### Add to `professors` table:
```sql
ALTER TABLE professors ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3,2) DEFAULT 0;
ALTER TABLE professors ADD COLUMN IF NOT EXISTS sentiment_distribution JSONB DEFAULT '{
  "very_positive": 0,
  "positive": 0,
  "neutral": 0,
  "negative": 0,
  "very_negative": 0
}'::jsonb;
ALTER TABLE professors ADD COLUMN IF NOT EXISTS aspect_sentiments JSONB DEFAULT '{}'::jsonb;
```

### 5.2 API Endpoints

#### 5.2.1 Analyze Review Sentiment (Internal)
```typescript
// POST /api/sentiment/analyze
interface AnalyzeSentimentRequest {
  reviewId: string;
  comment: string;
  targetType: 'course' | 'professor';
  ratings: {
    overall: number;
    difficulty?: number;
    workload?: number;
    knowledge?: number;
    teaching?: number;
    approachability?: number;
  };
}

interface AnalyzeSentimentResponse {
  reviewId: string;
  sentiment: {
    overall: number;        // 1-5
    confidence: number;     // 0-1
    aspects: Record<string, number>;
    emotion: string;
    emotionIntensity: number;
  };
  success: boolean;
}
```

#### 5.2.2 Get Aggregated Sentiment
```typescript
// GET /api/sentiment/course/:courseId
// GET /api/sentiment/professor/:professorId
interface AggregatedSentimentResponse {
  overallScore: number;  // 1-5
  distribution: {
    veryPositive: number;
    positive: number;
    neutral: number;
    negative: number;
    veryNegative: number;
  };
  aspectSentiments: Record<string, number>;
  topEmotions: Array<{ emotion: string; count: number }>;
  totalReviews: number;
  recentTrend: 'improving' | 'declining' | 'stable';
}
```

#### 5.2.3 Batch Reprocess Sentiments
```typescript
// POST /api/sentiment/reprocess
// For updating existing reviews with sentiment analysis
interface ReprocessRequest {
  targetId?: string;
  targetType?: 'course' | 'professor';
  limit?: number;
}
```

---

## 6. AI Prompt Engineering

### 6.1 Gemini Prompt Template

```typescript
const SENTIMENT_ANALYSIS_PROMPT = `You are an expert at analyzing student course reviews for sentiment.

Analyze the following review and extract detailed sentiment information.

REVIEW DETAILS:
- Comment: "${comment}"
- Overall Rating: ${overallRating}/5
- Difficulty: ${difficultyRating}/5
- Workload: ${workloadRating}/5

TASK:
Analyze the sentiment on multiple dimensions and return a JSON response.

For a COURSE review, analyze these aspects:
1. content - quality of course material
2. instruction - teaching effectiveness
3. workload - time commitment satisfaction
4. difficulty - appropriate challenge level
5. assignments - quality of coursework
6. exams - assessment satisfaction
7. practical - real-world applicability
8. interest - engagement level

For a PROFESSOR review, analyze these aspects:
1. teaching - teaching style and methods
2. knowledge - subject matter expertise
3. approachability - accessibility to students
4. clarity - explanation quality
5. responsiveness - communication timeliness
6. fairness - grading fairness perception
7. engagement - student interaction

SENTIMENT SCALE:
5 = Very Positive
4 = Positive
3 = Neutral/Mixed
2 = Negative
1 = Very Negative

EMOTIONS (choose one):
Positive: excited, inspired, satisfied, grateful, motivated
Negative: frustrated, overwhelmed, disappointed, confused, stressed
Neutral: indifferent, uncertain, calm

Return ONLY valid JSON in this exact format:
{
  "overall": 4,
  "confidence": 0.85,
  "aspects": {
    "content": 4,
    "instruction": 5,
    "workload": 2,
    "difficulty": 3
  },
  "emotion": "satisfied",
  "emotionIntensity": 0.7,
  "reasoning": "Brief explanation of the sentiment analysis"
}

IMPORTANT:
- Consider both the comment text AND the numerical ratings
- If ratings contradict the comment, note lower confidence
- Provide confidence between 0 and 1
- Be objective and balanced
- Return ONLY the JSON, no other text`;
```

### 6.2 Prompt Optimization Strategy

- **Temperature**: 0.3 (low for consistent, factual analysis)
- **topK**: 20 (focused on most likely tokens)
- **topP**: 0.8 (balanced creativity and consistency)
- **maxOutputTokens**: 400 (sufficient for detailed JSON)

---

## 7. Error Handling & Edge Cases

### 7.1 Error Scenarios

1. **Empty/Short Comments**: 
   - Fall back to rating-based sentiment
   - Confidence score < 0.3

2. **API Failures**:
   - Retry with exponential backoff (3 attempts)
   - Queue for later processing if still fails
   - Alert monitoring system

3. **Invalid JSON Response**:
   - Parse errors logged
   - Fallback to basic sentiment extraction
   - Re-queue for reprocessing

4. **Contradictory Signals**:
   - Low rating + positive comment → confidence < 0.5
   - Flag for manual review if extreme contradiction

5. **Non-English Content**:
   - Detect language
   - Attempt translation or mark as unsupported

### 7.2 Data Quality Assurance

```typescript
interface SentimentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateSentiment(sentiment: any): SentimentValidation {
  const errors = [];
  const warnings = [];
  
  // Check required fields
  if (!sentiment.overall || sentiment.overall < 1 || sentiment.overall > 5) {
    errors.push('Invalid overall sentiment score');
  }
  
  // Check confidence
  if (sentiment.confidence < 0 || sentiment.confidence > 1) {
    errors.push('Invalid confidence score');
  }
  
  // Warn on low confidence
  if (sentiment.confidence < 0.3) {
    warnings.push('Low confidence sentiment analysis');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

---

## 8. Performance & Scalability Considerations

### 8.1 Processing Strategy

- **Asynchronous Processing**: Don't block review submission
- **Queue System**: Use job queue for sentiment analysis
- **Batch Processing**: Process multiple reviews in parallel
- **Caching**: Cache aggregated sentiment for 5 minutes

### 8.2 Rate Limiting

- Gemini API: ~60 requests/minute (free tier)
- Implement request queuing and throttling
- Consider upgrading to paid tier for production

### 8.3 Cost Estimation

- Gemini 1.5 Flash: $0.075 per 1M input tokens
- Average review: ~200 tokens
- 1000 reviews/month: ~$0.015
- Very cost-effective for academic platform

---

## 9. Testing Strategy

### 9.1 Test Data Sets

Create diverse review samples:
1. **Clearly Positive**: "Best course ever! Prof was amazing!"
2. **Clearly Negative**: "Waste of time, terrible experience"
3. **Mixed Sentiment**: "Great content but too much work"
4. **Sarcastic**: "Yeah, 'easy' course if you don't sleep"
5. **Neutral**: "Standard introductory course"
6. **Short**: "Good"
7. **Long**: Detailed multi-paragraph review

### 9.2 Validation Metrics

- **Accuracy**: Compare AI sentiment with manual labels
- **Consistency**: Same review → same sentiment
- **Confidence Calibration**: High confidence → accurate predictions
- **Aspect Extraction**: Correctly identify mentioned aspects

---

## 10. Implementation Phases

### Week 1 (Current) - Design ✅
- [x] Finalize sentiment approach
- [ ] Design preprocessing pipeline
- [ ] Define sentiment categories
- [ ] Design backend API & DB fields

### Week 2 - Backend Implementation
- [ ] Create database migrations
- [ ] Implement sentiment API endpoint
- [ ] Build preprocessing pipeline
- [ ] Integrate with review submission flow
- [ ] Error handling & logging

### Week 3 - Frontend Integration
- [ ] Build aggregation queries
- [ ] Create sentiment UI components
- [ ] Display sentiment indicators
- [ ] Testing & debugging

---

## 11. Future Enhancements

1. **Trend Analysis**: Track sentiment over time (by semester)
2. **Comparative Sentiment**: Compare courses in same department
3. **Predictive Insights**: "Students who liked X also liked Y"
4. **Multi-Language Support**: Support Hindi, regional languages
5. **Fine-tuned Model**: Train custom model on domain data
6. **Real-time Alerts**: Notify if sentiment drops significantly

---

## 12. Appendix

### A. Type Definitions

```typescript
// src/types/sentiment.ts
export type SentimentScore = 1 | 2 | 3 | 4 | 5;

export type EmotionType = 
  | 'excited' | 'inspired' | 'satisfied' | 'grateful' | 'motivated'
  | 'frustrated' | 'overwhelmed' | 'disappointed' | 'confused' | 'stressed'
  | 'indifferent' | 'uncertain' | 'calm';

export interface ReviewSentiment {
  id: string;
  reviewId: string;
  overallSentiment: SentimentScore;
  overallConfidence: number;
  aspectSentiments: Record<string, SentimentScore>;
  primaryEmotion: EmotionType;
  emotionIntensity: number;
  modelVersion: string;
  processedAt: Date;
  rawResponse?: any;
  createdAt: Date;
}

export interface AggregatedSentiment {
  overallScore: number;
  distribution: {
    veryPositive: number;
    positive: number;
    neutral: number;
    negative: number;
    veryNegative: number;
  };
  aspectSentiments: Record<string, number>;
  topEmotions: Array<{ emotion: EmotionType; count: number }>;
  totalReviews: number;
}
```

### B. References

- Google Gemini API Documentation: https://ai.google.dev/docs
- Sentiment Analysis Best Practices: Academic literature
- Aspect-Based Sentiment Analysis (ABSA): Research papers

---

**Document Status**: ✅ Complete  
**Last Updated**: February 10, 2026  
**Author**: RateMyCourse Development Team  
**Next Review**: Week 2 - Implementation Phase
