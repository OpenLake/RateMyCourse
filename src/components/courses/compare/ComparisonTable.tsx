'use client';

import { Course } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StarRating } from '@/components/common/StarRating';
import { DifficultyBadge } from '@/components/common/DifficultyBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, TrendingUp, Zap, MessageSquare } from 'lucide-react';
import departmentProperties from '@/constants/department';

interface ComparisonTableProps {
  courses: Course[];
}

export default function ComparisonTable({ courses }: ComparisonTableProps) {
  if (courses.length === 0) {
    return null;
  }

  const getDepartmentColor = (department: string) => {
    const dept = departmentProperties.find((d) => d.name === department);
    return dept?.color || '#718096';
  };

  const comparisonRows = [
    {
      label: 'Course Code',
      icon: BookOpen,
      render: (course: Course) => (
        <span className="font-bold font-mono text-primary">{course.code}</span>
      ),
    },
    {
      label: 'Department',
      icon: BookOpen,
      render: (course: Course) => (
        <Badge
          variant="outline"
          style={{
            borderColor: getDepartmentColor(course.department),
            color: getDepartmentColor(course.department),
          }}
        >
          {course.department}
        </Badge>
      ),
    },
    {
      label: 'Credits',
      icon: TrendingUp,
      render: (course: Course) => (
        <span className="font-semibold">{course.credits}</span>
      ),
    },
    {
      label: 'Overall Rating',
      icon: Zap,
      render: (course: Course) => (
        <div className="flex items-center gap-2">
          <StarRating rating={course.overall_rating} size="small" />
          <span className="text-sm font-bold">
            {course.overall_rating.toFixed(1)}
          </span>
        </div>
      ),
    },
    {
      label: 'Difficulty',
      icon: Zap,
      render: (course: Course) => (
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={course.difficulty_rating} showText />
          <span className="text-sm font-semibold">
            {course.difficulty_rating.toFixed(1)}/5
          </span>
        </div>
      ),
    },
    {
      label: 'Workload',
      icon: TrendingUp,
      render: (course: Course) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(course.workload_rating / 5) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold min-w-[3rem] text-right">
            {course.workload_rating.toFixed(1)}/5
          </span>
        </div>
      ),
    },
    {
      label: 'Reviews',
      icon: MessageSquare,
      render: (course: Course) => (
        <span className="font-semibold">
          {course.review_count} {course.review_count === 1 ? 'review' : 'reviews'}
        </span>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden border-border/60 bg-card/40 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[200px] font-black text-foreground sticky left-0 bg-muted/50 z-10">
                  Metric
                </TableHead>
                {courses.map((course, idx) => (
                  <TableHead
                    key={course.id}
                    className="text-center font-bold min-w-[250px]"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-mono text-primary">
                        {course.code}
                      </div>
                      <div className="text-xs text-muted-foreground font-normal line-clamp-2">
                        {course.title}
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonRows.map((row, idx) => {
                const Icon = row.icon;
                return (
                  <TableRow
                    key={idx}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-bold sticky left-0 bg-background z-10 border-r border-border/40">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{row.label}</span>
                      </div>
                    </TableCell>
                    {courses.map((course) => (
                      <TableCell key={course.id} className="text-center">
                        {row.render(course)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
