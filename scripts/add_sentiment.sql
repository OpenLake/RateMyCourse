-- Add sentiment_label to ratings

ALTER TABLE ratings
  ADD COLUMN IF NOT EXISTS sentiment_label TEXT;

ALTER TABLE ratings
  ADD CONSTRAINT ratings_sentiment_label_check
  CHECK (
    sentiment_label IS NULL OR
    sentiment_label IN ('positive', 'negative', 'neutral')
  );

UPDATE ratings
  SET sentiment_label = 'neutral'
  WHERE sentiment_label IS NULL;