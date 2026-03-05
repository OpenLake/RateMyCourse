-- Sentiment Analysis Database Migration
-- Week 1: Design Phase - Database Schema
-- RateMyCourse Platform

-- ============================================================================
-- 1. CREATE REVIEW_SENTIMENTS TABLE
-- ============================================================================
-- Stores sentiment analysis results for each review

CREATE TABLE IF NOT EXISTS review_sentiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  
  -- Overall sentiment analysis
  overall_sentiment INTEGER NOT NULL CHECK (overall_sentiment BETWEEN 1 AND 5),
  overall_confidence NUMERIC(3,2) NOT NULL CHECK (overall_confidence BETWEEN 0 AND 1),
  
  -- Aspect-based sentiments (stored as JSON for flexibility)
  -- For courses: {content, instruction, workload, difficulty, assignments, exams, practical, interest}
  -- For professors: {teaching, knowledge, approachability, clarity, responsiveness, fairness, engagement}
  aspect_sentiments JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Emotion detection
  primary_emotion TEXT,
  emotion_intensity NUMERIC(3,2) CHECK (emotion_intensity BETWEEN 0 AND 1),
  
  -- Analysis metadata
  model_version TEXT NOT NULL DEFAULT 'gemini-flash-latest',
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Store raw AI response for debugging/reprocessing
  raw_response JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. ADD SENTIMENT FIELDS TO COURSES TABLE
-- ============================================================================

-- Add aggregated sentiment score (average of all review sentiments)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3,2) DEFAULT 0 
CHECK (sentiment_score >= 0 AND sentiment_score <= 5);

-- Add sentiment distribution (count of each sentiment category)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS sentiment_distribution JSONB DEFAULT '{
  "very_positive": 0,
  "positive": 0,
  "neutral": 0,
  "negative": 0,
  "very_negative": 0
}'::jsonb;

-- Add aggregated aspect sentiments
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS aspect_sentiments JSONB DEFAULT '{}'::jsonb;

-- Add last sentiment update timestamp
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS sentiment_updated_at TIMESTAMPTZ;

-- ============================================================================
-- 3. ADD SENTIMENT FIELDS TO PROFESSORS TABLE
-- ============================================================================

-- Add aggregated sentiment score
ALTER TABLE professors 
ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3,2) DEFAULT 0 
CHECK (sentiment_score >= 0 AND sentiment_score <= 5);

-- Add sentiment distribution
ALTER TABLE professors 
ADD COLUMN IF NOT EXISTS sentiment_distribution JSONB DEFAULT '{
  "very_positive": 0,
  "positive": 0,
  "neutral": 0,
  "negative": 0,
  "very_negative": 0
}'::jsonb;

-- Add aggregated aspect sentiments
ALTER TABLE professors 
ADD COLUMN IF NOT EXISTS aspect_sentiments JSONB DEFAULT '{}'::jsonb;

-- Add last sentiment update timestamp
ALTER TABLE professors 
ADD COLUMN IF NOT EXISTS sentiment_updated_at TIMESTAMPTZ;

-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index on review_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_review_sentiments_review_id 
ON review_sentiments(review_id);

-- Index on overall_sentiment for filtering
CREATE INDEX IF NOT EXISTS idx_review_sentiments_overall 
ON review_sentiments(overall_sentiment);

-- Index on processed_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_review_sentiments_processed_at 
ON review_sentiments(processed_at DESC);

-- Index on primary_emotion for aggregation
CREATE INDEX IF NOT EXISTS idx_review_sentiments_emotion 
ON review_sentiments(primary_emotion) WHERE primary_emotion IS NOT NULL;

-- GIN index for aspect_sentiments JSONB queries
CREATE INDEX IF NOT EXISTS idx_review_sentiments_aspects 
ON review_sentiments USING GIN (aspect_sentiments);

-- Index on courses sentiment_score for sorting
CREATE INDEX IF NOT EXISTS idx_courses_sentiment_score 
ON courses(sentiment_score DESC) WHERE sentiment_score > 0;

-- Index on professors sentiment_score for sorting
CREATE INDEX IF NOT EXISTS idx_professors_sentiment_score 
ON professors(sentiment_score DESC) WHERE sentiment_score > 0;

-- ============================================================================
-- 5. CREATE FUNCTION TO UPDATE COURSE SENTIMENT AGGREGATES
-- ============================================================================

CREATE OR REPLACE FUNCTION update_course_sentiment_aggregates() 
RETURNS TRIGGER AS $$
DECLARE
  target_course_id UUID;
  avg_sentiment NUMERIC;
  sentiment_dist JSONB;
  aspect_avg JSONB;
BEGIN
  -- Get the target course ID from the review
  SELECT r.target_id INTO target_course_id
  FROM reviews r
  WHERE r.id = NEW.review_id AND r.target_type = 'course';
  
  -- Only proceed if this is a course review
  IF target_course_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate average sentiment score
  SELECT COALESCE(AVG(rs.overall_sentiment), 0) INTO avg_sentiment
  FROM review_sentiments rs
  JOIN reviews r ON rs.review_id = r.id
  WHERE r.target_id = target_course_id AND r.target_type = 'course';
  
  -- Calculate sentiment distribution
  SELECT jsonb_build_object(
    'very_positive', COUNT(*) FILTER (WHERE overall_sentiment >= 5),
    'positive', COUNT(*) FILTER (WHERE overall_sentiment >= 4 AND overall_sentiment < 5),
    'neutral', COUNT(*) FILTER (WHERE overall_sentiment >= 3 AND overall_sentiment < 4),
    'negative', COUNT(*) FILTER (WHERE overall_sentiment >= 2 AND overall_sentiment < 3),
    'very_negative', COUNT(*) FILTER (WHERE overall_sentiment < 2)
  ) INTO sentiment_dist
  FROM review_sentiments rs
  JOIN reviews r ON rs.review_id = r.id
  WHERE r.target_id = target_course_id AND r.target_type = 'course';
  
  -- Update the course table
  UPDATE courses
  SET 
    sentiment_score = avg_sentiment,
    sentiment_distribution = sentiment_dist,
    sentiment_updated_at = NOW()
  WHERE id = target_course_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. CREATE FUNCTION TO UPDATE PROFESSOR SENTIMENT AGGREGATES
-- ============================================================================

CREATE OR REPLACE FUNCTION update_professor_sentiment_aggregates() 
RETURNS TRIGGER AS $$
DECLARE
  target_professor_id UUID;
  avg_sentiment NUMERIC;
  sentiment_dist JSONB;
BEGIN
  -- Get the target professor ID from the review
  SELECT r.target_id INTO target_professor_id
  FROM reviews r
  WHERE r.id = NEW.review_id AND r.target_type = 'professor';
  
  -- Only proceed if this is a professor review
  IF target_professor_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate average sentiment score
  SELECT COALESCE(AVG(rs.overall_sentiment), 0) INTO avg_sentiment
  FROM review_sentiments rs
  JOIN reviews r ON rs.review_id = r.id
  WHERE r.target_id = target_professor_id AND r.target_type = 'professor';
  
  -- Calculate sentiment distribution
  SELECT jsonb_build_object(
    'very_positive', COUNT(*) FILTER (WHERE overall_sentiment >= 5),
    'positive', COUNT(*) FILTER (WHERE overall_sentiment >= 4 AND overall_sentiment < 5),
    'neutral', COUNT(*) FILTER (WHERE overall_sentiment >= 3 AND overall_sentiment < 4),
    'negative', COUNT(*) FILTER (WHERE overall_sentiment >= 2 AND overall_sentiment < 3),
    'very_negative', COUNT(*) FILTER (WHERE overall_sentiment < 2)
  ) INTO sentiment_dist
  FROM review_sentiments rs
  JOIN reviews r ON rs.review_id = r.id
  WHERE r.target_id = target_professor_id AND r.target_type = 'professor';
  
  -- Update the professor table
  UPDATE professors
  SET 
    sentiment_score = avg_sentiment,
    sentiment_distribution = sentiment_dist,
    sentiment_updated_at = NOW()
  WHERE id = target_professor_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. CREATE TRIGGERS FOR AUTOMATIC AGGREGATION
-- ============================================================================

-- Trigger to update course sentiment when review_sentiment is inserted/updated
DROP TRIGGER IF EXISTS trigger_update_course_sentiment ON review_sentiments;
CREATE TRIGGER trigger_update_course_sentiment
  AFTER INSERT OR UPDATE ON review_sentiments
  FOR EACH ROW
  EXECUTE FUNCTION update_course_sentiment_aggregates();

-- Trigger to update professor sentiment when review_sentiment is inserted/updated
DROP TRIGGER IF EXISTS trigger_update_professor_sentiment ON review_sentiments;
CREATE TRIGGER trigger_update_professor_sentiment
  AFTER INSERT OR UPDATE ON review_sentiments
  FOR EACH ROW
  EXECUTE FUNCTION update_professor_sentiment_aggregates();

-- ============================================================================
-- 8. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get sentiment label from score
CREATE OR REPLACE FUNCTION get_sentiment_label(score NUMERIC)
RETURNS TEXT AS $$
BEGIN
  IF score >= 4.5 THEN RETURN 'very_positive';
  ELSIF score >= 3.5 THEN RETURN 'positive';
  ELSIF score >= 2.5 THEN RETURN 'neutral';
  ELSIF score >= 1.5 THEN RETURN 'negative';
  ELSE RETURN 'very_negative';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate sentiment trend
CREATE OR REPLACE FUNCTION calculate_sentiment_trend(
  p_target_id UUID, 
  p_target_type TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TEXT AS $$
DECLARE
  current_avg NUMERIC;
  previous_avg NUMERIC;
  trend TEXT;
BEGIN
  -- Average sentiment in recent period
  SELECT AVG(rs.overall_sentiment) INTO current_avg
  FROM review_sentiments rs
  JOIN reviews r ON rs.review_id = r.id
  WHERE r.target_id = p_target_id 
    AND r.target_type = p_target_type
    AND rs.processed_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  -- Average sentiment in previous period
  SELECT AVG(rs.overall_sentiment) INTO previous_avg
  FROM review_sentiments rs
  JOIN reviews r ON rs.review_id = r.id
  WHERE r.target_id = p_target_id 
    AND r.target_type = p_target_type
    AND rs.processed_at < NOW() - (p_days || ' days')::INTERVAL
    AND rs.processed_at >= NOW() - (p_days * 2 || ' days')::INTERVAL;
  
  -- Determine trend
  IF current_avg IS NULL OR previous_avg IS NULL THEN
    RETURN 'insufficient_data';
  ELSIF current_avg > previous_avg + 0.3 THEN
    RETURN 'improving';
  ELSIF current_avg < previous_avg - 0.3 THEN
    RETURN 'declining';
  ELSE
    RETURN 'stable';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Recent sentiment analysis
CREATE OR REPLACE VIEW recent_sentiments AS
SELECT 
  rs.id,
  rs.review_id,
  r.target_id,
  r.target_type,
  rs.overall_sentiment,
  rs.overall_confidence,
  rs.primary_emotion,
  rs.processed_at,
  get_sentiment_label(rs.overall_sentiment) as sentiment_label
FROM review_sentiments rs
JOIN reviews r ON rs.review_id = r.id
ORDER BY rs.processed_at DESC;

-- View: Course sentiment summary
CREATE OR REPLACE VIEW course_sentiment_summary AS
SELECT 
  c.id as course_id,
  c.code,
  c.title,
  c.department,
  c.sentiment_score,
  c.sentiment_distribution,
  c.review_count,
  get_sentiment_label(c.sentiment_score) as overall_sentiment_label,
  calculate_sentiment_trend(c.id, 'course', 30) as trend_30d
FROM courses c
WHERE c.sentiment_score > 0;

-- View: Professor sentiment summary
CREATE OR REPLACE VIEW professor_sentiment_summary AS
SELECT 
  p.id as professor_id,
  p.name,
  p.department,
  p.sentiment_score,
  p.sentiment_distribution,
  p.review_count,
  get_sentiment_label(p.sentiment_score) as overall_sentiment_label,
  calculate_sentiment_trend(p.id, 'professor', 30) as trend_30d
FROM professors p
WHERE p.sentiment_score > 0;

-- ============================================================================
-- 10. GRANT PERMISSIONS (if using RLS)
-- ============================================================================

-- Note: Adjust these based on your RLS policies
-- These are examples - customize for your security model

-- Allow authenticated users to read sentiments
-- ALTER TABLE review_sentiments ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Anyone can view sentiments" ON review_sentiments
--   FOR SELECT USING (true);

-- CREATE POLICY "System can insert sentiments" ON review_sentiments
--   FOR INSERT WITH CHECK (true);

-- ============================================================================
-- MIGRATION COMPLETE
--============================================================================

-- To rollback this migration, run:
-- DROP VIEW IF EXISTS professor_sentiment_summary;
-- DROP VIEW IF EXISTS course_sentiment_summary;
-- DROP VIEW IF EXISTS recent_sentiments;
-- DROP FUNCTION IF EXISTS calculate_sentiment_trend(UUID, TEXT, INTEGER);
-- DROP FUNCTION IF EXISTS get_sentiment_label(NUMERIC);
-- DROP TRIGGER IF EXISTS trigger_update_professor_sentiment ON review_sentiments;
-- DROP TRIGGER IF EXISTS trigger_update_course_sentiment ON review_sentiments;
-- DROP FUNCTION IF EXISTS update_professor_sentiment_aggregates();
-- DROP FUNCTION IF EXISTS update_course_sentiment_aggregates();
-- DROP TABLE IF EXISTS review_sentiments CASCADE;
-- ALTER TABLE courses DROP COLUMN IF EXISTS sentiment_score;
-- ALTER TABLE courses DROP COLUMN IF EXISTS sentiment_distribution;
-- ALTER TABLE courses DROP COLUMN IF EXISTS aspect_sentiments;
-- ALTER TABLE courses DROP COLUMN IF EXISTS sentiment_updated_at;
-- ALTER TABLE professors DROP COLUMN IF EXISTS sentiment_score;
-- ALTER TABLE professors DROP COLUMN IF EXISTS sentiment_distribution;
-- ALTER TABLE professors DROP COLUMN IF EXISTS aspect_sentiments;
-- ALTER TABLE professors DROP COLUMN IF EXISTS sentiment_updated_at;
