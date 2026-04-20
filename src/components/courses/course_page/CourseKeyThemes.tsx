'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Tags, TrendingUp } from 'lucide-react';

interface CourseKeyThemesProps {
  courseId: string;
  courseCode: string;
}

interface Theme {
  tag: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export default function CourseKeyThemes({ courseId, courseCode }: CourseKeyThemesProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeyThemes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching themes for courseId:', courseId, 'courseCode:', courseCode);

        const response = await fetch('/api/extract-themes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courseId, courseCode }),
        });

        const data = await response.json();
        
        console.log('Theme extraction response:', {
          ok: response.ok,
          status: response.status,
          data: data,
          themesCount: data.themes?.length || 0
        });

        if (!response.ok) {
          throw new Error(data.error || 'Failed to extract themes');
        }

        setThemes(data.themes || []);
      } catch (err) {
        console.error('Error extracting themes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load themes');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchKeyThemes();
    }
  }, [courseId, courseCode]);

  const getBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'default'; // Green/primary color
      case 'negative':
        return 'destructive'; // Red color
      default:
        return 'secondary'; // Gray color
    }
  };

  return (
    <Card className="border-border/60 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Tags className="h-4 w-4 text-primary" />
          Key Themes
        </CardTitle>
        <p className="text-xs text-muted-foreground font-normal">
          Common topics from student reviews
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-xs text-muted-foreground">
              Unable to load themes
            </p>
          </div>
        ) : themes.length === 0 ? (
          <div className="text-center py-6">
            <Tags className="h-8 w-8 mx-auto mb-2 opacity-30 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              No reviews available yet
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {themes.map((theme, index) => (
              <Badge
                key={index}
                variant={getBadgeVariant(theme.sentiment)}
                className="text-xs px-3 py-1 font-medium cursor-default hover:opacity-80 transition-opacity"
              >
                <TrendingUp className="h-3 w-3 mr-1 inline" />
                {theme.tag}
                {theme.count > 1 && (
                  <span className="ml-1.5 opacity-70 text-[10px]">
                    ×{theme.count}
                  </span>
                )}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
