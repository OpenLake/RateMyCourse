# Week 1 - Sentiment Analysis Design Phase
## Completion Checklist & Deliverables

**Project**: RateMyCourse Sentiment Analysis Feature  
**Phase**: Week 1 - Design  
**Status**: ✅ COMPLETE  
**Date**: February 10, 2026  

---

## 📋 Week 1 Tasks

### ✅ Task 1: Finalize Sentiment Approach
**Status**: COMPLETE

**Deliverables**:
- [x] Comprehensive design document created: `docs/SENTIMENT_ANALYSIS_DESIGN.md`
- [x] Hybrid AI-powered approach selected (Gemini API)
- [x] Multi-dimensional sentiment strategy defined
- [x] Aspect-based sentiment framework established

**Key Decisions**:
- ✓ Use Google Gemini 1.5 Flash API (already integrated)
- ✓ 5-point sentiment scale (very positive to very negative)
- ✓ Aspect-based sentiment for courses and professors
- ✓ Emotion detection included
- ✓ Real-time processing with async queue

---

### ✅ Task 2: Design Preprocessing Pipeline
**Status**: COMPLETE

**Deliverables**:
- [x] 4-step preprocessing pipeline documented
- [x] Text validation rules defined
- [x] Content filtering strategy established
- [x] Context enrichment approach specified

**Pipeline Steps**:
1. ✓ Input validation (length, format)
2. ✓ Text cleaning (whitespace, unicode normalization)
3. ✓ Content filtering (profanity, spam detection)
4. ✓ Context enrichment (combine with ratings)

**Configuration**:
- Minimum comment length: 10 characters
- Maximum comment length: 2000 characters
- Minimum word count: 3 words
- Supported languages: English (expandable)

---

### ✅ Task 3: Define Sentiment Categories
**Status**: COMPLETE

**Deliverables**:
- [x] Overall sentiment categories defined (5 levels)
- [x] Aspect-based categories for courses (8 aspects)
- [x] Aspect-based categories for professors (7 aspects)
- [x] Emotion types categorized (13 emotions)
- [x] Type definitions created: `src/types/sentiment.ts`
- [x] Configuration file created: `src/lib/sentiment-config.ts`

**Sentiment Categories**:
- Very Positive (5)
- Positive (4)
- Neutral (3)
- Negative (2)
- Very Negative (1)

**Course Aspects**:
1. Content - Course material quality
2. Instruction - Teaching effectiveness
3. Workload - Time commitment
4. Difficulty - Challenge level
5. Assignments - Coursework quality
6. Exams - Assessment fairness
7. Practical - Real-world applicability
8. Interest - Engagement level

**Professor Aspects**:
1. Teaching - Teaching style
2. Knowledge - Subject expertise
3. Approachability - Accessibility
4. Clarity - Explanation quality
5. Responsiveness - Communication
6. Fairness - Grading fairness
7. Engagement - Student interaction

**Emotions**:
- Positive: excited, inspired, satisfied, grateful, motivated
- Negative: frustrated, overwhelmed, disappointed, confused, stressed
- Neutral: indifferent, uncertain, calm

---

### ✅ Task 4: Design Backend API & DB Fields
**Status**: COMPLETE

**Deliverables**:
- [x] Database schema designed: `src/migrations/sentiment_analysis.sql`
- [x] API endpoints specified in design doc
- [x] Request/response interfaces defined
- [x] Database triggers and functions created
- [x] Indexes optimized for performance

**Database Changes**:

1. **New Table: `review_sentiments`**
   - overall_sentiment (1-5)
   - overall_confidence (0-1)
   - aspect_sentiments (JSONB)
   - primary_emotion
   - emotion_intensity
   - model_version
   - processed_at
   - raw_response (JSONB for debugging)

2. **Extended `courses` Table**
   - sentiment_score
   - sentiment_distribution (JSONB)
   - aspect_sentiments (JSONB)
   - sentiment_updated_at

3. **Extended `professors` Table**
   - sentiment_score
   - sentiment_distribution (JSONB)
   - aspect_sentiments (JSONB)
   - sentiment_updated_at

4. **Functions & Triggers**
   - update_course_sentiment_aggregates()
   - update_professor_sentiment_aggregates()
   - get_sentiment_label()
   - calculate_sentiment_trend()

5. **Views**
   - recent_sentiments
   - course_sentiment_summary
   - professor_sentiment_summary

**API Endpoints Designed**:

1. `POST /api/sentiment/analyze`
   - Analyze individual review sentiment
   - Internal endpoint (called on review submission)

2. `GET /api/sentiment/course/:courseId`
   - Get aggregated course sentiment
   - Public endpoint

3. `GET /api/sentiment/professor/:professorId`
   - Get aggregated professor sentiment
   - Public endpoint

4. `POST /api/sentiment/reprocess`
   - Batch reprocess existing reviews
   - Admin endpoint

---

## 📂 Files Created

### Documentation
- ✅ `docs/SENTIMENT_ANALYSIS_DESIGN.md` - Comprehensive design document (12 sections)
- ✅ `docs/WEEK1_CHECKLIST.md` - This file

### Code
- ✅ `src/types/sentiment.ts` - TypeScript type definitions
- ✅ `src/lib/sentiment-config.ts` - Configuration constants

### Database
- ✅ `src/migrations/sentiment_analysis.sql` - Complete database migration

### Summary
- **Total Files Created**: 5
- **Lines of Code**: ~1,500
- **Documentation Pages**: ~25

---

## 🎯 Design Highlights

### Strengths of This Approach

1. **Leverages Existing Infrastructure**
   - Uses already-integrated Gemini API
   - Minimal new dependencies required
   - Cost-effective ($0.015 per 1000 reviews)

2. **Scalable & Flexible**
   - JSONB storage for evolving aspect definitions
   - Async processing prevents blocking
   - Batch reprocessing capability

3. **Comprehensive Analysis**
   - Multi-dimensional sentiment (not just pos/neg)
   - Aspect-based insights
   - Emotion detection
   - Trend analysis

4. **Production-Ready Design**
   - Error handling specified
   - Validation at multiple levels
   - Performance optimization (indexes, triggers)
   - Monitoring and alerting planned

5. **Future-Proof**
   - Easy model version updates
   - Raw response storage for reprocessing
   - Configurable thresholds
   - Feature flags for gradual rollout

---

## 🔄 Integration with Existing Features

### Already Leveraged
- ✅ Gemini API integration (from `extract-themes` and `generate-summary`)
- ✅ Review database schema
- ✅ Supabase client configuration
- ✅ TypeScript type system

### Will Integrate With
- Review submission flow
- Course detail pages
- Professor detail pages
- Search/filter functionality
- Dashboard analytics

---

## 📊 Technical Specifications

### AI Configuration
- **Model**: Gemini 1.5 Flash
- **Temperature**: 0.3 (consistent analysis)
- **Top K**: 20
- **Top P**: 0.8
- **Max Tokens**: 400

### Performance Targets
- **Analysis Time**: < 2 seconds per review
- **Batch Processing**: 50 reviews concurrently
- **Cache Duration**: 5 minutes for aggregates
- **API Rate Limit**: 60 requests/minute

### Quality Metrics
- **Minimum Confidence**: 0.3 (below this, flag for review)
- **High Confidence**: > 0.7
- **Minimum Reviews for Trend**: 5
- **Trend Window**: 30 days

---

## ⚠️ Identified Challenges & Mitigations

### Challenge 1: API Rate Limits
**Mitigation**: 
- Implement request queuing
- Batch processing with delays
- Consider paid tier for production

### Challenge 2: Sarcasm Detection
**Mitigation**:
- AI models handle context well
- Low confidence scores for unclear cases
- Manual review option for disputed sentiments

### Challenge 3: Cold Start (No Reviews)
**Mitigation**:
- Graceful handling with clear messaging
- Show when sentiment becomes available
- "Be the first to review" prompts

### Challenge 4: Data Migration
**Mitigation**:
- Batch reprocessing endpoint designed
- Process existing reviews gradually
- Monitor for errors and adjust

---

## 📈 Success Metrics

### Week 1 (Design) - ✅ ACHIEVED
- [x] Complete design document
- [x] All sentiment categories defined
- [x] Database schema finalized
- [x] API contracts specified
- [x] Type definitions created
- [x] Configuration system built

### Week 2 (Backend Implementation) - UPCOMING
- [ ] Database migration executed
- [ ] Sentiment API endpoints implemented
- [ ] Preprocessing pipeline coded
- [ ] Integration with review flow
- [ ] Error handling complete
- [ ] Unit tests passing

### Week 3 (Frontend Integration) - PLANNED
- [ ] Aggregation queries working
- [ ] UI components created
- [ ] Sentiment displays integrated
- [ ] All edge cases handled
- [ ] User testing complete

---

## 🗓️ Next Steps (Week 2 Preview)

### Priority 1: Database Setup
1. Review and test migration script
2. Execute migration on development database
3. Verify triggers and functions
4. Test aggregate calculations

### Priority 2: Core API Implementation
1. Create `/api/sentiment/analyze` endpoint
2. Implement Gemini prompt engineering
3. Build preprocessing pipeline
4. Add error handling and retries

### Priority 3: Integration
1. Hook into review submission flow
2. Test with sample data
3. Verify aggregation accuracy
4. Performance testing

### Priority 4: Testing
1. Unit tests for preprocessing
2. Integration tests for API
3. Database trigger tests
4. Edge case validation

---

## 📚 Resources & References

### Documentation
- [Gemini API Docs](https://ai.google.dev/docs)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)

### Internal Files
- `/src/app/api/extract-themes/route.ts` - Reference implementation
- `/src/app/api/generate-summary/route.ts` - Gemini integration example
- `/src/migrations/migration.sql` - Original schema

### Research
- Aspect-Based Sentiment Analysis (ABSA) methodologies
- Academic review sentiment analysis papers
- Course evaluation best practices

---

## ✅ Week 1 Sign-Off

**Design Phase Complete**: ✅  
**All Deliverables Met**: ✅  
**Ready for Week 2 Implementation**: ✅  

**Estimated Implementation Effort**:
- Week 2 (Backend): 20-25 hours
- Week 3 (Frontend): 15-20 hours
- Week 4-6 (Comparison Feature): 30-35 hours
- Week 7 (Testing): 10-15 hours
- Week 8 (Polish): 5-10 hours

**Total Project Estimate**: 80-105 hours over 8 weeks

---

## 💡 Additional Notes

### Design Decisions Made

1. **Why 5-point scale instead of 3?**
   - More granularity for nuanced analysis
   - Aligns with existing 5-star rating system
   - Better for statistical aggregation

2. **Why aspect-based sentiment?**
   - Students care about specific dimensions
   - Enables targeted improvements
   - Richer comparison insights

3. **Why emotion detection?**
   - Adds human context to numbers
   - Engaging for front-end display
   - Helps identify course experience quality

4. **Why store raw AI responses?**
   - Debugging and improvement
   - Reprocessing without re-calling API
   - Model version comparison

### Potential Extensions (Post-MVP)

- Multi-language sentiment analysis
- Custom ML model fine-tuned on course reviews
- Sentiment-based course recommendations
- Alert system for declining sentiment
- Historical sentiment tracking dashboard
- Department-level sentiment analytics
- Comparative sentiment across semesters

---

**Week 1 Status**: ✅ **COMPLETE AND APPROVED FOR WEEK 2**

*Ready to begin implementation!* 🚀
