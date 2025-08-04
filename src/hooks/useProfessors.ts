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

  // Fetch dynamic rating data
  const { data: professorData, error: professorError } = await supabase
    .from("professors")
    .select(
      "id, overall_rating, knowledge_rating, teaching_rating, approachability_rating, review_count"
    )
    .eq("id", professorId)
    .single();

  if (professorError) {
    console.error("Error fetching professor data:", professorError);
    return {};
  }

  // Fetch courses linked to this professor
  const { data: coursesData, error: coursesError } = await supabase
    .from("professors_courses")
    .select("course_id")
    .eq("professor_id", professorId);

  if (coursesError) {
    console.error("Error fetching courses for professor:", coursesError);
    return professorData;
  }

  const courseIds = coursesData?.map((item) => item.course_id) || [];

  if (professorData) {
    return {
      overall_rating: professorData.overall_rating,
      knowledge_rating: professorData.knowledge_rating,
      teaching_rating: professorData.teaching_rating,
      approachability_rating: professorData.approachability_rating,
      review_count: professorData.review_count,
      course_ids: courseIds,
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
      // Fetch static JSON
      const response = await fetch("/generated/professors.json");
      const data = await response.json();
      const flatProfessors = data.flat();
      console.log("Flattened Professors:", flatProfessors);

      // Fetch IDs from Supabase to map JSON professors
      const { data: supabaseProfs, error: supabaseError } = await supabase
        .from("professors")
        .select("id, email");

      if (supabaseError) {
        console.error(
          "Error fetching professor IDs from Supabase:",
          supabaseError
        );
        return;
      }

      const seen = new Set<string>();
      const fetchedProfessors: Professor[] = [];

      for (const professor of flatProfessors) {
        const uniqueKey = `${professor.name
          .toLowerCase()
          .trim()}|${professor.email?.toLowerCase().trim()}`;

        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);

          // Match Supabase professor by email
          const supabaseProf = supabaseProfs.find(
            (sp) =>
              sp.email?.toLowerCase().trim() ===
              professor.email?.toLowerCase().trim()
          );

          // Use Supabase ID if available, else generate fallback UUID
          const professorId = supabaseProf?.id ?? crypto.randomUUID();

          fetchedProfessors.push({
            id: professorId,
            name: professor.name,
            email: professor.email,
            research_interests: professor.research_interests || [],
            post: professor.post || "Faculty",
            website: professor.website || null,
            avatar_url: professor.avatar_url || null,
            department: professor.department.includes("MT_people")
              ? "Mechatronics Engineering"
              : professor.department.replace(/^Department of\s*/i, "").trim(),
            overall_rating: 0,
            knowledge_rating: 0,
            teaching_rating: 0,
            approachability_rating: 0,
            review_count: 0,
            created_at: new Date(),
            updated_at: new Date(),
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

  // Merge dynamic data (ratings) with static data
  const loadDynamicData = async (professors: Professor[]) => {
    const updatedProfessors = await Promise.all(
      professors.map(async (professor) => {
        try {
          const dynamicData = await fetchDynamicProfessorData(professor.id);
          return {
            ...professor,
            overall_rating:
              dynamicData?.overall_rating ?? professor.overall_rating,
            knowledge_rating:
              dynamicData?.knowledge_rating ?? professor.knowledge_rating,
            teaching_rating:
              dynamicData?.teaching_rating ?? professor.teaching_rating,
            approachability_rating:
              dynamicData?.approachability_rating ??
              professor.approachability_rating,
            review_count: dynamicData?.review_count ?? professor.review_count,
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

  // Initial load
  useEffect(() => {
    loadStaticProfessors();
  }, []);

  const [isStaticLoaded, setIsStaticLoaded] = useState(false);

  useEffect(() => {
    loadStaticProfessors().then(() => {
      setIsStaticLoaded(true);
    });
  }, []);

  // Optional: Enable this if you want ratings after static load
  /*
  useEffect(() => {
    if (isStaticLoaded) {
      loadDynamicData(state.professors);
    }
  }, [isStaticLoaded, state.professors]);
  */

  return state;
};
