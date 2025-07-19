"use client"
import { notFound } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import AddReviewButton from "@/components/courses/AddReviewButton";
import { ChevronRight, Star, Award, BookOpen, Clock, Users, ThumbsUp, Check } from "lucide-react";
import Link from "next/link";
import PainOMeter from "@/components/courses/PainOMeter";
import { useCourses } from "@/hooks/useCourses";
import CoursePageHeader from "@/components/courses/course_page/CoursePageHeader";
import CoursePageStats from "@/components/courses/course_page/CoursePageStats";
import CoursePageProfessors from "@/components/courses/course_page/CoursePageProfessors";
import GradeDistribution from "@/components/courses/GradeDistribution";
import RateThisCourse from "@/components/courses/course_page/RateThisCourse";
import CoursePageReviews from "@/components/courses/course_page/CoursePageReviews";


export default function CoursePage({ params }: { params: { courseId: string } }) {
  const {courses, isLoading, error}= useCourses()
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const course = courses.find(course => course.id === params.courseId);

  if (!course) {
    notFound();
  }
  return (
    <div className="container px-4 md:px-6 py-4 min-h-[calc(100vh-6rem)] mx-auto">
      <div className="grid grid-cols-12 gap-4">
        
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <CoursePageHeader course={course} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CoursePageStats reviewCount={course.review_count ?? 0} />
            {/* TODO */}
            {/* <CoursePageProfessors professors={course.professors} /> */}
          </div>
          {/* <GradeDistribution /> */}
          <CoursePageReviews id={course.id} reviewCount={course.review_count ?? 0} />
        </div>
        
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <RateThisCourse courseId={course.id}/>

          {/* <PainOMeter
            difficulty={8} 
            workload={7} 
            rating={3}
          /> */}
        </div>
      </div>
    </div>
  );
}