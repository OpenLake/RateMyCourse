"use client";
import { useState } from "react";
import Filters, { FiltersState } from "@/components/courses/Filters";
import ItemList from "@/components/courses/ItemList";

// Define the initial state for filters
const initialFilters: FiltersState = {
  searchQuery: "",
  departments: [],
  difficulties: [], // Assuming difficulties are strings like 'beginner', 'intermediate'
  rating: 1, // Default minimum rating
};

export default function CoursesPage() {
  const [filters, setFilters] = useState<FiltersState>(initialFilters);

  const handleFilterChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background textures matching homepage */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40 dark:opacity-60" />
      <div className="absolute inset-0 bg-noise opacity-[0.06] dark:opacity-[0.1] pointer-events-none" />

      {/* Gradient accents */}
      <div className="absolute top-20 -left-40 w-[600px] h-[600px] bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-40 -right-40 w-[500px] h-[500px] bg-primary/8 dark:bg-primary/15 rounded-full blur-3xl" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10 relative z-10">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Header section with modern styling */}
          <div className="text-center space-y-3">
            <div className="inline-block px-3 py-1 border border-border/40 rounded-full mb-2 hover:border-primary/40 transition-colors duration-300">
              <p className="text-[9px] sm:text-[10px] font-mono font-bold text-muted-foreground tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                Course Directory
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              <span className="font-mono text-primary">Courses</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-bold tracking-wide">
              Browse and filter courses offered at IIT Bhilai
            </p>
          </div>

          {/* Filters and ItemList - responsive grid layout with sticky filter */}
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 sm:gap-6 w-full items-start">
            <Filters
              type="course"
              currentFilters={filters}
              onFilterChange={handleFilterChange}
            />
            <ItemList type="course" filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}