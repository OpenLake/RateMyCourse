'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Check, Plus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddToComparisonProps {
  course: Course;
}

const STORAGE_KEY = 'course_comparison_list';

const getComparisonList = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setComparisonList = (courseIds: string[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courseIds));
  window.dispatchEvent(new Event('comparison-list-updated'));
};

export default function AddToComparison({ course }: AddToComparisonProps) {
  const [isInComparison, setIsInComparison] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const updateState = () => {
      const list = getComparisonList();
      setIsInComparison(list.includes(course.id));
      setComparisonCount(list.length);
    };

    updateState();
    window.addEventListener('comparison-list-updated', updateState);
    return () => window.removeEventListener('comparison-list-updated', updateState);
  }, [course.id]);

  const handleAddToComparison = () => {
    const list = getComparisonList();
    if (list.length >= 4) {
      alert('You can only compare up to 4 courses at a time. Please remove a course first.');
      return;
    }
    setComparisonList([...list, course.id]);
  };

  const handleRemoveFromComparison = () => {
    const list = getComparisonList();
    setComparisonList(list.filter((id) => id !== course.id));
  };

  const handleGoToComparison = () => {
    const list = getComparisonList();
    if (list.length < 2) {
      alert('Please add at least one more course to start comparing.');
      return;
    }
    router.push(`/courses/compare?courses=${list.join(',')}`);
  };

  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Course Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isInComparison ? (
          <>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-semibold">
              <Check className="h-4 w-4" />
              Added to comparison ({comparisonCount}/4)
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleGoToComparison}
                className="w-full font-mono font-bold"
                disabled={comparisonCount < 2}
              >
                <Scale className="h-4 w-4 mr-2" />
                Compare Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                onClick={handleRemoveFromComparison}
                variant="outline"
                className="w-full font-mono"
              >
                Remove from Comparison
              </Button>
            </div>
            {comparisonCount < 2 && (
              <p className="text-xs text-muted-foreground text-center">
                Add at least one more course to compare
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Add this course to compare it side-by-side with other courses
            </p>
            <Button
              onClick={handleAddToComparison}
              variant="outline"
              className="w-full font-mono font-bold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Comparison
            </Button>
            {comparisonCount > 0 && (
              <div className="text-xs text-center">
                <span className="text-muted-foreground">
                  {comparisonCount} {comparisonCount === 1 ? 'course' : 'courses'} in comparison
                </span>
                <Button
                  onClick={handleGoToComparison}
                  variant="link"
                  size="sm"
                  className="ml-2 h-auto p-0 text-xs"
                >
                  View
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
