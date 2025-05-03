import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DifficultyBadge } from '@/components/common/DifficultyBadge';
import { Course } from '@/types';

interface CourseStatsProps {
  course: Course;
}

export default function CourseStats({ course }: CourseStatsProps) {
  const ratings = [
    { label: 'Overall', value: course.rating.overall, max: 5 },
    { label: 'Workload', value: course.rating.workload, max: 5 },
    { label: 'Difficulty', value: course.rating.difficulty, max: 5 },
  ];

  const gradeDistribution = [
    { grade: 'A+', percentage: 15 },
    { grade: 'A', percentage: 25 },
    { grade: 'B+', percentage: 20 },
    { grade: 'B', percentage: 15 },
    { grade: 'C+', percentage: 10 },
    { grade: 'C', percentage: 8 },
    { grade: 'D', percentage: 5 },
    { grade: 'F', percentage: 2 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Course Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{rating.label}</span>
                  <span className="font-medium">{rating.value}/{rating.max}</span>
                </div>
                <Progress value={(rating.value / rating.max) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Difficulty</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-center py-2">
            <DifficultyBadge difficulty={course.rating.difficulty} showText large />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {gradeDistribution.map((item) => (
              <div key={item.grade} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.grade}</span>
                  <span>{item.percentage}%</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}