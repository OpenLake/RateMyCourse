import Sentiment from 'sentiment';

export type SentimentLabel = 'positive' | 'negative' | 'neutral';

export interface SentimentResult {
  label: SentimentLabel;
  score: number;
}

const analyzer = new Sentiment();

/**
 * Analyzes the sentiment of a review comment.
 * Optionally blends the result with a numeric overall rating (60/40 weight).
 *
 * @param text - The review comment text
 * @param overallRating - Optional numeric rating (1–5)
 * @returns SentimentResult with label and normalized score (-1 to 1)
 */
export function analyzeSentiment(text: string, overallRating?: number): SentimentResult {
  const { comparative } = analyzer.analyze(text || '');

  let score = Math.max(-1, Math.min(1, comparative / 5));

  if (typeof overallRating === 'number') {
    const clampedRating = Math.max(1, Math.min(5, overallRating));
    const ratingScore = (clampedRating - 3) / 2;

    score = (score * 0.6) + (ratingScore * 0.4);
  }

  if (score > 0.1) {
    return { label: 'positive', score };
  }

  if (score < -0.1) {
    return { label: 'negative', score };
  }

  return { label: 'neutral', score };
}