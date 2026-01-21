'use client';

import { useEffect, useState, useMemo } from "react";
import { useCourses } from "@/hooks/useCourses";
import { useProfessors } from "@/hooks/useProfessors";
import { Course, Professor } from "@/types";
import ItemCard from "./ItemCard";
import { supabase } from "@/lib/supabase";
import { FiltersState } from "./Filters";
import departmentProperties from "@/constants/department";
import { ArrowUpDown, TrendingUp, MessageSquare, Zap, Flame } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ItemListProps {
  type: "course" | "professor";
  filters: FiltersState;
}

// Helper function to map difficulty label → numeric range
const getDifficultyRange = (difficultyLabel: string): [number, number] => {
  switch (difficultyLabel) {
    case 'beginner':    return [0, 2];
    case 'intermediate': return [2, 3];
    case 'advanced':    return [3, 4];
    case 'expert':      return [4, 5.1];
    default:            return [0, 5.1];
  }
};

export default function ItemList({ type, filters }: ItemListProps) {
  const [sortBy, setSortBy] = useState<string>("best-rated");

  // ── Data ────────────────────────────────────────────────
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
  const [isAggregating, setIsAggregating] = useState(false);

  const isLoading = (type === "course" ? isCoursesLoading : isProfessorsLoading) || isAggregating;
  const error = type === "course" ? coursesError : professorsError;

  // ── Populate itemsWithAvg ───────────────────────────────
  useEffect(() => {
    if (type === "course") {
      setItemsWithAvg(courses);
    }
  }, [type, courses]);

  useEffect(() => {
    if (type !== "professor" || professors.length === 0) return;

    const fetchProfessorAverages = async () => {
      setIsAggregating(true);
      const ids = professors.map((p) => p.id);

      const { data: ratings, error } = await supabase
        .from("ratings")
        .select("target_id, overall_rating, workload_rating, difficulty_rating")
        .eq("target_type", "professor")
        .in("target_id", ids);

      if (error) {
        console.error("Failed to load professor ratings:", error);
        setItemsWithAvg(professors); // fallback
        setIsAggregating(false);
        return;
      }

      const averages = (ratings || []).reduce(
        (acc, r) => {
          if (!acc[r.target_id]) {
            acc[r.target_id] = { overall: [], workload: [], difficulty: [] };
          }
          if (r.overall_rating !== null) acc[r.target_id].overall.push(r.overall_rating);
          if (r.workload_rating !== null) acc[r.target_id].workload.push(r.workload_rating);
          if (r.difficulty_rating !== null) acc[r.target_id].difficulty.push(r.difficulty_rating);
          return acc;
        },
        {} as Record<string, { overall: number[]; workload: number[]; difficulty: number[] }>,
      );

      const calcAvg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

      const merged = professors.map((prof) => {
        const avg = averages[prof.id];
        return {
          ...prof,
          overall_rating: calcAvg(avg?.overall || []),
          workload_rating: calcAvg(avg?.workload || []),
          difficulty_rating: calcAvg(avg?.difficulty || []),
        };
      });

      setItemsWithAvg(merged);
      setIsAggregating(false);
    };

    fetchProfessorAverages();
  }, [type, professors]);

  // ── Filtering + Department-order sorting for multi-dept ──
  const filteredItems = useMemo(() => {
    let result = itemsWithAvg.filter((item) => {
      // Search
      const query = filters.searchQuery.toLowerCase().trim();
      if (query) {
        if (type === "course") {
          const c = item as Course;
          if (!c.title.toLowerCase().includes(query) && !c.code.toLowerCase().includes(query)) {
            return false;
          }
        } else {
          const p = item as Professor;
          if (!p.name.toLowerCase().includes(query)) return false;
        }
      }

      // Department filter
      if (filters.departments.length > 0) {
        const deptId = departmentProperties.find((d) => d.name === item.department)?.id;
        if (!deptId || !filters.departments.includes(deptId)) {
          return false;
        }
      }

      // Difficulty (courses only)
      if (type === "course" && filters.difficulties.length > 0) {
        const course = item as Course;
        const diff = course.difficulty_rating ?? 0;
        let matchesAny = false;
        for (const label of filters.difficulties) {
          const [min, max] = getDifficultyRange(label);
          if (diff >= min && diff < max) {
            matchesAny = true;
            break;
          }
        }
        if (!matchesAny) return false;
      }

      // Minimum overall rating
      if (item.overall_rating > 0 && item.overall_rating < filters.rating) {
        return false;
      }

      return true;
    });

    // Special case: when multiple departments are selected → sort by click order
    if (type === "course" && filters.departments.length > 1) {
      result = result.toSorted((a, b) => {
        const idA = departmentProperties.find((d) => d.name === (a as Course).department)?.id;
        const idB = departmentProperties.find((d) => d.name === (b as Course).department)?.id;

        const idxA = idA ? filters.departments.indexOf(idA) : -1;
        const idxB = idB ? filters.departments.indexOf(idB) : -1;

        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    return result;
  }, [itemsWithAvg, filters, type]);

  // ── Grouping (only for courses) ─────────────────────────
  const groupedCourses = useMemo(() => {
    if (type !== "course") return null;

    const map = new Map<string, { id: string; name: string; items: Course[] }>();

    // Initialize known departments
    for (const dp of departmentProperties) {
      map.set(dp.id, { id: dp.id, name: dp.name, items: [] });
    }

    // Distribute courses
    (filteredItems as Course[]).forEach((course) => {
      const dp = departmentProperties.find((d) => d.name === course.department);
      const bucketId = dp?.id ?? "OTHER";
      if (!map.has(bucketId)) {
        map.set(bucketId, { id: bucketId, name: course.department ?? "Other", items: [] });
      }
      map.get(bucketId)!.items.push(course);
    });

    // Build final ordered list
    const ordered: { id: string; name: string; items: Course[] }[] = [];
    for (const dp of departmentProperties) {
      const g = map.get(dp.id);
      if (g?.items.length) ordered.push(g);
    }
    // Add any unexpected departments at the end
    for (const [id, group] of map) {
      if (!departmentProperties.some((d) => d.id === id) && group.items.length > 0) {
        ordered.push(group);
      }
    }

    return ordered;
  }, [filteredItems, type]);

  // ── Render ───────────────────────────────────────────────
  if (isLoading) {
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

  const getSortLabel = () => {
    switch (sortBy) {
      case "best-rated":    return "Best Rated";
      case "most-reviewed": return "Most Reviewed";
      case "easiest":       return "Easiest";
      case "hardest":       return "Hardest";
      default:              return "Best Rated";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Sort */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl p-4">
        <p className="text-sm font-bold tracking-wide text-muted-foreground">
          Showing <span className="font-mono text-primary text-lg">{filteredItems.length}</span>{" "}
          {filteredItems.length === 1 ? type : `${type}s`}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-bold text-xs tracking-wide hover:scale-[1.02] transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <ArrowUpDown className="h-3.5 w-3.5 relative" />
              <span className="relative font-mono">{getSortLabel()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[180px] rounded-lg border-border/60 bg-background/95 backdrop-blur-xl"
          >
            <DropdownMenuItem
              onClick={() => setSortBy("best-rated")}
              className="font-bold text-sm cursor-pointer hover:bg-primary/10 transition-colors duration-200 rounded-md gap-2"
            >
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs tracking-wide">Best Rated</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("most-reviewed")}
              className="font-bold text-sm cursor-pointer hover:bg-primary/10 transition-colors duration-200 rounded-md gap-2"
            >
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs tracking-wide">Most Reviewed</span>
            </DropdownMenuItem>
            {type === "course" && (
              <>
                <DropdownMenuItem
                  onClick={() => setSortBy("easiest")}
                  className="font-bold text-sm cursor-pointer hover:bg-primary/10 transition-colors duration-200 rounded-md gap-2"
                >
                  <Zap className="h-4 w-4 text-green-500" />
                  <span className="font-mono text-xs tracking-wide">Easiest</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("hardest")}
                  className="font-bold text-sm cursor-pointer hover:bg-primary/10 transition-colors duration-200 rounded-md gap-2"
                >
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="font-mono text-xs tracking-wide">Hardest</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* No results */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl">
          <p className="text-muted-foreground font-bold text-lg mb-2">No {type}s found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : type === "course" && groupedCourses && groupedCourses.length > 0 ? (
        // ── Grouped courses view ──
        <div className="space-y-12">
          {groupedCourses.map((group) => (
            <section key={group.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-primary px-4">
                  {group.name}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.items.map((course) => (
                  <ItemCard key={course.id} type={type} item={course} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        // ── Flat list (professors + ungrouped courses) ──
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} type={type} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}