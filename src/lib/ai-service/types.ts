// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GeminiConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export interface GeminiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rawResponse?: any;
}

export interface ThemeData {
  tag: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface SentimentData {
  overallSentiment: number;
  overallConfidence: number;
  aspectSentiments: Record<string, { score: number; confidence: number }>;
  primaryEmotion: string | null;
  emotionIntensity: number | null;
}
