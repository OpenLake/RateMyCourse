# Sentiment Analysis Feature - Quick Reference

> **Status**: Week 1 Design Phase Complete ✅  
> **Next**: Week 2 Implementation Phase  
> **Project**: RateMyCourse Platform

---

## 🎯 What is This?

Automatic AI-powered sentiment analysis that extracts emotional insights from student course and professor reviews, providing:

- **Overall Sentiment**: 5-point scale (Very Positive → Very Negative)
- **Aspect Analysis**: Granular sentiment for specific dimensions (content, difficulty, teaching, etc.)
- **Emotion Detection**: Identifies student emotions (excited, frustrated, satisfied, etc.)
- **Aggregated Insights**: Course and professor-level sentiment summaries

---

## 📁 File Structure

```
RateMyCourse/
├── docs/
│   ├── SENTIMENT_ANALYSIS_DESIGN.md      # Complete design specification
│   ├── WEEK1_CHECKLIST.md                # Week 1 deliverables & progress
│   └── SENTIMENT_QUICK_REFERENCE.md      # This file
├── src/
│   ├── types/
│   │   └── sentiment.ts                   # TypeScript type definitions
│   ├── lib/
│   │   └── sentiment-config.ts            # Configuration constants
│   ├── migrations/
│   │   └── sentiment_analysis.sql         # Database schema migration
│   └── app/api/
│       └── sentiment/                     # API endpoints (Week 2)
│           ├── analyze/
│           ├── course/[id]/
│           └── professor/[id]/
```

---

## 🗄️ Database Schema

### New Table: `review_sentiments`
```sql
review_sentiments
├── id (UUID, PK)
├── review_id (UUID, FK → reviews.id)
├── overall_sentiment (1-5)
├── overall_confidence (0-1)
├── aspect_sentiments (JSONB)
├── primary_emotion (TEXT)
├── emotion_intensity (0-1)
├── model_version (TEXT)
├── processed_at (TIMESTAMP)
└── raw_response (JSONB)
```

### Extended Tables
**courses**:
- `sentiment_score` - Average sentiment
- `sentiment_distribution` - Count by category
- `aspect_sentiments` - Average per aspect

**professors**:
- Same fields as courses

---

## 🔌 API Endpoints (Week 2)

### 1. Analyze Review Sentiment
```typescript
POST /api/sentiment/analyze

Request:
{
  reviewId: string;
  comment: string;
  targetType: 'course' | 'professor';
  ratings: { overall: number; difficulty?: number; ... }
}

Response:
{
  sentiment: {
    overall: 1-5,
    confidence: 0-1,
    aspects: { content: 4, workload: 2, ... },
    emotion: 'satisfied',
    emotionIntensity: 0.7
  }
}
```

### 2. Get Aggregated Course Sentiment
```typescript
GET /api/sentiment/course/:courseId

Response:
{
  overallScore: 4.2,
  distribution: {
    veryPositive: 45,
    positive: 30,
    neutral: 15,
    negative: 8,
    veryNegative: 2
  },
  aspectSentiments: {
    content: 4.5,
    workload: 2.8,
    difficulty: 3.2
  },
  topEmotions: [
    { emotion: 'satisfied', count: 50 },
    { emotion: 'overwhelmed', count: 20 }
  ]
}
```

### 3. Get Professor Sentiment
```typescript
GET /api/sentiment/professor/:professorId
// Same structure as course sentiment
```

---

## 🎨 Sentiment Categories

### Overall Sentiment
| Score | Label | Color | Icon |
|-------|-------|-------|------|
| 5 | Very Positive | Green | 😄 |
| 4 | Positive | Lime | 🙂 |
| 3 | Neutral | Yellow | 😐 |
| 2 | Negative | Orange | 😟 |
| 1 | Very Negative | Red | 😞 |

### Course Aspects (8)
1. **Content** - Material quality
2. **Instruction** - Teaching effectiveness
3. **Workload** - Time commitment
4. **Difficulty** - Challenge level
5. **Assignments** - Coursework quality
6. **Exams** - Assessment fairness
7. **Practical** - Real-world value
8. **Interest** - Engagement level

### Professor Aspects (7)
1. **Teaching** - Teaching style
2. **Knowledge** - Expertise
3. **Approachability** - Accessibility
4. **Clarity** - Explanation quality
5. **Responsiveness** - Communication
6. **Fairness** - Grading fairness
7. **Engagement** - Student interaction

### Emotions (13)
**Positive**: excited, inspired, satisfied, grateful, motivated  
**Negative**: frustrated, overwhelmed, disappointed, confused, stressed  
**Neutral**: indifferent, uncertain, calm

---

## 🔧 Configuration

See `src/lib/sentiment-config.ts` for all settings.

**Key Configs**:
```typescript
GEMINI_CONFIG = {
  model: 'gemini-flash-latest',
  temperature: 0.3,
  maxOutputTokens: 400
}

PREPROCESSING_CONFIG = {
  minCommentLength: 10,
  maxCommentLength: 2000,
  minWordCount: 3
}

THRESHOLD_CONFIG = {
  highConfidence: 0.7,
  mediumConfidence: 0.4,
  lowConfidence: 0.3
}
```

---

## 🚀 Usage Examples

### Analyze a Review (Week 2+)
```typescript
import { AnalyzeSentimentRequest } from '@/types/sentiment';

const request: AnalyzeSentimentRequest = {
  reviewId: '123',
  comment: 'Best course ever! Professor was amazing and content was practical.',
  targetType: 'course',
  ratings: {
    overall: 5,
    difficulty: 3,
    workload: 4
  }
};

const response = await fetch('/api/sentiment/analyze', {
  method: 'POST',
  body: JSON.stringify(request)
});

// Result:
// {
//   overall: 5,
//   confidence: 0.95,
//   aspects: { content: 5, instruction: 5, practical: 5 },
//   emotion: 'excited',
//   emotionIntensity: 0.9
// }
```

### Display Sentiment Badge (Week 3+)
```tsx
import { sentimentScoreToLabel, getSentimentColor } from '@/types/sentiment';

function SentimentBadge({ score }: { score: number }) {
  const label = sentimentScoreToLabel(score);
  const color = getSentimentColor(score);
  
  return (
    <div className={`badge badge-${color}`}>
      {label}
    </div>
  );
}
```

---

## 🧪 Testing Strategy

### Test Data Sets
1. ✅ Clearly positive reviews
2. ✅ Clearly negative reviews
3. ✅ Mixed sentiment reviews
4. ✅ Sarcastic reviews
5. ✅ Neutral reviews
6. ✅ Very short reviews
7. ✅ Very long reviews

### Validation Checks
- Overall sentiment in range [1,5]
- Confidence in range [0,1]
- All aspects have valid scores
- Emotion is from predefined list
- Low confidence flagged appropriately

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| Analysis Time | < 2 sec per review |
| Batch Processing | 50 reviews concurrent |
| Cache Duration | 5 min for aggregates |
| API Rate Limit | 60 req/min |
| Accuracy | > 80% agreement with human |
| Confidence (High) | > 70% of reviews |

---

## ⚠️ Error Handling

### Common Scenarios
1. **Empty Comment**: Use rating-based fallback
2. **API Timeout**: Retry 3x with backoff
3. **Invalid JSON**: Parse and retry
4. **Low Confidence**: Flag for review
5. **Rate Limit**: Queue for later

### Error Response
```typescript
{
  success: false,
  error: 'Rate limit exceeded',
  retryAfter: 60 // seconds
}
```

---

## 🔄 Integration Points

### Review Submission Flow
```
User submits review
    ↓
Store in database
    ↓
Trigger sentiment analysis (async)
    ↓
Store sentiment results
    ↓
Update course/professor aggregates (via trigger)
    ↓
Cache cleared
```

### Display Flow
```
User views course/professor
    ↓
Fetch aggregated sentiment (cached)
    ↓
Display sentiment indicators
    ↓
User can filter by sentiment
```

---

## 📈 Monitoring

### Key Metrics to Track
- Analysis success rate
- Average confidence scores
- Processing time percentiles
- API error rates
- Sentiment distribution shifts
- Low confidence review count

### Alerts
- Success rate < 90%
- Average processing time > 3s
- Confidence < 0.3 for > 20% reviews
- API errors > 10% of requests

---

## 🛠️ Development Workflow

### Week 2 (Backend)
1. Execute database migration
2. Implement `/api/sentiment/analyze`
3. Build preprocessing pipeline
4. Integrate with review flow
5. Testing and error handling

### Week 3 (Frontend)
1. Create sentiment UI components
2. Build aggregation displays
3. Add filtering/sorting by sentiment
4. Integrate with course/professor pages
5. User testing and refinements

---

## 🔗 Related Features

This sentiment analysis powers:
- ✅ Course comparison (Week 4-6)
- ✅ Summary generation (already exists, can be enhanced)
- ✅ Theme extraction (already exists, complements sentiment)
- 🔮 Future: Recommendations
- 🔮 Future: Trend analysis dashboard
- 🔮 Future: Alert system

---

## 📚 Additional Resources

### Documentation
- [Full Design Doc](./SENTIMENT_ANALYSIS_DESIGN.md) - Complete specification
- [Week 1 Checklist](./WEEK1_CHECKLIST.md) - Deliverables and progress
- [Course Comparison Feature](./COURSE_COMPARISON_FEATURE.md) - Related feature

### Code References
- `src/app/api/extract-themes/route.ts` - Similar Gemini integration
- `src/app/api/generate-summary/route.ts` - Gemini prompt example
- `src/types/index.ts` - Existing type definitions

---

## 💡 Tips & Best Practices

### For Backend Developers
- Always validate AI responses before storing
- Log raw responses for debugging
- Use transactions for data consistency
- Implement proper retry logic
- Monitor API costs

### For Frontend Developers
- Cache aggregated sentiment aggressively
- Show loading states during analysis
- Handle missing sentiment gracefully
- Use color-coding consistently
- Provide context for sentiment scores

### For Database Administrators
- Monitor JSONB query performance
- Keep indexes up to date
- Review trigger execution times
- Plan for data growth
- Test migration thoroughly before production

---

## 🎓 Domain Knowledge

### Academic Review Sentiment
- Students use varied language
- Sarcasm is common ("'easy' course")
- Context matters (ratings + text)
- Aspect-based > overall sentiment
- Temporal trends are valuable

### Course vs Professor Sentiment
**Courses**: Focus on content, workload, difficulty  
**Professors**: Focus on teaching, accessibility, fairness

---

## 🔐 Security & Privacy

- No PII in sentiment data
- Reviews already anonymous
- Sentiment aggregates are public
- Raw AI responses stored securely
- Audit log for reprocessing

---

## 📞 Support

**Questions?** Check:
1. [Full Design Doc](./SENTIMENT_ANALYSIS_DESIGN.md)
2. [Week 1 Checklist](./WEEK1_CHECKLIST.md)
3. Existing API implementations
4. Supabase documentation

**Need Help?**
- Open GitHub issue
- Contact maintainers
- Review similar implementations

---

**Last Updated**: February 10, 2026  
**Version**: 1.0 (Week 1 Design Complete)  
**Next Review**: Week 2 Implementation Phase
