import type { GeminiConfig, GeminiResponse } from './types';

// ============================================================================
// CORE GEMINI API CLIENT
// ============================================================================

/**
 * Make a request to Gemini API with retry logic
 */
export async function callGeminiAPI(
  prompt: string,
  config: GeminiConfig = {},
  retries: number = 3
): Promise<GeminiResponse> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return {
      success: false,
      error: 'Gemini API key not configured',
    };
  }

  const defaultConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  };

  const finalConfig = { ...defaultConfig, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: finalConfig,
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const finishReason = data.candidates?.[0]?.finishReason;

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      return {
        success: true,
        data: {
          text,
          finishReason,
          rawResponse: data,
        },
      };
    } catch (error) {
      lastError = error as Error;
      console.error(`Gemini API attempt ${attempt + 1} failed:`, error);

      if (attempt < retries - 1) {
        // Exponential backoff
        const delay = 1000 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: `Failed after ${retries} attempts: ${lastError?.message}`,
  };
}

/**
 * Parse JSON response from Gemini (handles markdown code blocks)
 */
export function parseGeminiJSON<T = any>(text: string, finishReason?: string): T | null {
  try {
    // Clean up markdown code blocks
    let cleanedResponse = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // Handle incomplete responses (MAX_TOKENS)
    if (finishReason === 'MAX_TOKENS') {
      // Try to fix incomplete JSON arrays
      if (cleanedResponse.includes('[') && !cleanedResponse.endsWith(']')) {
        cleanedResponse = cleanedResponse.replace(/,\s*$/, '') + ']';
      }
      // Try to fix incomplete JSON objects
      if (cleanedResponse.includes('{') && !cleanedResponse.endsWith('}')) {
        cleanedResponse = cleanedResponse.replace(/,\s*$/, '') + '}';
      }
    }

    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error parsing Gemini JSON response:', error);
    console.error('Raw text:', text);
    return null;
  }
}
