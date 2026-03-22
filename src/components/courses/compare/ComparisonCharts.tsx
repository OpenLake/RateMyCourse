'use client';

import { Course } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Trophy, Feather, MessageSquare, Target } from 'lucide-react';

interface ComparisonChartsProps {
  courses: Course[];
}

export default function ComparisonCharts({ courses }: ComparisonChartsProps) {
  if (courses.length === 0) {
    return null;
  }

  const getSeriesKey = (course: Course) => `${course.code}-${course.id}`;

  // Color palette for courses
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
  ];

  // Data for Overall Ratings Bar Chart
  const ratingsData = [
    {
      metric: 'Overall',
      ...courses.reduce((acc, course) => {
        acc[getSeriesKey(course)] = course.overall_rating;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'Difficulty',
      ...courses.reduce((acc, course) => {
        acc[getSeriesKey(course)] = course.difficulty_rating;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'Workload',
      ...courses.reduce((acc, course) => {
        acc[getSeriesKey(course)] = course.workload_rating;
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  const bestOverall = courses.reduce((best, current) =>
    current.overall_rating > best.overall_rating ? current : best
  );

  const lightestWorkload = courses.reduce((best, current) =>
    current.workload_rating < best.workload_rating ? current : best
  );

  const mostReviewed = courses.reduce((best, current) =>
    current.review_count > best.review_count ? current : best
  );

  const bestBalance = courses.reduce((best, current) => {
    const bestScore = best.overall_rating - ((best.difficulty_rating + best.workload_rating) / 2);
    const currentScore = current.overall_rating - ((current.difficulty_rating + current.workload_rating) / 2);
    return currentScore > bestScore ? current : best;
  });

  return (
    <div className="space-y-6">
      {/* Ratings Comparison Bar Chart */}
      <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Ratings Comparison
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Compare overall rating, difficulty, and workload across courses
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingsData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="metric"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                domain={[0, 5]}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              {courses.map((course, idx) => (
                <Bar
                  key={course.id}
                  dataKey={getSeriesKey(course)}
                  name={course.code}
                  fill={colors[idx % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ Quick Takeaways
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            A fast summary of which course leads by goal
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border/60 bg-background/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                Best Overall
              </div>
              <p className="font-mono font-bold text-primary">{bestOverall.code}</p>
              <p className="text-sm">{bestOverall.overall_rating.toFixed(1)}/5 rating</p>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Feather className="h-4 w-4" />
                Lightest Workload
              </div>
              <p className="font-mono font-bold text-primary">{lightestWorkload.code}</p>
              <p className="text-sm">{lightestWorkload.workload_rating.toFixed(1)}/5 workload</p>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                Most Reviewed
              </div>
              <p className="font-mono font-bold text-primary">{mostReviewed.code}</p>
              <p className="text-sm">{mostReviewed.review_count} student reviews</p>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/60 p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                Best Rating-to-Effort
              </div>
              <p className="font-mono font-bold text-primary">{bestBalance.code}</p>
              <p className="text-sm">High rating with lower effort profile</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
