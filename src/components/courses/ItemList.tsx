'use client';

import { useEffect, useState, useMemo } from "react";
import { useCourses } from "@/hooks/useCourses";
import { useProfessors } from "@/hooks/useProfessors";
import { Course, Professor } from "@/types";
import ItemCard from "./ItemCard";
import { supabase } from "@/lib/supabase";
import { FiltersState } from "./Filters";
import departmentProperties from "@/constants/department"; // Import department properties

interface ItemListProps {
  type: "course" | "professor";
  filters: FiltersState; // Receive filters as props
}

// Helper function to map difficulty string to numeric range
const getDifficultyRange = (difficultyLabel: string): [number, number] => {
  switch (difficultyLabel) {
    case 'beginner': return [0, 2];     // Corresponds to 'Easy' in badge (0-1.9)
    case 'intermediate': return [2, 3]; // Corresponds to 'Moderate' in badge (2-2.9)
    case 'advanced': return [3, 4];   // Corresponds to 'Challenging' in badge (3-3.9)
    case 'expert': return [4, 5.1];   // Corresponds to 'Difficult' in badge (4-5) - use 5.1 to include 5
    default: return [0, 5.1]; // Default to all if unknown
  }
};

export default function ItemList({ type, filters }: ItemListProps) {
  // 1. Get data from hooks
  const {
    courses,
    isLoading: isCoursesLoading,
    error: coursesError,
  } = useCourses(); // This hook now returns courses WITH ratings

  const {
    professors,
    isLoading: isProfessorsLoading,
    error: professorsError,
  } = useProfessors(); // This hook only returns static professor data

  // 2. This state will hold the final list of items WITH averages
  const [itemsWithAvg, setItemsWithAvg] = useState<(Course | Professor)[]>([]);
  
  // 3. Determine loading and error state
  const [isAggregating, setIsAggregating] = useState(false);
  const isLoading = (type === "course" ? isCoursesLoading : isProfessorsLoading) || isAggregating;
  const error = type === "course" ? coursesError : professorsError;

  // 4. Handle DATA population
  // EFFECT 1: For 'course' type
  useEffect(() => {
    if (type === 'course') {
      setItemsWithAvg(courses);
    }
  }, [type, courses]); // Run when courses array changes

  // EFFECT 2: For 'professor' type
  useEffect(() => {
    if (type === 'professor' && professors.length > 0) {
      setIsAggregating(true);
      
      const fetchAverages = async () => {
        const ids = professors.map((i) => i.id);
        if (ids.length === 0) {
          setItemsWithAvg(professors);
          setIsAggregating(false);
          return;
        }

        const { data: ratings, error } = await supabase
          .from("ratings")
          .select("target_id, overall_rating, workload_rating, difficulty_rating")
          .eq("target_type", "professor") // Fetch ratings for professors
          .in("target_id", ids);

        if (error) {
          console.error("Error fetching professor averages:", error.message);
          setItemsWithAvg(professors); // fallback to static data
          setIsAggregating(false);
          return;
        }

        // Aggregate averages
        const averages = (ratings || []).reduce((acc, r) => {
          if (!acc[r.target_id]) {
            acc[r.target_id] = { overall: [], workload: [], difficulty: [] };
          }
          if (r.overall_rating !== null) acc[r.target_id].overall.push(r.overall_rating);
          if (r.workload_rating !== null) acc[r.target_id].workload.push(r.workload_rating);
          if (r.difficulty_rating !== null) acc[r.target_id].difficulty.push(r.difficulty_rating);
          return acc;
        }, {} as Record<string, { overall: number[]; workload: number[]; difficulty: number[] }>);

        // Merge averages with professors
        const calculateAverage = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        
        const merged = professors.map((prof) => {
          const avgData = averages[prof.id];
          return {
            ...prof,
            overall_rating: calculateAverage(avgData?.overall || []),
            workload_rating: calculateAverage(avgData?.workload || []),
            difficulty_rating: calculateAverage(avgData?.difficulty || []),
          };
        });

        setItemsWithAvg(merged);
        setIsAggregating(false);
      };

      fetchAverages();
    } else if (type === 'professor') {
      // Handle case where professors array is empty
      setItemsWithAvg(professors);
    }
  }, [type, professors]); // Run when professors array changes


  // 5. Apply filtering and sorting logic
  const filteredItems = useMemo(() => {
    if (!itemsWithAvg) return [];

    const filtered = itemsWithAvg.filter((item) => {
      // 1. Filter by Search Query
      const query = filters.searchQuery.toLowerCase().trim();
      if (query) {
        let match = false;
        if (type === 'course') {
          const course = item as Course;
          match = course.title.toLowerCase().includes(query) || course.code.toLowerCase().includes(query);
        } else {
          const professor = item as Professor;
          match = professor.name.toLowerCase().includes(query);
        }
        if (!match) return false;
      }

      // 2. Filter by Department
      if (filters.departments.length > 0) {
        const itemDeptId = departmentProperties.find(dp => dp.name === item.department)?.id;
        if (!itemDeptId || !filters.departments.includes(itemDeptId)) {
          return false;
        }
      }

      // 3. Filter by Difficulty (only for courses)
      if (type === 'course' && filters.difficulties.length > 0) {
        const course = item as Course;
        const difficultyRating = course.difficulty_rating || 0;
        let difficultyMatch = false;
        for (const difficultyLabel of filters.difficulties) {
           const [min, max] = getDifficultyRange(difficultyLabel);
           if (difficultyRating >= min && difficultyRating < max) {
             difficultyMatch = true;
             break;
           }
        }
        if (!difficultyMatch) return false;
      }

      // 4. Filter by Minimum Rating
      if (item.overall_rating > 0 && item.overall_rating < filters.rating) {
        return false;
      }

      // If all checks pass, include the item
      return true;
    });

    // *** THIS IS THE FIX ***
    // Sort by the click-order array from filters
    if (type === 'course' && filters.departments.length > 1) {
      // Use toSorted() to create a new array, ensuring stability
      const sorted = filtered.toSorted((a, b) => {
        // Map full department name (on item) to department ID (in filter array)
        const deptIdA = departmentProperties.find(dp => dp.name === a.department)?.id;
        const deptIdB = departmentProperties.find(dp => dp.name === b.department)?.id;

        if (!deptIdA || !deptIdB) return 0;

        // Get the index from the filters.departments array (e.g., ['MA', 'EE'])
        const indexA = filters.departments.indexOf(deptIdA);
        const indexB = filters.departments.indexOf(deptIdB);

        // Handle cases where department might not be found (shouldn't happen)
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        // This sorts by the click-order index (e.g., 0 for 'MA', 1 for 'EE')
        return indexA - indexB; 
      });
      return sorted;
    }
    // *** END OF FIX ***

    return filtered; // Return the unsorted (but filtered) list

  }, [itemsWithAvg, filters, type]); // Depend on filters and the processed items

  // 6. Render
  if (isLoading) {
    // Show skeleton loaders
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-8 bg-muted rounded w-1/5"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="h-64 bg-card border rounded-lg p-4 animate-pulse">
                 <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                 <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                 <div className="space-y-2">
                     <div className="h-3 bg-muted rounded w-full"></div>
                     <div className="h-3 bg-muted rounded w-5/6"></div>
                     <div className="h-3 bg-muted rounded w-full"></div>
                 </div>
             </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">Error loading {type}s: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{filteredItems.length}</span>{" "}
          {filteredItems.length === 1 ? type : `${type}s`}
        </p>
        <select
          className="px-3 py-1 border rounded-md text-sm bg-background"
          defaultValue="best-rated"
        >
          <option value="best-rated">Best Rated</option>
          <option value="most-reviewed">Most Reviewed</option>
          {type === 'course' && <option value="easiest">Easiest</option>}
          {type === 'course' && <option value="hardest">Hardest</option>}
        </select>
      </div>

      {filteredItems.length === 0 ? (
           <div className="text-center py-10 text-muted-foreground">
              No {type}s match the current filters. Try adjusting your selections.
           </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item: Course | Professor) => (
              <ItemCard type={type} item={item} key={item.id} />
            ))}
          </div>
      )}
    </div>
  );
}