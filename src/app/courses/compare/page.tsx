'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import CourseSelector from '@/components/courses/compare/CourseSelector';
import ComparisonTable from '@/components/courses/compare/ComparisonTable';
import ComparisonCharts from '@/components/courses/compare/ComparisonCharts';
import ReviewHighlights from '@/components/courses/compare/ReviewHighlights';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Scale, Sparkles, Info } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCourses } from '@/hooks/useCourses';

export default function CourseComparisonPage() {
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const searchParams = useSearchParams();
  const { courses, isLoading } = useCourses();

  useEffect(() => {
    if (!isLoading && courses.length > 0 && searchParams) {
      const courseIds = searchParams.get('courses')?.split(',') || [];
      if (courseIds.length > 0) {
        const preselectedCourses = courses.filter((c) =>
          courseIds.includes(c.id)
        );
        setSelectedCourses(preselectedCourses.slice(0, 4));
      } else {
        setSelectedCourses([]);
      }
    }
  }, [searchParams, courses, isLoading]);

  const handleCoursesChange = (courses: Course[]) => {
    setSelectedCourses(courses);
  };

  const handleClearAll = () => {
    setSelectedCourses([]);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40 dark:opacity-60" />
      <div className="absolute inset-0 bg-noise opacity-[0.06] dark:opacity-[0.1] pointer-events-none" />

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/8 dark:bg-primary/15 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10">
        <div className="border-b border-border/40 bg-background/40 backdrop-blur-xl">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center space-y-3">
              <div className="inline-block px-3 py-1 border border-border/40 rounded-full mb-2 hover:border-primary/40 transition-colors duration-300">
                <p className="text-[10px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase">
                  Course Comparison Tool
                </p>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                <span className="font-mono text-primary flex items-center justify-center gap-3">
                  <Scale className="h-10 w-10" />
                  Compare Courses
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-bold tracking-wide max-w-2xl mx-auto">
                Make informed decisions by directly evaluating multiple courses side by side
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          <Alert className="border-primary/20 bg-primary/5">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>How to use this tool</AlertTitle>
            <AlertDescription className="text-sm">
              Select up to 4 courses to compare their ratings, difficulty, workload, and student reviews.
              Use the comparison table and charts to make data-driven decisions about your course selection.
            </AlertDescription>
          </Alert>

          <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 shadow-xl transition-all duration-300 hover:shadow-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black font-mono">Select Courses</h2>
              {selectedCourses.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="font-mono"
                >
                  Clear All
                </Button>
              )}
            </div>
            <CourseSelector
              selectedCourses={selectedCourses}
              onCoursesChange={handleCoursesChange}
              maxCourses={4}
            />
          </div>

          {selectedCourses.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-12 text-center">
              <Info className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-bold mb-2">No courses selected</h3>
              <p className="text-muted-foreground">
                Select at least 2 courses from the selector above to start comparing
              </p>
            </div>
          ) : selectedCourses.length === 1 ? (
            <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-12 text-center">
              <Info className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-bold mb-2">Add more courses</h3>
              <p className="text-muted-foreground">
                Select at least one more course to enable comparison
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black font-mono mb-4 flex items-center gap-2">
                  📋 Side-by-Side Comparison
                </h2>
                <ComparisonTable courses={selectedCourses} />
              </div>

              <div>
                <h2 className="text-2xl font-black font-mono mb-4 flex items-center gap-2">
                  📊 Visual Metrics
                </h2>
                <ComparisonCharts courses={selectedCourses} />
              </div>

              <div>
                <h2 className="text-2xl font-black font-mono mb-4 flex items-center gap-2">
                  💬 Student Insights
                </h2>
                <ReviewHighlights courses={selectedCourses} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
