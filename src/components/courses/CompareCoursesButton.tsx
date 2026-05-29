'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Scale, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const STORAGE_KEY = 'course_comparison_list';

const getComparisonList = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export default function CompareCoursesButton() {
  const [comparisonCount, setComparisonCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const updateState = () => {
      const list = getComparisonList();
      setComparisonCount(list.length);
    };

    updateState();
    window.addEventListener('comparison-list-updated', updateState);
    return () => window.removeEventListener('comparison-list-updated', updateState);
  }, []);

  const handleClick = () => {
    const list = getComparisonList();
    if (list.length === 0) {
      router.push('/courses/compare');
    } else if (list.length < 2) {
      alert('Please add at least one more course to start comparing.');
    } else {
      router.push(`/courses/compare?courses=${list.join(',')}`);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="w-full font-mono font-bold group relative overflow-hidden border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
      <Scale className="h-4 w-4 mr-2 relative z-10" />
      <span className="relative z-10">Compare Courses</span>
      {comparisonCount > 0 && (
        <Badge 
          variant="secondary" 
          className="ml-2 relative z-10 rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
        >
          {comparisonCount}
        </Badge>
      )}
      <ArrowRight className="h-4 w-4 ml-auto relative z-10 group-hover:translate-x-1 transition-transform" />
    </Button>
  );
}
