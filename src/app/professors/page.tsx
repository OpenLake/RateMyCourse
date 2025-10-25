"use client";
import { useState } from "react";
import Filters, { FiltersState } from "@/components/courses/Filters"; // Import FiltersState
import ItemList from "@/components/courses/ItemList";

// Define the initial state for filters (no difficulty)
const initialFilters: FiltersState = {
  searchQuery: "",
  departments: [],
  difficulties: [], // Keep this for type consistency, even if unused
  rating: 1, // Default minimum rating
};

export default function ProfessorsPage() {
  const [filters, setFilters] = useState<FiltersState>(initialFilters);

  // Callback function for Filters component to update the state
  const handleFilterChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  return (
    <div className="max-w-[calc(95vw)] mx-auto px-4 md:px-6 py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Professors</h1>
          <p className="text-muted-foreground">
            Browse and filter professors at IIT Bhilai
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
          {/* Pass current filters and the update handler to Filters */}
          <Filters
            type={`professor`}
            currentFilters={filters}
            onFilterChange={handleFilterChange}
          />
          {/* Pass the current filters to ItemList */}
          <ItemList type={`professor`} filters={filters} />
        </div>
      </div>
    </div>
  );
}