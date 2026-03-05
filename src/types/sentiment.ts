/**
 * Sentiment Analysis Type Definitions
 * RateMyCourse - Week 1 Design Phase
 */

// Sentiment score on a 5-point scale
export type SentimentScore = 1 | 2 | 3 | 4 | 5;

// Emotion types detected in reviews
export type EmotionType = 
  // Positive emotions
  | 'excited' 
  | 'inspired' 
  | 'satisfied' 
  | 'grateful' 
  | 'motivated'
  // Negative emotions
  | 'frustrated' 
  | 'overwhelmed' 
  | 'disappointed' 
  | 'confused' 
  | 'stressed'
  // Neutral emotions
  | 'indifferent' 
  | 'uncertain' 
  | 'calm';

// Sentiment labels for classification
export type SentimentLabel = 
  | 'very_positive' 
  | 'positive' 
  | 'neutral' 
  | 'negative' 
  | 'very_negative';

// Course-specific sentiment aspects
export interface CourseAspectSentiments {
  content?: SentimentScore;        // Course material quality
  instruction?: SentimentScore;    // Teaching effectiveness
  workload?: SentimentScore;       // Time commitment
  difficulty?: SentimentScore;     // Challenge level
  assignments?: SentimentScore;    // Projects/homework quality
  exams?: SentimentScore;          // Assessment fairness
  practical?: SentimentScore;      // Real-world applicability
  interest?: SentimentScore;       // Engagement level
}

// Professor-specific sentiment aspects
export interface ProfessorAspectSentiments {
  teaching?: SentimentScore;        // Teaching style
  knowledge?: SentimentScore;       // Subject expertise
  approachability?: SentimentScore; // Accessibility
  clarity?: SentimentScore;         // Explanation quality
  responsiveness?: SentimentScore;  // Communication
  fairness?: SentimentScore;        // Grading fairness
  engagement?: SentimentScore;      // Student interaction
}

// Generic aspect sentiments (union type)
export type AspectSentiments = CourseAspectSentiments | ProfessorAspectSentiments;

// Individual review sentiment analysis result
export interface ReviewSentiment {
  id: string;
  reviewId: string;
  
  // Overall sentiment
  overallSentiment: SentimentScore;
  overallConfidence: number; // 0-1
  
  // Aspect-based sentiments
  aspectSentiments: Record<string, SentimentScore>;
  
  // Emotion detection
  primaryEmotion: EmotionType | null;
  emotionIntensity: number; // 0-1
  
  // Metadata
  modelVersion: string;
  processedAt: Date;
  rawResponse?: any; // Store full AI response for debugging
  
  createdAt: Date;
}

// Aggregated sentiment for a course or professor
export interface AggregatedSentiment {
  overallScore: number; // Average sentiment score (1-5)
  
  // Distribution of sentiment labels
  distribution: {
    veryPositive: number;
    positive: number;
    neutral: number;
    negative: number;
    veryNegative: number;
  };
  
  // Average aspect sentiments
  aspectSentiments: Record<string, number>;
  
  // Most common emotions
  topEmotions: Array<{
    emotion: EmotionType;
    count: number;
    percentage: number;
  }>;
  
  // Statistics
  totalReviews: number;
  analyzedReviews: number; // Reviews with sentiment data
  
  // Trend analysis
  recentTrend?: 'improving' | 'declining' | 'stable';
  trendConfidence?: number;
}

// Request to analyze sentiment
export interface AnalyzeSentimentRequest {
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

// Response from sentiment analysis
export interface AnalyzeSentimentResponse {
  reviewId: string;
  sentiment: {
    overall: SentimentScore;
    confidence: number;
    aspects: Record<string, SentimentScore>;
    emotion: EmotionType | null;
    emotionIntensity: number;
    reasoning?: string; // AI's explanation
  };
  success: boolean;
  error?: string;
}

// Gemini API response format
export interface GeminiSentimentResponse {
  overall: SentimentScore;
  confidence: number;
  aspects: Record<string, SentimentScore>;
  emotion: EmotionType;
  emotionIntensity: number;
  reasoning: string;
}

// Sentiment validation result
export interface SentimentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence?: number;
}

// Database model for review_sentiments table
export interface ReviewSentimentDB {
  id: string;
  review_id: string;
  overall_sentiment: number;
  overall_confidence: number;
  aspect_sentiments: Record<string, number>; // JSONB
  primary_emotion: string | null;
  emotion_intensity: number | null;
  model_version: string;
  processed_at: Date;
  raw_response: any; // JSONB
  created_at: Date;
}

// Sentiment distribution for courses/professors
export interface SentimentDistribution {
  very_positive: number;
  positive: number;
  neutral: number;
  negative: number;
  very_negative: number;
}

// Request to reprocess sentiments
export interface ReprocessSentimentsRequest {
  targetId?: string;
  targetType?: 'course' | 'professor';
  limit?: number;
  force?: boolean; // Reprocess even if already analyzed
}

// Batch sentiment processing result
export interface BatchSentimentResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: Array<{
    reviewId: string;
    error: string;
  }>;
}

// Preprocessing pipeline result
export interface PreprocessedReview {
  original: string;
  cleaned: string;
  isValid: boolean;
  validationErrors: string[];
  metadata: {
    wordCount: number;
    hasEmojis: boolean;
    language: string;
    containsProfanity: boolean;
  };
}

// Sentiment trend data point
export interface SentimentTrendPoint {
  date: Date;
  averageSentiment: number;
  reviewCount: number;
  distribution: SentimentDistribution;
}

// Helper function to convert sentiment score to label
export function sentimentScoreToLabel(score: SentimentScore): SentimentLabel {
  if (score >= 5) return 'very_positive';
  if (score >= 4) return 'positive';
  if (score >= 3) return 'neutral';
  if (score >= 2) return 'negative';
  return 'very_negative';
}

// Helper function to get sentiment color
export function getSentimentColor(score: SentimentScore): string {
  if (score >= 4) return 'green';
  if (score >= 3) return 'yellow';
  if (score >= 2) return 'orange';
  return 'red';
}

// Helper function to get emotion category
export function getEmotionCategory(emotion: EmotionType): 'positive' | 'negative' | 'neutral' {
  const positiveEmotions: EmotionType[] = ['excited', 'inspired', 'satisfied', 'grateful', 'motivated'];
  const negativeEmotions: EmotionType[] = ['frustrated', 'overwhelmed', 'disappointed', 'confused', 'stressed'];
  
  if (positiveEmotions.includes(emotion)) return 'positive';
  if (negativeEmotions.includes(emotion)) return 'negative';
  return 'neutral';
}

// Export default aspect lists
export const COURSE_ASPECTS: Array<keyof CourseAspectSentiments> = [
  'content',
  'instruction',
  'workload',
  'difficulty',
  'assignments',
  'exams',
  'practical',
  'interest'
];

export const PROFESSOR_ASPECTS: Array<keyof ProfessorAspectSentiments> = [
  'teaching',
  'knowledge',
  'approachability',
  'clarity',
  'responsiveness',
  'fairness',
  'engagement'
];
