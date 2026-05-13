'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scale, X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface CompareButtonProps {
  course: Course;
}

// Global state for comparison (using localStorage)
const STORAGE_KEY = 'course_comparison_list';

const getComparisonList = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setComparisonList = (courseIds: string[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courseIds));
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('comparison-list-updated'));
};

export function CompareButton({ course }: CompareButtonProps) {
  const [isInComparison, setIsInComparison] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);

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

  const toggleComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const list = getComparisonList();
    if (isInComparison) {
      setComparisonList(list.filter((id) => id !== course.id));
    } else {
      if (list.length >= 4) {
        alert('You can only compare up to 4 courses at a time');
        return;
      }
      setComparisonList([...list, course.id]);
    }
  };

  return (
    <Button
      onClick={toggleComparison}
      variant={isInComparison ? 'default' : 'outline'}
      size="sm"
      className="font-mono text-xs"
    >
      {isInComparison ? (
        <>
          <X className="h-3 w-3 mr-1" />
          Remove
        </>
      ) : (
        <>
          <Plus className="h-3 w-3 mr-1" />
          Compare
        </>
      )}
    </Button>
  );
}

export function ComparisonFloatingButton({
  courses,
  isLoading = false,
  error = null,
}: {
  courses: Course[];
  isLoading?: boolean;
  error?: Error | null;
}) {
  const [comparisonList, setComparisonListState] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const updateState = () => {
      const list = getComparisonList();
      setComparisonListState(list);
    };

    updateState();
    window.addEventListener('comparison-list-updated', updateState);
    return () => window.removeEventListener('comparison-list-updated', updateState);
  }, []);

  const selectedCourses = courses.filter((c) => comparisonList.includes(c.id));

  const handleRemoveCourse = (courseId: string) => {
    const list = getComparisonList();
    setComparisonList(list.filter((id) => id !== courseId));
  };

  const handleClearAll = () => {
    setComparisonList([]);
  };

  const handleCompare = () => {
    if (comparisonList.length < 2) {
      alert('Please select at least 2 courses to compare');
      return;
    }
    router.push(`/courses/compare?courses=${comparisonList.join(',')}`);
  };

  if (isLoading || error) {
    return null;
  }

  if (comparisonList.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="rounded-full shadow-2xl font-mono font-bold gap-2 pr-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary animate-pulse" />
            <Badge
              variant="secondary"
              className="relative z-10 rounded-full h-8 w-8 flex items-center justify-center p-0 font-bold"
            >
              {comparisonList.length}
            </Badge>
            <Scale className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Compare Courses</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="font-mono flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Course Comparison
            </SheetTitle>
            <SheetDescription>
              {comparisonList.length} of 4 courses selected
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-start justify-between p-3 border border-border rounded-lg bg-muted/20"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold font-mono text-sm text-primary">
                    {course.code}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {course.title}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      ⭐ {course.overall_rating.toFixed(1)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.credits} credits
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCourse(course.id)}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            <Button
              onClick={handleCompare}
              className="w-full font-mono font-bold"
              disabled={comparisonList.length < 2}
            >
              <Scale className="h-4 w-4 mr-2" />
              Compare {comparisonList.length} Courses
            </Button>
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="w-full font-mono"
            >
              Clear All
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
