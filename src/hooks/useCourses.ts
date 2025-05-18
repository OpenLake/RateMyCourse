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
  
  const { data, error } = await supabase
    .from('courses')
    .select('rating, reviewCount, professors')
    .eq('id', courseId)
    .single();
  
  if (error) {
    console.error("Error fetching course data:", error);
    return {};
  }
  
  if (data) {
    return {
      rating: data.rating,
      reviewCount: data.reviewCount,
      professors: data.professors,
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
      
      const fetchedCourses = flatCourses.map((course: Course) => ({
        id: course.id,
        code: course.code,
        title: course.title,
        department: course.department,
        credits: course.credits,
        rating: {
          overall: 3,
          difficulty: 3,
          workload: 3,
        },
        reviewCount: 0,
        professors: ["Dr. Amay"],
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
  // Uncomment if you want to fetch dynamic data
  /*
  const loadDynamicData = async (courses: Course[]) => {
    const updatedCourses = await Promise.all(
      courses.map(async (course) => {
        try {
          const dynamicData = await fetchDynamicCourseData(course.id);
          return {
            ...course,
            rating: dynamicData?.rating || course.rating,
            reviewCount: dynamicData?.reviewCount || course.reviewCount,
            professors: dynamicData?.professors || course.professors,
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
  */

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
  /*
  useEffect(() => {
    if (isStaticLoaded) {
      loadDynamicData(state.courses);
    }
  }, [isStaticLoaded, state.courses]);
  */

  return state;
};