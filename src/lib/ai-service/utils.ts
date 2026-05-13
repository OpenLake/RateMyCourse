// ============================================================================
// AI SERVICE UTILITIES
// ============================================================================

/**
 * Check if Gemini API is properly configured
 */
export function isAIServiceConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Get AI service status and configuration
 */
export function getAIServiceStatus() {
  return {
    configured: isAIServiceConfigured(),
    model: 'gemini-flash-latest',
    features: {
      sentimentAnalysis: true,
      themeExtraction: true,
      summaryGeneration: true,
      customGeneration: true,
    },
  };
}
