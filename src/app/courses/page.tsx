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
    <div className="relative min-h-screen bg-background">
      {/* Background textures */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40 dark:opacity-60" />
      <div className="absolute inset-0 bg-noise opacity-[0.06] dark:opacity-[0.1] pointer-events-none" />

      {/* Gradient accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/8 dark:bg-primary/15 rounded-full blur-3xl opacity-50" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header Section */}
        <div className="border-b border-border/40 bg-background/40 backdrop-blur-xl">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center space-y-3">
              <div className="inline-block px-3 py-1 border border-border/40 rounded-full mb-2 hover:border-primary/40 transition-colors duration-300">
                <p className="text-[10px] font-mono font-bold text-muted-foreground tracking-[0.2em] uppercase">
                  Course Directory
                </p>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                <span className="font-mono text-primary">Courses</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-bold tracking-wide max-w-2xl mx-auto">
                Browse and filter courses offered at IIT Bhilai
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
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