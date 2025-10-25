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

  // FIX: Changed .single() to .maybeSingle()
  // This gracefully handles cases where a professor ID might not exist in the table,
  // preventing the 'PGRST116' error.
  const { data: professorData, error: professorError } = await supabase
    .from("professors")
    .select(
      "id, overall_rating, knowledge_rating, teaching_rating, approachability_rating, review_count"
    )
    .eq("id", professorId)
    .maybeSingle(); // <-- FIX

  if (professorError) {
    // We no longer log the PGRST116 error as an error, since it's expected
    if (professorError.code !== 'PGRST116') {
        console.error("Error fetching professor data:", professorError);
    }
    return null; // Return null on error or if 0 rows
  }

  // Fetch courses linked to this professor (This part seems fine)
  const { data: coursesData, error: coursesError } = await supabase
    .from("professors_courses")
    .select("course_id")
    .eq("professor_id", professorId);

  if (coursesError) {
    console.error("Error fetching courses for professor:", coursesError);
    // Return the professor data we have, even if courses fail
    return professorData;
  }

  const courseIds = coursesData?.map((item) => item.course_id) || [];

  if (professorData) {
    return {
      ...professorData, // Spread the fields from professorData
      course_ids: courseIds,
    };
  }

  return null; // Return null if no professor data
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

  // FIX: Refactored into a single useEffect to prevent infinite loops
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const loadAllData = async () => {
      try {
        // 1. Load Static Data from JSON
        const response = await fetch("/generated/professors.json");
        if (!response.ok) {
            throw new Error(`Failed to fetch static professors: ${response.statusText}`);
        }
        const data = await response.json();
        const flatProfessors = data.flat();
        console.log("Flattened Professors:", flatProfessors);

        // Fetch IDs from Supabase to map JSON professors
        const { data: supabaseProfs, error: supabaseError } = await supabase
          .from("professors")
          .select("id, email");

        if (supabaseError) {
          throw new Error(`Failed to fetch professor IDs: ${supabaseError.message}`);
        }

        const seen = new Set<string>();
        const staticProfessors: Professor[] = [];

        // Build static professor list
        for (const professor of flatProfessors) {
          const uniqueKey = `${professor.name
            .toLowerCase()
            .trim()}|${professor.email?.toLowerCase().trim()}`;

          if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);

            const supabaseProf = supabaseProfs.find(
              (sp) =>
                sp.email?.toLowerCase().trim() ===
                professor.email?.toLowerCase().trim()
            );

            const professorId = supabaseProf?.id ?? crypto.randomUUID();

            staticProfessors.push({
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
        
        if (!isMounted) return;
        setState(prevState => ({ ...prevState, professors: staticProfessors, isLoading: true }));

        // 2. Load Dynamic Data
        const updatedProfessors = await Promise.all(
          staticProfessors.map(async (professor) => {
            try {
              const dynamicData = await fetchDynamicProfessorData(professor.id);
              if (dynamicData) {
                  return {
                    ...professor,
                    overall_rating:
                      dynamicData.overall_rating ?? professor.overall_rating,
                    knowledge_rating:
                      dynamicData.knowledge_rating ?? professor.knowledge_rating,
                    teaching_rating:
                      dynamicData.teaching_rating ?? professor.teaching_rating,
                    approachability_rating:
                      dynamicData.approachability_rating ??
                      professor.approachability_rating,
                    review_count: dynamicData.review_count ?? professor.review_count,
                  };
              }
              return professor; // Return static data if no dynamic data found
            } catch (error) {
              console.error("Error fetching dynamic data for prof:", professor.name, error);
              return professor; // Return static data on error
            }
          })
        );
        
        if (!isMounted) return;
        
        // 3. Set Final State
        setState({
          professors: updatedProfessors,
          isLoading: false,
          error: null,
        });

      } catch (error) {
        console.error("Error loading professor data:", error);
        if (isMounted) {
          setState((prevState): ProfessorsState => ({
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