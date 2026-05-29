'use client';

import { Course } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import departmentProperties from '@/constants/department';

interface ComparisonChartsProps {
  courses: Course[];
}

export default function ComparisonCharts({ courses }: ComparisonChartsProps) {
  if (courses.length === 0) {
    return null;
  }

  const getDepartmentColor = (department: string) => {
    const dept = departmentProperties.find((d) => d.name === department);
    return dept?.color || '#718096';
  };

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
      ...courses.reduce((acc, course, idx) => {
        acc[course.code] = course.overall_rating;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'Difficulty',
      ...courses.reduce((acc, course, idx) => {
        acc[course.code] = course.difficulty_rating;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: 'Workload',
      ...courses.reduce((acc, course, idx) => {
        acc[course.code] = course.workload_rating;
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  // Data for Radar Chart
  const radarData = courses.map((course, idx) => ({
    course: course.code,
    overall: course.overall_rating,
    difficulty: course.difficulty_rating,
    workload: course.workload_rating,
    reviews: Math.min(course.review_count / 10, 5), // Normalize reviews to 0-5 scale
    fill: colors[idx % colors.length],
  }));

  // Data for Credits Comparison
  const creditsData = courses.map((course, idx) => ({
    name: course.code,
    credits: course.credits,
    fill: colors[idx % colors.length],
  }));

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
                  dataKey={course.code}
                  fill={colors[idx % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Multi-Metric Radar
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Visual overview of all metrics
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis
                  dataKey="course"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 5]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                {courses.map((course, idx) => (
                  <Radar
                    key={course.id}
                    name={course.code}
                    dataKey="overall"
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.3}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Credits Comparison */}
        <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📚 Course Credits
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare credit hours across courses
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={creditsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
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
                <Bar dataKey="credits" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
