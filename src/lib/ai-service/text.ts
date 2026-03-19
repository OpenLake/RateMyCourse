import type { GeminiConfig, GeminiResponse } from './types';
import { callGeminiAPI } from './client';

// ============================================================================
// GENERIC TEXT GENERATION
// ============================================================================

/**
 * Generic AI text generation.
 * Use this for custom AI features not covered by specific functions.
 *
 * @param prompt - The prompt to send to Gemini
 * @param config - Optional Gemini configuration
 * @returns Generated text response
 *
 * @example
 * const result = await generateText('Explain quantum physics simply', { temperature: 0.5 });
 */
export async function generateText(
  prompt: string,
  config?: GeminiConfig
): Promise<GeminiResponse<string>> {
  const response = await callGeminiAPI(prompt, config);

  if (!response.success) {
    return {
      success: false,
      error: response.error,
    };
  }

  return {
    success: true,
    data: response.data.text,
    rawResponse: response.data.rawResponse,
  };
}
