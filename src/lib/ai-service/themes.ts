import type { GeminiConfig, GeminiResponse, ThemeData } from './types';
import { callGeminiAPI, parseGeminiJSON } from './client';

// ============================================================================
// THEME EXTRACTION
// ============================================================================

/**
 * Extract themes from course/professor reviews
 *
 * @param reviews - Array of review comments
 * @param targetType - Type of target ('course' or 'professor')
 * @returns Array of extracted themes with sentiment
 *
 * @example
 * const themes = await extractThemes(reviews, 'course');
 */
export async function extractThemes(
  reviews: Array<{ comment: string }>,
  targetType: 'course' | 'professor' = 'course'
): Promise<GeminiResponse<ThemeData[]>> {
  if (!reviews || reviews.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  const reviewsText = reviews
    .map((r, idx) => `${idx + 1}. ${r.comment}`)
    .join('\n');

  const prompt = `You must return ONLY a JSON array. No explanations.

Reviews for ${targetType}:
${reviewsText}

Return 6-8 themes as JSON array:
[{"tag":"theme name","count":number,"sentiment":"positive|negative|neutral"}]

Example output:
[
{"tag":"Heavy Workload","count":5,"sentiment":"negative"},
{"tag":"Engaging Lectures","count":3,"sentiment":"positive"}
]`;

  const config: GeminiConfig = {
    temperature: 0.2,
    topK: 10,
    topP: 0.8,
    maxOutputTokens: 4096,
  };

  const response = await callGeminiAPI(prompt, config);

  if (!response.success) {
    return {
      success: false,
      error: response.error,
    };
  }

  const themes = parseGeminiJSON<ThemeData[]>(
    response.data.text,
    response.data.finishReason
  );

  if (!themes || !Array.isArray(themes)) {
    return {
      success: false,
      error: 'Failed to parse themes from AI response',
    };
  }

  // Validate and clean themes
  const validThemes = themes
    .filter((t) => t.tag && t.sentiment)
    .slice(0, 8)
    .map((t) => ({
      tag: t.tag,
      count: t.count || 1,
      sentiment: t.sentiment,
    }));

  return {
    success: true,
    data: validThemes,
    rawResponse: response.data.rawResponse,
  };
}
