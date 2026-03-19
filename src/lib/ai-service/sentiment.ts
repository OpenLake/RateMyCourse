import { SENTIMENT_CONFIG } from '../sentiment-config';
import type { GeminiConfig, GeminiResponse, SentimentData } from './types';
import { callGeminiAPI, parseGeminiJSON } from './client';

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

/**
 * Analyze sentiment of a single review
 *
 * @param comment - Review comment text
 * @param targetType - Type of target ('course' or 'professor')
 * @returns Sentiment analysis data
 *
 * @example
 * const sentiment = await analyzeSentiment('Great course!', 'course');
 */
export async function analyzeSentiment(
  comment: string,
  targetType: 'course' | 'professor'
): Promise<GeminiResponse<SentimentData>> {
  // Get aspect configuration based on target type
  const aspects =
    targetType === 'course'
      ? SENTIMENT_CONFIG.aspects.course
      : SENTIMENT_CONFIG.aspects.professor;

  const aspectList = Object.keys(aspects).join(', ');

  const prompt = `Analyze the sentiment of this ${targetType} review and return ONLY a JSON object (no markdown, no explanations).

Review: "${comment}"

Return this exact JSON structure:
{
  "overallSentiment": <number 1-5, where 1=very negative, 3=neutral, 5=very positive>,
  "overallConfidence": <number 0-1, confidence in the overall sentiment>,
  "aspectSentiments": {
    ${Object.keys(aspects)
      .map((aspect) => `"${aspect}": {"score": <1-5>, "confidence": <0-1>}`)
      .join(',\n    ')}
  },
  "primaryEmotion": <one of: "satisfied", "frustrated", "excited", "disappointed", "neutral", "overwhelmed", "grateful" or null>,
  "emotionIntensity": <number 0-1 or null>
}

Guidelines:
- Analyze sentiment for each aspect: ${aspectList}
- If an aspect is not mentioned, set score to 3 (neutral) and confidence to 0
- overallSentiment should be a weighted average of mentioned aspects
- primaryEmotion should reflect the dominant emotional tone
- Return valid JSON only`;

  const config: GeminiConfig = {
    temperature: SENTIMENT_CONFIG.gemini.temperature,
    topK: SENTIMENT_CONFIG.gemini.topK,
    topP: SENTIMENT_CONFIG.gemini.topP,
    maxOutputTokens: SENTIMENT_CONFIG.gemini.maxOutputTokens,
  };

  const response = await callGeminiAPI(prompt, config, SENTIMENT_CONFIG.gemini.retryAttempts);

  if (!response.success) {
    return {
      success: false,
      error: response.error,
    };
  }

  const sentiment = parseGeminiJSON<SentimentData>(response.data.text);

  if (!sentiment || typeof sentiment.overallSentiment !== 'number') {
    return {
      success: false,
      error: 'Invalid sentiment data returned from AI',
    };
  }

  return {
    success: true,
    data: sentiment,
    rawResponse: response.data.rawResponse,
  };
}
