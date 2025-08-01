import Link from 'next/link';
import { getRelatedCourses } from '@/lib/data/courses';
import { StarRating } from '@/components/common/StarRating';

interface RelatedCoursesProps {
  currentCourseId: string;
}

export default function RelatedCourses({ currentCourseId }: RelatedCoursesProps) {
  const relatedCourses = getRelatedCourses(currentCourseId);

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="font-medium text-lg">Related Courses</h3>
      
      <div className="space-y-4">
        {relatedCourses.map((course) => (
          <Link 
            key={course.id} 
            href={`/courses/${course.id}`}
            className="block"
          >
            <div className="flex flex-col p-3 hover:bg-muted rounded-md transition-colors">
              <h4 className="font-medium">{course.name}</h4>
              <p className="text-xs text-muted-foreground">{course.code}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs">{course.credits} Credits</p>
                <StarRating rating={course.rating} size="small" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}