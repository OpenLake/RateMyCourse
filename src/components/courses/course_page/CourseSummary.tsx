'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

interface CourseSummaryProps {
  courseId: string;
  courseCode: string;
  courseTitle: string;
}

export default function CourseSummary({ courseId, courseCode, courseTitle }: CourseSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasReviews, setHasReviews] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);

  const generateSummary = async () => {
    setIsLoading(false);
    setError(null);

    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          courseCode,
          courseTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      console.log('Received summary from API:', {
        length: data.summary?.length || 0,
        preview: data.summary?.substring(0, 100) || '',
        fullSummary: data.summary
      });

      setSummary(data.summary);
      setHasReviews(data.hasReviews);
      setReviewCount(data.reviewCount || 0);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-generate summary on mount
    generateSummary();
  }, [courseId]);

  return (
    <Card className="border-border/60 bg-gradient-to-br from-primary/5 to-background backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black font-mono flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Generated Course Summary
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSummary}
            disabled={isLoading}
            className="font-mono"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground font-normal mt-1">
          Powered by AI • Based on {reviewCount} student {reviewCount === 1 ? 'review' : 'reviews'}
        </p>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold">Analyzing student reviews...</p>
              <p className="text-xs text-muted-foreground">
                Our AI is reading through all the feedback to create a comprehensive summary
              </p>
            </div>
          </div>
        ) : summary ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
              {summary.split('\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();
                
                // Skip empty lines
                if (!trimmed) return null;
                
                // Check if it's a section heading (ends with a colon)
                if (trimmed.match(/^[A-Z][^:]*:$/)) {
                  return (
                    <h3 key={idx} className="font-bold text-sm mt-3 mb-1 first:mt-0 text-primary">
                      {trimmed.replace(':', '')}
                    </h3>
                  );
                }
                
                // Regular paragraph - remove any stray markdown symbols
                const cleanText = trimmed
                  .replace(/#{1,6}\s*/g, '') // Remove # headers
                  .replace(/\*\*/g, '');      // Remove ** bold markers
                
                return (
                  <p key={idx} className="text-sm mb-2 leading-relaxed">
                    {cleanText}
                  </p>
                );
              })}
            </div>
            
            {!hasReviews && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This summary will improve as more students submit reviews.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Click "Generate Summary" to analyze student reviews</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
