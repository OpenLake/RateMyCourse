"use client";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCourses } from "@/hooks/useCourses";
import CoursePageHeader from "@/components/courses/course_page/CoursePageHeader";
import CoursePageStats from "@/components/courses/course_page/CoursePageStats";
import CoursePageReviews from "@/components/courses/course_page/CoursePageReviews";
import RateThisCourse from "@/components/courses/course_page/RateThisCourse";
import AddToComparison from "@/components/courses/course_page/AddToComparison";
import Example from "@/components/courses/course_page/CoursePageLoader";

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const { courses, isLoading } = useCourses();
  const [averageRating, setAverageRating] = useState(0);
  const [difficultyRating, setDifficultyRating] = useState(0);
  const [workloadRating, setWorkloadRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [courseUUID, setCourseUUID] = useState<string | null>(null);

  const course = courses.find((course) => course.id === params.courseId);

  /* ---------- Fetch Course UUID from Supabase ---------- */
  useEffect(() => {
    if (!course?.code) return;

    const fetchCourseUUID = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id')
        .eq('code', course.code.toUpperCase())
        .single();

      if (data && !error) {
        setCourseUUID(data.id);
      } else {
        console.error('Error fetching course UUID:', error);
      }
    };

    fetchCourseUUID();
  }, [course?.code]);

  /* ---------- Fetch Ratings to Compute Averages ---------- */
  useEffect(() => {
    if (!courseUUID) return;

    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating_value, difficulty_rating, workload_rating")
        .eq("target_id", courseUUID)
        .eq("target_type", "course");

      if (error) {
        console.error("Error fetching ratings:", error.message);
        return;
      }

      if (data && data.length > 0) {
        const total = data.reduce((sum, r) => sum + (r.rating_value ?? 0), 0);
        const avg = total / data.length;

        const difficultyValues = data
          .map((r) => r.difficulty_rating)
          .filter((value): value is number => typeof value === "number");
        const workloadValues = data
          .map((r) => r.workload_rating)
          .filter((value): value is number => typeof value === "number");

        const difficultyAvg = difficultyValues.length
          ? difficultyValues.reduce((sum, value) => sum + value, 0) / difficultyValues.length
          : 0;
        const workloadAvg = workloadValues.length
          ? workloadValues.reduce((sum, value) => sum + value, 0) / workloadValues.length
          : 0;

        setAverageRating(parseFloat(avg.toFixed(1)));
        setDifficultyRating(parseFloat(difficultyAvg.toFixed(1)));
        setWorkloadRating(parseFloat(workloadAvg.toFixed(1)));
        setReviewCount(data.length);
      } else {
        setAverageRating(0);
        setDifficultyRating(0);
        setWorkloadRating(0);
        setReviewCount(0);
      }
    };

    fetchRatings();
  }, [courseUUID]);

  if (isLoading) {
    return <Example />;
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 min-h-[calc(100vh-6rem)] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
        {/* Left Section */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Course Header with modern styling */}
          <div className="bg-gradient-to-br dark:from-blue-600/20 dark:to-purple-700/20 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-md shadow-2xl  shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 ">
            <CoursePageHeader
              course={course}
              averageRating={averageRating}
              difficultyRating={difficultyRating}
              reviewCount={reviewCount}
            />
          </div>

          {/* Stats Grid - 2x2 Layout */}
          <div className=" rounded-2xl p-6 backdrop-blur-md shadow-xl transition-all duration-300 border border-border bg-gradient-to-b from-background to-muted/40 hover:shadow-primary/20">
            <CoursePageStats
              overallRating={averageRating}
              difficultyRating={difficultyRating}
              workloadRating={workloadRating}
              reviewCount={reviewCount}
            />
          </div>

          {/* Reviews Section with modern container */}
          <div className="rounded-2xl p-6 backdrop-blur-md shadow-xl transition-all duration-300 border border-border bg-gradient-to-b from-background to-muted/40 hover:shadow-primary/20">
            <CoursePageReviews id={courseUUID} reviewCount={reviewCount} />
          </div>
        </div>

        {/* Right Section - Sticky Sidebar */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-8 space-y-6">
            {/* Add to Comparison Card */}
            <AddToComparison course={course} />
            
            {/* Rate This Course Card */}
            <div className="rounded-2xl p-6 backdrop-blur-md shadow-xl transition-all duration-300 border border-border bg-gradient-to-b from-background to-muted/40 hover:shadow-primary/20">
              {courseUUID && <RateThisCourse courseId={courseUUID} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
