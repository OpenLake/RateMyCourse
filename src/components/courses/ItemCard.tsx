// File: src/components/common/ItemCard.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { StarRating } from '@/components/common/StarRating';
import { BookOpen, Users, ChevronRight, BookMarked } from 'lucide-react';
import { Course, Professor } from '@/types';
import departmentProperties from '@/constants/department';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ItemCardProps {
  item: Course | Professor;
  className?: string;
  type: 'course' | 'professor';
}

export default function ItemCard({ item, className, type }: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Prepare data based on type
  const getItemData = () => {
    if (type === 'course') {
      const course = item as Course;
      return {
        reviewCount: course.review_count,
        overallRating: course.overall_rating || 0,
        rating1: course.difficulty_rating || 0,
        rating2: course.workload_rating || 0,
        count: 0, // can pass professor count later if needed
        title: course.title,
        subtitle: course.code,
        subtext: course.credits,
        link: `/courses/${course.id}`,
        avatar: '',
      };
    } else {
      const professor = item as Professor;
      return {
        reviewCount: professor.review_count,
        overallRating: professor.overall_rating || 0,
        rating1: professor.knowledge_rating || 0,
        rating2: professor.teaching_rating || 0,
        count: 0, // can pass course count later if needed
        title: professor.name,
        subtitle: professor.post,
        subtext: professor.email,
        link: `/professors/${professor.id}`,
        avatar: professor.avatar_url || '',
      };
    }
  };

  const {
    reviewCount,
    overallRating,
    rating1,
    rating2,
    count,
    title,
    subtitle,
    subtext,
    link,
    avatar,
  } = getItemData();

  const deptProps = useMemo(() => {
    return (
      departmentProperties.find((dept) => dept.name === item.department) || {
        id: item.department || 'GEN',
        name: item.department || 'General',
        color: '#718096',
        icon: BookMarked,
      }
    );
  }, [item.department]);

  const DeptIcon = deptProps.icon || BookMarked;

const ratings = [
  { label: 'Overall', value: overallRating }, // already out of 5
  {
    label: type === 'course' ? 'Difficulty' : 'Knowledge',
    value: rating1 ? rating1 / 2 : 0,  // convert 10 → 5
  },
  {
    label: type === 'course' ? 'Workload' : 'Teaching',
    value: rating2 ? rating2 / 2 : 0,  // convert 10 → 5
  },
];


  return (
    <Link href={link} className="block w-full group">
      <Card
        className={`h-full overflow-hidden transition-all duration-300 border border-gray-200 dark:border-gray-700 ${
          isHovered ? 'shadow-md translate-y-px' : 'shadow-sm'
        } ${className || ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="transition-all duration-300 h-1.5 group-hover:h-2"
          style={{ backgroundColor: deptProps.color }}
        />

        <CardContent className="p-4 pt-5">
          {/* Avatar or Icon */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${deptProps.color}20` }}
            >
              {type === 'course' ? (
                <DeptIcon className="h-5 w-5" style={{ color: deptProps.color }} />
              ) : (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>
                    {title.replace('Dr.', '').split(' ').map((text, idx) => (
                      <span key={idx}>{text[0]}</span>
                    ))}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg line-clamp-1 text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {subtitle}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="flex flex-col gap-1.5 mb-3 text-[13px] font-medium text-gray-700 dark:text-gray-300">
            {ratings.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md shadow-sm"
              >
                <span className="truncate">{label}:</span>
                <div className="flex items-center gap-1">
                  <StarRating rating={value ?? 0} color={deptProps.color} />
<span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
  {value !== null ? value.toFixed(1) : "N/A"}
</span>

                </div>
              </div>
            ))}
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-3">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <BookOpen className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>
                {subtext} {type === 'course' ? `Credits` : ``}
              </span>
            </div>
            {type === 'course' && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Users className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span>{count} Professors</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors duration-200">
          <div className="text-sm font-medium text-primary">
            View {type.charAt(0).toUpperCase() + type.slice(1)} Details
          </div>
          <div className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-sm group-hover:translate-x-0.5 transition-all duration-200">
            <ChevronRight className="h-4 w-4 text-primary" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
