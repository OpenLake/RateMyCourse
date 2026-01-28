'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import { useCourses } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CourseSelectorProps {
  selectedCourses: Course[];
  onCoursesChange: (courses: Course[]) => void;
  maxCourses?: number;
}

export default function CourseSelector({
  selectedCourses,
  onCoursesChange,
  maxCourses = 4,
}: CourseSelectorProps) {
  const { courses } = useCourses();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableCourses = courses.filter(
    (course) => !selectedCourses.find((sc) => sc.id === course.id)
  );

  const handleSelectCourse = (course: Course) => {
    if (selectedCourses.length < maxCourses) {
      onCoursesChange([...selectedCourses, course]);
      setOpen(false);
      setSearchQuery('');
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    onCoursesChange(selectedCourses.filter((c) => c.id !== courseId));
  };

  return (
    <div className="space-y-4">
      {/* Selected Courses */}
      {selectedCourses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCourses.map((course) => (
            <Badge
              key={course.id}
              variant="secondary"
              className="px-3 py-2 text-sm font-mono flex items-center gap-2 hover:bg-secondary/80 transition-colors"
            >
              <span className="font-bold">{course.code}</span>
              <span className="text-muted-foreground">•</span>
              <span className="max-w-[200px] truncate">{course.title}</span>
              <button
                onClick={() => handleRemoveCourse(course.id)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Course Button */}
      {selectedCourses.length < maxCourses && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-mono"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add course to compare ({selectedCourses.length}/{maxCourses})
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[500px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search courses by name or code..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No courses found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {availableCourses
                    .filter(
                      (course) =>
                        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        course.code.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 50)
                    .map((course) => (
                      <CommandItem
                        key={course.id}
                        value={course.id}
                        onSelect={() => handleSelectCourse(course)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1">
                            <div className="font-bold font-mono text-sm">
                              {course.code}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {course.title}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{course.department}</span>
                            <span>•</span>
                            <span>⭐ {course.overall_rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {selectedCourses.length >= maxCourses && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Maximum {maxCourses} courses selected. Remove a course to add another.
        </p>
      )}
    </div>
  );
}
