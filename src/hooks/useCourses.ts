import { Course } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const supabase = createClient();

// Fetching dynamic course metadata (ratings, reviews) from Supabase
const fetchDynamicCourseData = async (courseId: string) => {
  if (!courseId) {
    console.error("Invalid courseId:", courseId);
    return null;
  }
  
  // Updated to match the new schema structure with flat fields
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('overall_rating, difficulty_rating, workload_rating, review_count')
    .eq('id', courseId)
     .limit(1).maybeSingle()

  
  if (courseError) {
    console.error("Error fetching course data:", courseError.message,courseError.code,courseError.message);
    return {};
  }

  // Fetch professors linked to this course through the junction table
  // const { data: professorsData, error: professorsError } = await supabase
  //   .from('professors_courses')
  //   .select('professor_id')
  //   .eq('course_id', courseId);

  // if (professorsError) {
  //   console.error("Error fetching professors for course:", professorsError.message,professorsError.code,professorsError.details);
  //   return courseData;
  // }
  
  // Extract professor IDs
  // const professorIds = professorsData?.map(item => item.professor_id) || [];
  // const professorIds=[];
  if (courseData) {
    return {
      overall_rating: courseData.overall_rating,
      difficulty_rating: courseData.difficulty_rating,
      workload_rating: courseData.workload_rating,
      review_count: courseData.review_count,
      // professor_ids: professorIds
    };
  }
  
  return {};
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

  // Function to fetch the static course data from the public/generated/result.json
  const loadStaticCourses = async () => {
    try {
      const response = await fetch("/generated/result.json");
      console.log("Response:", response);
      const data = await response.json();
      const flatCourses = data.flat(); // or data.flatMap(x => x);
      console.log("Flattened Courses:", flatCourses);
      
      // Updated to match the new schema structure with flat fields instead of nested objects
      const fetchedCourses = flatCourses.map((course: any) => ({
        id: course.id,
        code: course.code,
        title: course.title,
        department: course.department,
        credits: course.credits,
        overall_rating: 0,       // Default values using flat field structure
        difficulty_rating: 0,    // Default values using flat field structure
        workload_rating: 0,      // Default values using flat field structure
        review_count: 0,         // Updated field name
        created_at: new Date(),  // Added missing field
        updated_at: new Date(),  // Added missing field
        // Note: professors relationship is now handled via junction table
      }));
      
      setState((prevState) => ({
        ...prevState,
        courses: fetchedCourses,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading static courses:", error);
      setState((prevState): CoursesState => ({
        ...prevState,
        isLoading: false,
        error: error as Error,
      }));
    }
  };

  // Function to fetch dynamic data for each course and merge it with static data
  // Updated to use the new schema structure
  const loadDynamicData = async (courses: Course[]) => {
    const updatedCourses = await Promise.all(
      courses.map(async (course) => {
        try {
          const dynamicData = await fetchDynamicCourseData(course.id);
          return {
            ...course,
            overall_rating: dynamicData?.overall_rating ?? course.overall_rating,
            difficulty_rating: dynamicData?.difficulty_rating ?? course.difficulty_rating,
            workload_rating: dynamicData?.workload_rating ?? course.workload_rating,
            review_count: dynamicData?.review_count ?? course.review_count,
            // Note: We're not storing professor_ids directly on the course object
            // as relationships are now handled via junction table
          };
        } catch (error) {
          console.error("Error fetching dynamic data:", error);
          return course;
        }
      })
    );
    
    setState({
      courses: updatedCourses,
      isLoading: false,
      error: null,
    });
  };

  // Load static course data on initial render
  useEffect(() => {
    loadStaticCourses();
  }, []);

  const [isStaticLoaded, setIsStaticLoaded] = useState(false);
  
  useEffect(() => {
    loadStaticCourses().then(() => {
      setIsStaticLoaded(true);
    });
  }, []);

  // Uncomment if you want to load dynamic data after static data is loaded
  
  useEffect(() => {
    if (isStaticLoaded) {
      loadDynamicData(state.courses);
    }
  }, [isStaticLoaded, state.courses]);
  

  return state;
}