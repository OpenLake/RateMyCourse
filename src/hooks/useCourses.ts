import { Course } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

// Fetching dynamic course metadata (ratings, reviews) from Supabase
const fetchDynamicCourseData = async (courseCode: string) => {
  if (!courseCode) {
    console.error("Invalid courseCode:", courseCode);
    return null;
  }

  // FIX: Query by 'code' (e.g., "mal401") instead of 'id' (which is a UUID)
  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("overall_rating, difficulty_rating, workload_rating, review_count")
    .eq("code", courseCode.toUpperCase()) // <-- Changed 'id' to 'code' and convert to uppercase
    .limit(1)
    .maybeSingle();

  if (courseError) {
    console.error(
      "Error fetching course data:",
      courseError.message,
      courseError.code,
      courseError.message
    );
    return null; // Return null on error
  }

  if (courseData) {
    return {
      overall_rating: courseData.overall_rating,
      difficulty_rating: courseData.difficulty_rating,
      workload_rating: courseData.workload_rating,
      review_count: courseData.review_count,
    };
  }

  return null; // Return null if no data
};

interface CoursesState {
  courses: Course[];
  isLoading: boolean;
  error: Error | null;
}

export const useCourses = () => {
  const [state, setState] = useState<CoursesState>({
    courses: [],
    isLoading: true,
    error: null,
  });

  // *** FIX: Refactored into a single useEffect to prevent infinite loops ***
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const loadAllData = async () => {
      try {
        // 1. Load Static Data from JSON
        const response = await fetch("/generated/result.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch static courses: ${response.statusText}`);
        }
        const data = await response.json();
        const flatCourses = data.flat();
        
        // *** ADDING LOGGING HERE ***
        console.log("[useCourses] Flattened static courses from JSON:", flatCourses);

        const staticCourses: Course[] = flatCourses.map((course: any) => ({
          id: course.id, // This is the code, e.g., "mal401"
          code: course.code,
          title: course.title,
          department: course.department,
          credits: course.credits,
          overall_rating: 0,
          difficulty_rating: 0,
          workload_rating: 0,
          review_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
        }));

        if (!isMounted) return;
        setState((prevState) => ({ 
            ...prevState, 
            courses: staticCourses, 
            isLoading: true 
        }));

        // 2. Load Dynamic Data for each static course
        const updatedCourses = await Promise.all(
          staticCourses.map(async (course) => {
            try {
              const dynamicData = await fetchDynamicCourseData(course.id);
              
              if (dynamicData) {
                return {
                  ...course,
                  overall_rating: dynamicData.overall_rating ?? course.overall_rating,
                  difficulty_rating: dynamicData.difficulty_rating ?? course.difficulty_rating,
                  workload_rating: dynamicData.workload_rating ?? course.workload_rating,
                  review_count: dynamicData.review_count ?? course.review_count,
                };
              }
              return course; // Return static course if no dynamic data
            } catch (error) {
              console.error("Error fetching dynamic data for course:", course.id, error);
              return course; // Return static course on error
            }
          })
        );

        if (!isMounted) return;

        // *** ADDING LOGGING HERE ***
        console.log("[useCourses] Setting final updated courses. Count:", updatedCourses.length);

        // 3. Set final state with merged data and set isLoading to false
        setState({
          courses: updatedCourses,
          isLoading: false,
          error: null,
        });

      } catch (error) {
        console.error("Error loading course data:", error);
        if (isMounted) {
          setState((prevState): CoursesState => ({
            ...prevState,
            isLoading: false,
            error: error as Error,
          }));
        }
      }
    };

    loadAllData();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, []); // <-- Empty dependency array ensures this runs ONLY ONCE

  return state;
};