'use client';

import { useEffect, useState } from "react";
import { useCourses } from "@/hooks/useCourses";
import { useProfessors } from "@/hooks/useProfessors";
import { Course, Professor } from "@/types";
import ItemCard from "./ItemCard";
import { supabase } from "@/lib/supabase";

interface ItemListProps {
  type: "course" | "professor";
}

export default function ItemList({ type }: ItemListProps) {
  const {
    courses,
    isLoading: isCoursesLoading,
    error: coursesError,
  } = useCourses();

  const {
    professors,
    isLoading: isProfessorsLoading,
    error: professorsError,
  } = useProfessors();

  const [itemsWithAvg, setItemsWithAvg] = useState<(Course | Professor)[]>([]);

  const isLoading = type === "course" ? isCoursesLoading : isProfessorsLoading;
  const error = type === "course" ? coursesError : professorsError;
  const items = type === "course" ? courses : professors;

  // Fetch averages for ratings dynamically
  useEffect(() => {
    if (!items || items.length === 0) return;

    const fetchAverages = async () => {
      const ids = items.map((i) => i.id);

      // Fetch all ratings for the displayed items
      const { data: ratings, error } = await supabase
        .from("ratings")
        .select("target_id, overall_rating, workload_rating, difficulty_rating")
        .eq("target_type", type)
        .in("target_id", ids);

      if (error) {
        console.error("Error fetching averages:", error.message);
        setItemsWithAvg(items); // fallback to static data
        return;
      }

      // Aggregate averages manually
      const averages = ratings.reduce((acc, r) => {
        if (!acc[r.target_id]) {
          acc[r.target_id] = {
            overall: [],
            workload: [],
            difficulty: [],
          };
        }
        if (r.overall_rating !== null) acc[r.target_id].overall.push(r.overall_rating);
        if (r.workload_rating !== null) acc[r.target_id].workload.push(r.workload_rating);
        if (r.difficulty_rating !== null) acc[r.target_id].difficulty.push(r.difficulty_rating);
        return acc;
      }, {} as Record<string, { overall: number[]; workload: number[]; difficulty: number[] }>);

      // Merge averages with items
      const merged = items.map((item) => {
        const avg = averages[item.id];
        return {
          ...item,
          overall_rating: avg
            ? avg.overall.reduce((a, b) => a + b, 0) / avg.overall.length
            : null,
          workload_rating: avg
            ? avg.workload.reduce((a, b) => a + b, 0) / avg.workload.length
            : null,
          difficulty_rating: avg
            ? avg.difficulty.reduce((a, b) => a + b, 0) / avg.difficulty.length
            : null,
        };
      });

      setItemsWithAvg(merged);
    };

    fetchAverages();
  }, [items, type]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading {type}s: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{itemsWithAvg.length}</span> {type}s
        </p>
        <select
          className="px-3 py-1 border rounded-md text-sm"
          defaultValue="newest"
        >
          <option value="newest">Newest</option>
          <option value="best-rated">Best Rated</option>
          <option value="easiest">Easiest</option>
          <option value="hardest">Hardest</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {itemsWithAvg.map((item: Course | Professor) => (
          <ItemCard type={type} item={item} key={item.id} />
        ))}
      </div>
    </div>
  );
}
