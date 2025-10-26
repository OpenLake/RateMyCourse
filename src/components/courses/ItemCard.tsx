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
    { label: 'Overall', value: overallRating },
    {
      label: type === 'course' ? 'Difficulty' : 'Knowledge',
      value: rating1 ? rating1 / 2 : 0,
    },
    {
      label: type === 'course' ? 'Workload' : 'Teaching',
      value: rating2 ? rating2 / 2 : 0,
    },
  ];

  return (
    <Link href={link} className="block w-full group">
      <Card
        className={`h-full overflow-hidden transition-all duration-300 border border-border/60 bg-card/40 backdrop-blur-sm hover:border-primary/50 hover:bg-card/60 hover:shadow-xl hover:shadow-primary/5 ${
          isHovered ? 'scale-[1.02]' : 'scale-100'
        } ${className || ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Department color accent bar */}
        <div
          className="transition-all duration-300 h-1"
          style={{
            background: `linear-gradient(90deg, ${deptProps.color} 0%, ${deptProps.color}80 100%)`,
          }}
        />

        <CardContent className="p-4 pt-4">
          {/* Header with Avatar/Icon */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${deptProps.color}15` }}
            >
              {type === 'course' ? (
                <DeptIcon className="h-6 w-6" style={{ color: deptProps.color }} />
              ) : (
                <Avatar className="h-12 w-12 border-2 transition-all duration-300 group-hover:border-primary" style={{ borderColor: `${deptProps.color}40` }}>
                  <AvatarImage src={avatar} />
                  <AvatarFallback className="font-bold font-mono" style={{ backgroundColor: `${deptProps.color}20`, color: deptProps.color }}>
                    {title.replace('Dr.', '').split(' ').map((text, idx) => (
                      <span key={idx}>{text[0]}</span>
                    ))}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-black text-base line-clamp-2 tracking-tight leading-tight group-hover:text-primary transition-colors duration-300">
                {title}
              </h3>

              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-bold font-mono tracking-wide text-muted-foreground">
                  {subtitle}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>
            </div>
          </div>

          {/* Ratings with modern styling */}
          <div className="flex flex-col gap-2 mb-3">
            {ratings.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-background/60 backdrop-blur-sm border border-border/40 px-3 py-2 rounded-md transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.1em] text-muted-foreground truncate">{label}</span>
                <div className="flex items-center gap-2">
                  <StarRating rating={value ?? 0} color={deptProps.color} />
                  <span className="text-xs font-black font-mono tabular-nums text-primary min-w-[2rem] text-right">
                    {value !== null ? value.toFixed(1) : "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Meta info with icons */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="font-mono">
                {subtext} {type === 'course' ? `Credits` : ``}
              </span>
            </div>
            {type === 'course' && count > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-mono">{count} Profs</span>
                </div>
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 bg-background/40 backdrop-blur-sm border-t border-border/40 flex justify-between items-center group-hover:bg-primary/5 transition-all duration-300">
          <div className="text-xs font-bold font-mono tracking-wide text-primary">
            View Details
          </div>
          <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 group-hover:translate-x-1 transition-all duration-300">
            <ChevronRight className="h-3.5 w-3.5 text-primary" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
