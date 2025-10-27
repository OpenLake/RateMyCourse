import { DifficultyBadge } from '@/components/common/DifficultyBadge';
import { StarRating } from '@/components/common/StarRating';
import { Course } from '@/types';
import React from 'react';

interface CoursePageHeaderProps {
  course: Course;
  averageRating: number;      // dynamic avg
  reviewCount: number;        // dynamic count
}

const CoursePageHeader = ({ course, averageRating, reviewCount }: CoursePageHeaderProps) => {
  return (
    <div>
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            {/* Course Meta Info */}
            <div className="flex flex-wrap items-center gap-2 text-sm mb-1">
              <span className="px-3 py-1 bg-blue-600 text-xs sm:text-sm font-semibold rounded-full">
                {course.code}
              </span>
              <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm px-1">
                {course.department}
              </span>
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm px-1">
                {course.credits} Credits
              </span>
            </div>

            {/* Course Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 py-2">
              {course.title}
            </h1>

            {/* Rating + Difficulty Row */}
            <div className="flex items-center mt-2 gap-6">
              <div className="flex items-center">
                <StarRating rating={averageRating} />
                <span className="text-xs text-muted-foreground dark:text-gray-400 ml-2">
                  ({reviewCount} reviews)
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-sm mr-2 text-gray-700 dark:text-gray-300">
                  Difficulty:
                </span>
                <DifficultyBadge
                  difficulty={course.difficulty_rating ?? 0}
                  showText
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePageHeader;
