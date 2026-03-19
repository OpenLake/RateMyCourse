// ============================================================================
// AI SERVICE - BARREL EXPORTS
// ============================================================================

export type { GeminiConfig, GeminiResponse, ThemeData, SentimentData } from './types';

export { extractThemes } from './themes';
export { generateSummary } from './summary';
export { analyzeSentiment } from './sentiment';
export { generateText } from './text';
export { isAIServiceConfigured, getAIServiceStatus } from './utils';

// Default export for backwards compatibility
import { extractThemes } from './themes';
import { generateSummary } from './summary';
import { analyzeSentiment } from './sentiment';
import { generateText } from './text';
import { isAIServiceConfigured, getAIServiceStatus } from './utils';

export default {
  extractThemes,
  generateSummary,
  analyzeSentiment,
  generateText,
  isAIServiceConfigured,
  getAIServiceStatus,
};
