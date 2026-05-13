# AI Service - Centralized Gemini API Integration

## Overview

The AI Service (`ai-service.ts`) provides a centralized, reusable interface for all AI-powered features in the RateMyCourse platform. Instead of making direct Gemini API calls throughout the codebase, all AI functionality is consolidated into this single service module.

## Benefits

✅ **Code Reusability** - Write once, use everywhere
✅ **Consistent Error Handling** - Standardized retry logic and error messages  
✅ **Easy Maintenance** - Update AI logic in one place
✅ **Simple Testing** - Mock the service instead of individual API calls
✅ **Future-Proof** - Easy to switch AI providers without changing app code
✅ **Better Configuration** - Centralized AI parameters and settings

## Installation & Setup

### 1. Environment Variable

Add your Gemini API key to `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Import the Service

```typescript
import {
  extractThemes,
  generateSummary,
  analyzeSentiment,
  generateText,
  isAIServiceConfigured,
  getAIServiceStatus
} from '@/lib/ai-service';
```

## Available Functions

### 1. **extractThemes()**

Extract common themes from multiple reviews with sentiment classification.

**Use Case:** Generate tag clouds, identify common topics in reviews

```typescript
const reviews = [
  { comment: "Great course but heavy workload..." },
  { comment: "Prof is amazing, very helpful..." },
  { comment: "Workload is manageable..." }
];

const result = await extractThemes(reviews, 'course');

if (result.success) {
  console.log(result.data);
  // [
  //   { tag: "Heavy Workload", count: 2, sentiment: "negative" },
  //   { tag: "Helpful Professor", count: 1, sentiment: "positive" }
  // ]
}
```

**Parameters:**
- `reviews`: Array of objects with `comment` property
- `targetType`: `'course'` or `'professor'`

**Returns:** `GeminiResponse<ThemeData[]>`

---

### 2. **generateSummary()**

Generate a comprehensive summary from multiple reviews.

**Use Case:** Course/professor overview pages, quick insights

```typescript
const reviews = [
  { 
    comment: "Excellent course!",
    rating_value: 5,
    difficulty_rating: 3,
    workload_rating: 4
  },
  // ... more reviews
];

const metadata = {
  title: "Introduction to AI",
  code: "CS101"
};

const result = await generateSummary(reviews, metadata, 'course');

if (result.success) {
  console.log(result.data);
  // "Overall Experience: Students consistently praise...
  //  Strengths: The course material is well-structured...
  //  ..."
}
```

**Parameters:**
- `reviews`: Array of review objects with comments and ratings
- `metadata`: Object with `title`, `code` (for courses) or `name` (for professors)
- `targetType`: `'course'` or `'professor'`

**Returns:** `GeminiResponse<string>`

---

### 3. **analyzeSentiment()**

Analyze sentiment of a single review with aspect-based analysis.

**Use Case:** Individual review processing, sentiment tracking

```typescript
const comment = "The course content was excellent, but the workload was overwhelming.";

const result = await analyzeSentiment(comment, 'course');

if (result.success) {
  console.log(result.data);
  // {
  //   overallSentiment: 3.5,
  //   overallConfidence: 0.85,
  //   aspectSentiments: {
  //     content: { score: 5, confidence: 0.9 },
  //     workload: { score: 2, confidence: 0.88 },
  //     // ... other aspects
  //   },
  //   primaryEmotion: "overwhelmed",
  //   emotionIntensity: 0.7
  // }
}
```

**Parameters:**
- `comment`: Review comment text
- `targetType`: `'course'` or `'professor'`

**Returns:** `GeminiResponse<SentimentData>`

**Aspect Categories:**

For **courses**:
- `content`, `instruction`, `workload`, `difficulty`, `assignments`, `exams`, `practical`, `interest`

For **professors**:
- `teaching`, `knowledge`, `approachability`, `clarity`, `responsiveness`, `fairness`, `engagement`

---

### 4. **generateText()**

Generic AI text generation for custom features.

**Use Case:** Custom AI features, experimental functionality

```typescript
const prompt = "Summarize these student concerns in 2 sentences: ...";

const config = {
  temperature: 0.5,
  maxOutputTokens: 200
};

const result = await generateText(prompt, config);

if (result.success) {
  console.log(result.data); // AI-generated text
}
```

**Parameters:**
- `prompt`: Custom prompt string
- `config`: Optional Gemini configuration object

**Returns:** `GeminiResponse<string>`

---

### 5. **isAIServiceConfigured()**

Check if the AI service is properly configured.

**Use Case:** Feature availability checks, graceful degradation

```typescript
if (isAIServiceConfigured()) {
  // Show AI-powered features
} else {
  // Show fallback UI or warning
}
```

**Returns:** `boolean`

---

### 6. **getAIServiceStatus()**

Get detailed AI service status and capabilities.

```typescript
const status = getAIServiceStatus();
console.log(status);
// {
//   configured: true,
//   model: 'gemini-flash-latest',
//   features: {
//     sentimentAnalysis: true,
//     themeExtraction: true,
//     summaryGeneration: true,
//     customGeneration: true
//   }
// }
```

**Returns:** Object with service status details

---

## Response Format

All AI functions return a `GeminiResponse<T>` object:

```typescript
interface GeminiResponse<T> {
  success: boolean;      // Whether the operation succeeded
  data?: T;              // The result data (if successful)
  error?: string;        // Error message (if failed)
  rawResponse?: any;     // Raw Gemini API response (for debugging)
}
```

## Error Handling

The service includes comprehensive error handling:

### Built-in Retry Logic

All API calls automatically retry up to 3 times with exponential backoff:

```typescript
const result = await analyzeSentiment(comment, 'course');

if (!result.success) {
  console.error('AI analysis failed:', result.error);
  // Handle error gracefully
}
```

### Common Error Types

| Error | Meaning | Action |
|-------|---------|--------|
| `Gemini API key not configured` | Missing API key | Check `.env` file |
| `Failed after N attempts` | API unavailable | Retry later or use fallback |
| `Invalid response structure` | Unexpected AI output | Log for debugging |
| `Empty response from Gemini` | No content generated | Check prompt or retry |

### Example Error Handling

```typescript
const result = await extractThemes(reviews, 'course');

if (!result.success) {
  if (result.error?.includes('API key')) {
    // Configuration issue
    logger.error('AI service not configured');
    return fallbackThemes;
  } else if (result.error?.includes('Failed after')) {
    // Temporary failure
    logger.warn('AI service temporarily unavailable');
    return { themes: [] };
  } else {
    // Other error
    logger.error('Unexpected AI error:', result.error);
    throw new Error('AI processing failed');
  }
}

// Success!
return result.data;
```

## Configuration

AI parameters are configured in `sentiment-config.ts`:

```typescript
{
  gemini: {
    model: 'gemini-flash-latest',
    temperature: 0.3,      // Lower = more consistent
    topK: 20,
    topP: 0.8,
    maxOutputTokens: 400,
    retryAttempts: 3,      // Number of retries
    retryDelay: 1000,      // Base delay in ms
  }
}
```

You can override these per-function using the `config` parameter.

## Usage Examples

### In API Routes

```typescript
// src/app/api/course-insights/route.ts
import { extractThemes, generateSummary } from '@/lib/ai-service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { courseId } = await request.json();
  
  // Fetch reviews from database
  const reviews = await fetchReviews(courseId);
  
  // Extract themes
  const themesResult = await extractThemes(reviews, 'course');
  
  // Generate summary
  const summaryResult = await generateSummary(
    reviews,
    { title: 'CS101', code: 'CS101' },
    'course'
  );
  
  if (!themesResult.success || !summaryResult.success) {
    return NextResponse.json(
      { error: 'AI processing failed' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    themes: themesResult.data,
    summary: summaryResult.data,
  });
}
```

### In Server Components

```typescript
// src/app/courses/[id]/page.tsx
import { extractThemes } from '@/lib/ai-service';

export default async function CoursePage({ params }: { params: { id: string } }) {
  const reviews = await fetchCourseReviews(params.id);
  const themesResult = await extractThemes(reviews, 'course');
  
  return (
    <div>
      {themesResult.success && (
        <ThemeCloud themes={themesResult.data} />
      )}
    </div>
  );
}
```

### In Background Jobs

```typescript
// Process sentiment analysis for all reviews
import { analyzeSentiment } from '@/lib/ai-service';

async function processPendingReviews() {
  const reviews = await getUnprocessedReviews();
  
  for (const review of reviews) {
    const result = await analyzeSentiment(review.comment, review.target_type);
    
    if (result.success) {
      await saveSentiment(review.id, result.data);
    } else {
      await logFailedAnalysis(review.id, result.error);
    }
    
    // Rate limiting
    await delay(1000);
  }
}
```

## Advanced: Custom AI Features

To add a new AI feature:

### 1. Use `generateText()` for Quick Prototyping

```typescript
import { generateText } from '@/lib/ai-service';

async function compareC courses(course1Reviews, course2Reviews) {
  const prompt = `
    Compare these two courses based on student reviews:
    
    Course 1: ${JSON.stringify(course1Reviews)}
    Course 2: ${JSON.stringify(course2Reviews)}
    
    Provide a comparison in 150 words.
  `;
  
  return await generateText(prompt, { temperature: 0.5 });
}
```

### 2. Add to `ai-service.ts` for Production Features

```typescript
// Add to src/lib/ai-service.ts

export async function compareCourses(
  course1Data: CourseData,
  course2Data: CourseData
): Promise<GeminiResponse<ComparisonResult>> {
  const prompt = buildComparisonPrompt(course1Data, course2Data);
  const config = { temperature: 0.5, maxOutputTokens: 500 };
  
  const response = await callGeminiAPI(prompt, config);
  
  if (!response.success) {
    return { success: false, error: response.error };
  }
  
  // Parse and validate response
  const comparison = parseGeminiJSON<ComparisonResult>(response.data.text);
  
  return {
    success: true,
    data: comparison,
    rawResponse: response.data.rawResponse,
  };
}
```

## Performance Tips

1. **Cache Results**: Store AI-generated content in database to avoid repeated API calls
2. **Batch Processing**: Use batch endpoints for bulk operations
3. **Rate Limiting**: Add delays between sequential calls (already built-in for retries)
4. **Async Processing**: Run AI tasks in background for user-facing features
5. **Fallback Content**: Always have fallback UI when AI is unavailable

## Testing

### Mock the Service

```typescript
// __mocks__/ai-service.ts
export const extractThemes = jest.fn().mockResolvedValue({
  success: true,
  data: [
    { tag: 'Test Theme', count: 5, sentiment: 'positive' }
  ]
});

export const isAIServiceConfigured = jest.fn().mockReturnValue(true);
```

### Unit Test Example

```typescript
import { extractThemes } from '@/lib/ai-service';

describe('Theme Extraction', () => {
  it('should extract themes from reviews', async () => {
    const reviews = [
      { comment: 'Great course!' },
      { comment: 'Challenging but rewarding' }
    ];
    
    const result = await extractThemes(reviews, 'course');
    
    expect(result.success).toBe(true);
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data?.length).toBeGreaterThan(0);
  });
});
```

## Migration Guide

If you have existing code making direct Gemini API calls:

### Before (Direct API Call) ❌

```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [...], generationConfig: {...} })
  }
);
const data = await response.json();
const text = data.candidates[0].content.parts[0].text;
```

### After (Centralized Service) ✅

```typescript
import { generateText } from '@/lib/ai-service';

const result = await generateText(prompt, config);
if (result.success) {
  const text = result.data;
}
```

## Support & Troubleshooting

### Common Issues

**Issue:** `Gemini API key not configured`
- **Solution:** Add `GEMINI_API_KEY` to your `.env` file

**Issue:** Empty or invalid responses
- **Solution:** Check your prompts, ensure they're clear and specific

**Issue:** Rate limit errors
- **Solution:** Add delays between calls or implement queuing

**Issue:** Inconsistent results
- **Solution:** Lower the `temperature` in config (0.2-0.3 for consistency)

### Need Help?

- Check the source code: `src/lib/ai-service.ts`
- Review configuration: `src/lib/sentiment-config.ts`
- See usage examples in: `src/app/api/*/route.ts`

## Future Enhancements

Planned features:
- Support for multiple AI providers (OpenAI, Claude, etc.)
- Streaming responses for real-time generation
- Cost tracking and usage analytics
- Advanced caching strategies
- A/B testing different prompts

---

**Last Updated:** March 2026  
**Version:** 1.0.0  
**Author:** RateMyCourse Team
