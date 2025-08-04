"use client";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCourses } from "@/hooks/useCourses";
import CoursePageHeader from "@/components/courses/course_page/CoursePageHeader";
import CoursePageStats from "@/components/courses/course_page/CoursePageStats";
import CoursePageReviews from "@/components/courses/course_page/CoursePageReviews";
import RateThisCourse from "@/components/courses/course_page/RateThisCourse";

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const { courses, isLoading } = useCourses();
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const course = courses.find((course) => course.id === params.courseId);

  /* ---------- Fetch Ratings to Compute Avg + Count ---------- */
  useEffect(() => {
    if (!course?.id) return;

    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("overall_rating")
        .eq("target_id", course.id)
        .eq("target_type", "course");

      if (error) {
        console.error("Error fetching ratings:", error.message);
        return;
      }

      if (data && data.length > 0) {
        const total = data.reduce((sum, r) => sum + (r.overall_rating || 0), 0);
        const avg = total / data.length;
        setAverageRating(parseFloat(avg.toFixed(1)));
        setReviewCount(data.length);
      } else {
        setAverageRating(0);
        setReviewCount(0);
      }
    };

    fetchRatings();
  }, [course?.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="container px-4 md:px-6 py-4 min-h-[calc(100vh-6rem)] mx-auto">
      <div className="grid grid-cols-12 gap-4">
        {/* Left Section */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <CoursePageHeader
            course={course}
            averageRating={averageRating}
            reviewCount={reviewCount}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CoursePageStats reviewCount={reviewCount} />
          </div>

          <CoursePageReviews id={course.id} reviewCount={reviewCount} />
        </div>

        {/* Right Section */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <RateThisCourse courseId={course.id} />
        </div>
      </div>
    </div>
  );
}
