import type { GeminiConfig, GeminiResponse } from './types';
import { callGeminiAPI } from './client';

// ============================================================================
// SUMMARY GENERATION
// ============================================================================

/**
 * Generate course/professor summary from reviews
 *
 * @param reviews - Array of reviews with comments and ratings
 * @param metadata - Course/professor metadata (title, code, etc.)
 * @param targetType - Type of target ('course' or 'professor')
 * @returns Generated summary text
 *
 * @example
 * const summary = await generateSummary(reviews, { title: 'CS101', code: 'CS101' }, 'course');
 */
export async function generateSummary(
  reviews: Array<{
    comment: string;
    rating_value?: number;
    difficulty_rating?: number;
    workload_rating?: number;
  }>,
  metadata: { title?: string; code?: string; name?: string },
  targetType: 'course' | 'professor' = 'course'
): Promise<GeminiResponse<string>> {
  if (!reviews || reviews.length === 0) {
    return {
      success: true,
      data: `No reviews available yet for this ${targetType}. Be the first to share your experience!`,
    };
  }

  const reviewsText = reviews
    .map((r, idx) => {
      let text = `Review ${idx + 1}:\n`;
      if (r.rating_value) text += `Rating: ${r.rating_value}/5\n`;
      if (r.difficulty_rating) text += `Difficulty: ${r.difficulty_rating}/5\n`;
      if (r.workload_rating) text += `Workload: ${r.workload_rating}/5\n`;
      text += `Comment: ${r.comment}\n---`;
      return text;
    })
    .join('\n');

  const entityName =
    targetType === 'course' ? `${metadata.title} (${metadata.code})` : metadata.name;

  const prompt = `Analyze the following student reviews for ${entityName} and create a comprehensive summary.

Total Reviews: ${reviews.length}

Student Reviews:
${reviewsText}

Generate a well-structured summary (200-300 words) covering these sections:

Overall Experience: General sentiment and key points from students

Strengths: What students appreciated most

Challenges: Common difficulties or concerns raised by students

${targetType === 'course' ? "Workload & Difficulty: Students' perception of course demands" : 'Teaching Style: How the professor approaches teaching'}

Recommendations: Who would benefit most from this ${targetType}

IMPORTANT FORMATTING RULES:
- Do NOT use markdown symbols like #, ##, *, **, or _
- Start each section title on its own line with the exact format "Section Name:" (with a colon)
- Write content in clear, concise paragraphs
- Use simple line breaks to separate sections
- Be balanced, objective, and professional
- Provide specific insights based on the reviews`;

  const config: GeminiConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  };

  const response = await callGeminiAPI(prompt, config);

  if (!response.success) {
    return {
      success: false,
      error: response.error,
    };
  }

  return {
    success: true,
    data: response.data.text || 'Unable to generate summary at this time.',
    rawResponse: response.data.rawResponse,
  };
}
