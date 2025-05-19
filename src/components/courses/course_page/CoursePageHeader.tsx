import { DifficultyBadge } from '@/components/common/DifficultyBadge';
import { StarRating } from '@/components/common/StarRating';
import { Course } from '@/types';
import React from 'react'

interface CoursePageHeaderProps {
    course: Course;
}

const CoursePageHeader = ({course}: CoursePageHeaderProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-muted overflow-hidden relative" style={{ background: "url(#headerGradient)" }}>
        <div className="relative z-10">
            <div className="flex justify-between items-start">
            <div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-primary mb-1">
                <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">{course.code}</span>
                <span className="font-medium">{course.department}</span>
                <span>•</span>
                <span>{course.credits} Credits</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
                {/* <p className="text-sm text-muted-foreground max-w-3xl line-clamp-2">{course.description}</p> */}
                
                <div className="flex items-center mt-2 gap-6">
                <div className="flex items-center">
                    <StarRating rating={course.overall_rating ?? 0} />
                    <span className="text-xs text-muted-foreground ml-2">({course.review_count} reviews)</span>
                </div>
                <div className="flex items-center">
                    <span className="font-medium text-sm mr-2">Difficulty:</span>
                    <DifficultyBadge difficulty={course.difficulty_rating ?? 0} showText />
                </div>
                </div>
            </div>
            </div>
        </div>
    </div>
  )
}

export default CoursePageHeader
