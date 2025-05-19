import { Professor } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

// Create a Supabase client
const supabase = createClient();

const fetchDynamicProfessorData = async (professorId: string) => {
  if (!professorId) {
    console.error("Invalid professorId:", professorId);
    return null;
  }
  
  // Updated to match the new schema structure with flat fields
  const { data: professorData, error: professorError } = await supabase
    .from('professors')
    .select('overall_rating, knowledge_rating, teaching_rating, approachability_rating, review_count')
    .eq('id', professorId)
    .single();
  
  if (professorError) {
    console.error("Error fetching professor data:", professorError);
    return {};
  }
  
  // Fetch courses linked to this professor through the junction table
  const { data: coursesData, error: coursesError } = await supabase
    .from('professors_courses')
    .select('course_id')
    .eq('professor_id', professorId);

  if (coursesError) {
    console.error("Error fetching courses for professor:", coursesError);
    return professorData;
  }
  
  // Extract course IDs
  const courseIds = coursesData?.map(item => item.course_id) || [];
  
  if (professorData) {
    return {
      overall_rating: professorData.overall_rating,
      knowledge_rating: professorData.knowledge_rating,
      teaching_rating: professorData.teaching_rating,
      approachability_rating: professorData.approachability_rating,
      review_count: professorData.review_count,
      course_ids: courseIds
    };
  }
  
  return {};
};

interface ProfessorsState {
  professors: Professor[];
  isLoading: boolean;
  error: Error | null;
}

export const useProfessors = () => {
  const [state, setState] = useState<ProfessorsState>({
    professors: [],
    isLoading: true,
    error: null,
  });

  const loadStaticProfessors = async () => {
    try {
      const response = await fetch("/generated/professors.json");
      console.log("Response:", response);
      const data = await response.json();
      const flatProfessors = data.flat(); // or data.flatMap(x => x);
      console.log("Flattened Professors:", flatProfessors);
      
      const seen = new Set<string>();
      const fetchedProfessors: Professor[] = [];
      
      for (const professor of flatProfessors) {
        const uniqueKey = `${professor.name.toLowerCase().trim()}|${professor.email?.toLowerCase().trim()}`;
      
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
      
          // Updated to match the new schema structure with flat fields
          fetchedProfessors.push({
            id: "1", // You might want to generate proper UUIDs here
            name: professor.name,
            email: professor.email,
            research_interests: professor.research_interests || [],
            post: professor.post || "Faculty",
            website: professor.website || null,
            avatar_url: professor.avatar_url || null,
            department: professor.department.includes("MT_people")
                        ? "Mechatronics Engineering"
                        : professor.department.replace(/^Department of\s*/i, '').trim(),           
            overall_rating: 0,       // Default values using flat field structure
            knowledge_rating: 0,     // Default values using flat field structure
            teaching_rating: 0,      // Default values using flat field structure
            approachability_rating: 0, // Default values using flat field structure
            review_count: 0,        // Updated field name
            created_at: new Date(),  // Added missing field
            updated_at: new Date(),  // Added missing field
            // Note: courses relationship is now handled via junction table
          });
        }
      }
      
      setState((prevState) => ({
        ...prevState,
        professors: fetchedProfessors,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading static professors:", error);
      setState((prevState): ProfessorsState => ({
        ...prevState,
        isLoading: false,
        error: error as Error,
      }));
    }
  };

  // Function to fetch dynamic data for each professor and merge it with static data
  // Updated to use the new schema structure
  const loadDynamicData = async (professors: Professor[]) => {
    const updatedProfessors = await Promise.all(
      professors.map(async (professor) => {
        try {
          const dynamicData = await fetchDynamicProfessorData(professor.id);
          return {
            ...professor,
            overall_rating: dynamicData?.overall_rating ?? professor.overall_rating,
            knowledge_rating: dynamicData?.knowledge_rating ?? professor.knowledge_rating,
            teaching_rating: dynamicData?.teaching_rating ?? professor.teaching_rating,
            approachability_rating: dynamicData?.approachability_rating ?? professor.approachability_rating,
            review_count: dynamicData?.review_count ?? professor.review_count,
            // Note: We're not storing course_ids directly on the professor object
            // as relationships are now handled via junction table
          };
        } catch (error) {
          console.error("Error fetching dynamic data:", error);
          return professor;
        }
      })
    );
  
    setState({
      professors: updatedProfessors,
      isLoading: false,
      error: null,
    });
  };

  useEffect(() => {
    loadStaticProfessors();
  }, []);

  const [isStaticLoaded, setIsStaticLoaded] = useState(false);

  useEffect(() => {
    loadStaticProfessors().then(() => {
      setIsStaticLoaded(true);
    });
  }, []);
  
  // Uncomment if you want to load dynamic data after static data is loaded
  /*
  useEffect(() => {
    if (isStaticLoaded) {
      loadDynamicData(state.professors);
    }
  }, [isStaticLoaded, state.professors]);
  */

  return state;
}