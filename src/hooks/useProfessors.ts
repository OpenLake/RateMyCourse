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
  
  const { data, error } = await supabase
    .from('professors')
    .select('rating, reviewCount, professors')
    .eq('id', professorId)
    .single();
  
  if (error) {
    console.error("Error fetching professor data:", error);
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
      
          fetchedProfessors.push({
            id: "1",
            name: professor.name,
            email: professor.email,
            research_interests: professor.research_interests,
            post: professor.post || "Faculty",
            website: professor.website,
            avatar_url: professor.avatar_url,
            department: professor.department.includes("MT_people")
                        ? "Mechatronics Engineering"
                        : professor.department.replace(/^Department of\s*/i, '').trim(),
      
            rating: {
              overall: 3,
              knowledge: 3,
              teaching: 3,
              approachability: 3,
            },
            reviewCount: 0,
            courses: [],
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
  // Uncomment if you want to fetch dynamic data
  /*
  const loadDynamicData = async (professors: Professor[]) => {
    const updatedProfessors = await Promise.all(
      professors.map(async (professor) => {
        try {
          const dynamicData = await fetchDynamicProfessorData(professor.id);
          return {
            ...professor,
            rating: dynamicData?.rating || professor.rating,
            reviewCount: dynamicData?.reviewCount || professor.reviewCount,
            professors: dynamicData?.professors || professor.professors,
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
  */

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
};