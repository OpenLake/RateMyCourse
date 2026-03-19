-- Migration script for Anonymous Course Rating Platform
-- This script creates all required tables with appropriate relationships and RLS policies

-- Enable necessary extensions
-- Make sure to enable these in the 'extensions' schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Drop tables if they exist (for clean migrations)
DROP TABLE IF EXISTS flags;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS professors_courses;
DROP TABLE IF EXISTS professors;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE,
  anonymous_id UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  verification_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  credits INTEGER NOT NULL,
  overall_rating NUMERIC(3,2) DEFAULT 0,
  difficulty_rating NUMERIC(3,2) DEFAULT 0,
  workload_rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the professors table
CREATE TABLE professors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  post TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  avatar_url TEXT,
  website TEXT,
  overall_rating NUMERIC(3,2) DEFAULT 0,
  knowledge_rating NUMERIC(3,2) DEFAULT 0,
  teaching_rating NUMERIC(3,2) DEFAULT 0,
  approachability_rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  research_interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create junction table for professors and courses (many-to-many)
CREATE TABLE professors_courses (
  professor_id UUID REFERENCES professors(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (professor_id, course_id)
);

-- Create the reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_id UUID NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('course', 'professor')),
  rating_value INTEGER NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
  comment TEXT,
  votes INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Add specialized ratings based on target type
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  workload_rating INTEGER CHECK (workload_rating BETWEEN 1 AND 5),
  knowledge_rating INTEGER CHECK (knowledge_rating BETWEEN 1 AND 5),
  teaching_rating INTEGER CHECK (teaching_rating BETWEEN 1 AND 5),
  approachability_rating INTEGER CHECK (approachability_rating BETWEEN 1 AND 5),
  
  -- Ensure a user can only review each target once
  UNIQUE (anonymous_id, target_id, target_type)
);

-- Create the votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  anonymous_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure a user can only vote once per review
  UNIQUE (review_id, anonymous_id)
);

-- Create the flags table
CREATE TABLE flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  anonymous_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure a user can only flag each review once
  UNIQUE (review_id, anonymous_id)
);

-- Create indexes for performance
CREATE INDEX idx_reviews_target ON reviews(target_id, target_type);
CREATE INDEX idx_reviews_anonymous_id ON reviews(anonymous_id);
CREATE INDEX idx_votes_review_id ON votes(review_id);
CREATE INDEX idx_flags_review_id ON flags(review_id);
CREATE INDEX idx_flags_status ON flags(status);

-- Create function to update course ratings
CREATE OR REPLACE FUNCTION update_course_ratings() 
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.target_type = 'course' THEN
    UPDATE courses
    SET 
      overall_rating = (
        SELECT COALESCE(AVG(rating_value), 0) 
        FROM reviews 
        WHERE target_id = NEW.target_id AND target_type = 'course'
      ),
      difficulty_rating = (
        SELECT COALESCE(AVG(difficulty_rating), 0) 
        FROM reviews 
        WHERE target_id = NEW.target_id AND target_type = 'course'
      ),
      workload_rating = (
        SELECT COALESCE(AVG(workload_rating), 0) 
        FROM reviews 
        WHERE target_id = NEW.target_id AND target_type = 'course'
      ),
      review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE target_id = NEW.target_id AND target_type = 'course'
      ),
      updated_at = NOW()
    WHERE id = NEW.target_id;
  ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'course' THEN
    UPDATE courses
    SET 
      overall_rating = (
        SELECT COALESCE(AVG(rating_value), 0) 
        FROM reviews 
        WHERE target_id = OLD.target_id AND target_type = 'course'
      ),
      difficulty_rating = (
        SELECT COALESCE(AVG(difficulty_rating), 0) 
        FROM reviews 
        WHERE target_id = OLD.target_id AND target_type = 'course'
      ),
      workload_rating = (
        SELECT COALESCE(AVG(workload_rating), 0) 
        FROM reviews 
        WHERE target_id = OLD.target_id AND target_type = 'course'
      ),
      review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE target_id = OLD.target_id AND target_type = 'course'
      ),
      updated_at = NOW()
    WHERE id = OLD.target_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update professor ratings
CREATE OR REPLACE FUNCTION update_professor_ratings() 
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.target_type = 'professor' THEN
    UPDATE professors
    SET 
      overall_rating = (
        SELECT COALESCE(AVG(rating_value), 0) 
        FROM reviews 
        WHERE target_id = NEW.target_id AND target_type = 'professor'
      ),
      knowledge_rating = (
        SELECT COALESCE(AVG(knowledge_rating), 0) 
        FROM reviews 
        WHERE target_id = NEW.target_id AND target_type = 'professor'
      ),
      teaching_rating = (
        SELECT COALESCE(AVG(teaching_rating), 0) 
        FROM reviews 
        WHERE target_id = NEW.target_id AND target_type = 'professor'
      ),
      approachability_rating = (
        SELECT COALESCE(AVG(approachability_rating), 0) 
        FROM reviews 
        WHERE target_id = NEW.target_id AND target_type = 'professor'
      ),
      review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE target_id = NEW.target_id AND target_type = 'professor'
      ),
      updated_at = NOW()
    WHERE id = NEW.target_id;
  ELSIF TG_OP = 'DELETE' AND OLD.target_type = 'professor' THEN
    UPDATE professors
    SET 
      overall_rating = (
        SELECT COALESCE(AVG(rating_value), 0) 
        FROM reviews 
        WHERE target_id = OLD.target_id AND target_type = 'professor'
      ),
      knowledge_rating = (
        SELECT COALESCE(AVG(knowledge_rating), 0) 
        FROM reviews 
        WHERE target_id = OLD.target_id AND target_type = 'professor'
      ),
      teaching_rating = (
        SELECT COALESCE(AVG(teaching_rating), 0) 
        FROM reviews 
        WHERE target_id = OLD.target_id AND target_type = 'professor'
      ),
      approachability_rating = (
        SELECT COALESCE(AVG(approachability_rating), 0) 
        FROM reviews 
        WHERE target_id = OLD.target_id AND target_type = 'professor'
      ),
      review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE target_id = OLD.target_id AND target_type = 'professor'
      ),
      updated_at = NOW()
    WHERE id = OLD.target_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update review votes
CREATE OR REPLACE FUNCTION update_review_votes() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE reviews
    SET 
      votes = (
        SELECT 
          COUNT(CASE WHEN vote_type = 'helpful' THEN 1 END) - 
          COUNT(CASE WHEN vote_type = 'unhelpful' THEN 1 END)
        FROM votes 
        WHERE review_id = NEW.review_id
      ),
      updated_at = NOW()
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews
    SET 
      votes = (
        SELECT 
          COUNT(CASE WHEN vote_type = 'helpful' THEN 1 END) - 
          COUNT(CASE WHEN vote_type = 'unhelpful' THEN 1 END)
        FROM votes 
        WHERE review_id = OLD.review_id
      ),
      updated_at = NOW()
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update review flag status
CREATE OR REPLACE FUNCTION update_review_flag_status() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Flag the review when a new flag is added
    UPDATE reviews
    SET 
      is_flagged = TRUE,
      updated_at = NOW()
    WHERE id = NEW.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_course_ratings_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_course_ratings();

CREATE TRIGGER update_professor_ratings_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_professor_ratings();

CREATE TRIGGER update_review_votes_trigger
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_review_votes();

CREATE TRIGGER update_review_flag_status_trigger
AFTER INSERT ON flags
FOR EACH ROW
EXECUTE FUNCTION update_review_flag_status();

-- Function to sanitize PII from comments before insertion
CREATE OR REPLACE FUNCTION sanitize_review_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Basic sanitization: strip out email patterns
  NEW.comment = REGEXP_REPLACE(NEW.comment, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[email redacted]', 'g');
  
  -- Remove phone number patterns
  NEW.comment = REGEXP_REPLACE(NEW.comment, '\b(\+\d{1,3}[\s-]?)?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})\b', '[phone redacted]', 'g');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sanitize comments before insertion
CREATE TRIGGER sanitize_review_comment_trigger
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION sanitize_review_comment();

-- Add Row-Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE professors_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid() AND raw_app_meta_data->>'is_admin' = 'true'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get the anonymous ID for the current user
CREATE OR REPLACE FUNCTION get_anonymous_id()
RETURNS UUID AS $$
DECLARE
  anon_id UUID;
BEGIN
  SELECT anonymous_id INTO anon_id FROM users WHERE auth_id = auth.uid();
  RETURN anon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User policies
CREATE POLICY user_select ON users 
  FOR SELECT USING (auth_id = auth.uid() OR is_admin());

CREATE POLICY user_insert ON users 
  FOR INSERT WITH CHECK (auth_id = auth.uid());

CREATE POLICY user_update ON users 
  FOR UPDATE USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());

-- Course policies (public read, admin write, but allow trigger updates)
CREATE POLICY course_select ON courses 
  FOR SELECT USING (true);

CREATE POLICY course_insert ON courses 
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY course_update ON courses 
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY course_delete ON courses 
  FOR DELETE USING (is_admin());

-- Professor policies (public read, admin write, but allow trigger updates)
CREATE POLICY professor_select ON professors 
  FOR SELECT USING (true);

CREATE POLICY professor_insert ON professors 
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY professor_update ON professors 
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY professor_delete ON professors 
  FOR DELETE USING (is_admin());

-- Professor_Course junction policies
CREATE POLICY professor_course_select ON professors_courses 
  FOR SELECT USING (true);

CREATE POLICY professor_course_insert ON professors_courses 
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY professor_course_delete ON professors_courses 
  FOR DELETE USING (is_admin());

-- Review policies
CREATE POLICY review_select ON reviews 
  FOR SELECT USING (true);

CREATE POLICY review_insert ON reviews 
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    anonymous_id = get_anonymous_id()
  );

CREATE POLICY review_update ON reviews 
  FOR UPDATE USING (
    anonymous_id = get_anonymous_id() OR is_admin()
  ) WITH CHECK (
    anonymous_id = get_anonymous_id() OR is_admin()
  );

CREATE POLICY review_delete ON reviews 
  FOR DELETE USING (
    anonymous_id = get_anonymous_id() OR is_admin()
  );

-- Vote policies
CREATE POLICY vote_select ON votes 
  FOR SELECT USING (true);

CREATE POLICY vote_insert ON votes 
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    anonymous_id = get_anonymous_id()
  );

CREATE POLICY vote_update ON votes 
  FOR UPDATE USING (
    anonymous_id = get_anonymous_id()
  ) WITH CHECK (
    anonymous_id = get_anonymous_id()
  );

CREATE POLICY vote_delete ON votes 
  FOR DELETE USING (
    anonymous_id = get_anonymous_id() OR is_admin()
  );

-- Flag policies
CREATE POLICY flag_select ON flags 
  FOR SELECT USING (is_admin() OR anonymous_id = get_anonymous_id());

CREATE POLICY flag_insert ON flags 
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    anonymous_id = get_anonymous_id()
  );

CREATE POLICY flag_update ON flags 
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY flag_delete ON flags 
  FOR DELETE USING (is_admin());

-- 
-- 
-- 
-- 
-- THIS IS THE CORRECTED FUNCTION
-- 
-- 
-- 
-- 
-- Create function to create an anonymous user on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_salt TEXT;
  new_hash TEXT;
BEGIN
  -- Generate a salt
  -- We explicitly call the function inside the 'extensions' schema
  new_salt := encode(extensions.gen_random_bytes(16), 'hex');
  
  -- Create verification hash (placeholder)
  -- We explicitly call the function inside the 'extensions' schema
  new_hash := encode(extensions.digest(NEW.email || new_salt, 'sha256'), 'hex');
  
  -- Insert new user
  INSERT INTO public.users (auth_id, verification_hash, salt)
  VALUES (NEW.id, new_hash, new_salt);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile after auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
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
