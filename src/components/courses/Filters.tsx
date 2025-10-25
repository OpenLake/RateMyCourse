import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import departmentProperties from "@/constants/department";
import { DepartmentProperties } from "@/types";

interface DifficultyLevel {
  value: string;
  label: string;
}

// Export the state shape
export interface FiltersState {
  searchQuery: string;
  departments: string[];
  difficulties: string[];
  rating: number;
}

const difficultyLevels: DifficultyLevel[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

interface FilterProps {
  type: "course" | "professor";
  currentFilters: FiltersState; // Receive current filters
  onFilterChange: (filters: FiltersState) => void; // Callback to update parent state
}

export default function Filters({
  type,
  currentFilters,
  onFilterChange,
}: FilterProps): JSX.Element {
  // Local state to manage UI changes before applying
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(
    currentFilters.searchQuery
  );
  const [localSelectedDepartments, setLocalSelectedDepartments] = useState<
    string[]
  >(currentFilters.departments);
  const [localSelectedDifficulties, setLocalSelectedDifficulties] = useState<
    string[]
  >(currentFilters.difficulties);
  const [localRatingFilter, setLocalRatingFilter] = useState<number[]>([
    currentFilters.rating,
  ]);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);

  // Update local state if external filters change (e.g., clear all)
  useEffect(() => {
    setLocalSearchQuery(currentFilters.searchQuery);
    setLocalSelectedDepartments(currentFilters.departments);
    setLocalSelectedDifficulties(currentFilters.difficulties);
    setLocalRatingFilter([currentFilters.rating]);
  }, [currentFilters]);

  const handleDepartmentChange = (deptId: string): void => {
    setLocalSelectedDepartments((prev) => {
      if (prev.includes(deptId)) {
        return prev.filter((id) => id !== deptId);
      } else {
        return [...prev, deptId];
      }
    });
  };

  const handleDifficultyChange = (diffValue: string): void => {
    setLocalSelectedDifficulties((prev) => {
      if (prev.includes(diffValue)) {
        return prev.filter((val) => val !== diffValue);
      } else {
        return [...prev, diffValue];
      }
    });
  };

  const clearAllFilters = (): void => {
    // Reset local state first
    setLocalSearchQuery("");
    setLocalSelectedDepartments([]);
    setLocalSelectedDifficulties([]);
    setLocalRatingFilter([1]); // Reset to minimum possible rating filter
    // Then notify parent to clear global state
    onFilterChange({
      searchQuery: "",
      departments: [],
      difficulties: [],
      rating: 1, // Match the reset value
    });
    setIsMobileFilterOpen(false); // Close mobile filter if open
  };

  const removeDepartmentFilter = (deptId: string): void => {
    const updatedDepartments = currentFilters.departments.filter(
      (id) => id !== deptId
    );
    onFilterChange({ ...currentFilters, departments: updatedDepartments });
  };

  const removeDifficultyFilter = (diffValue: string): void => {
    const updatedDifficulties = currentFilters.difficulties.filter(
      (val) => val !== diffValue
    );
    onFilterChange({ ...currentFilters, difficulties: updatedDifficulties });
  };

  const applyFilters = (): void => {
    // Call the callback function passed from the parent with the updated local state
    onFilterChange({
      searchQuery: localSearchQuery,
      departments: localSelectedDepartments,
      difficulties: localSelectedDifficulties,
      rating: localRatingFilter[0],
    });
    setIsMobileFilterOpen(false); // Close mobile filter view after applying
  };

  // Calculate active filters count based on the *parent's* state
  useEffect(() => {
    let count = 0;
    if (currentFilters.searchQuery) count++;
    count += currentFilters.departments.length;
    count += currentFilters.difficulties.length;
    if (currentFilters.rating !== 1) count++; // Assuming 1 is the default/inactive state
    setActiveFiltersCount(count);
  }, [currentFilters]);

  const getDepartmentById = (
    deptId: string
  ): DepartmentProperties | undefined => {
    return departmentProperties.find((dept) => dept.id === deptId);
  };

  // Mobile Filters component remains largely the same but uses local state handlers
  const MobileFilters = (): JSX.Element => (
    <div
      className={`fixed inset-0 z-50 bg-background ${
        isMobileFilterOpen ? "flex" : "hidden"
      } flex-col`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-lg">Filters</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {/* FiltersContent now uses local state */}
        <FiltersContent />
      </div>
      <div className="p-4 border-t flex gap-2">
        <Button variant="outline" className="flex-1" onClick={clearAllFilters}>
          Clear All
        </Button>
        <Button className="flex-1" onClick={applyFilters}>
          Apply Filters ({activeFiltersCount})
        </Button>
      </div>
    </div>
  );

  // FiltersContent component remains largely the same but uses local state/handlers
  const FiltersContent = (): JSX.Element => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="search" className="text-sm font-medium">
          Search
        </label>
        <Input
          id="search"
          placeholder={`Search ${type}s...`}
          className="w-full"
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
        />
      </div>

      <Accordion
        type="multiple"
        defaultValue={["department", "difficulty", "rating"]}
        className="w-full"
      >
        <AccordionItem value="department">
          <AccordionTrigger className="text-sm font-medium">
            Department
          </AccordionTrigger>
          <AccordionContent>
            {/* Department list already had overflow handling */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {departmentProperties.map((department) => {
                const DeptIcon = department.icon;
                return (
                  <div key={department.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`department-${department.id}`}
                      checked={localSelectedDepartments.includes(department.id)}
                      onCheckedChange={() => handleDepartmentChange(department.id)}
                    />
                    <label
                      htmlFor={`department-${department.id}`}
                      className="text-sm leading-none flex items-center space-x-2 cursor-pointer"
                    >
                      <DeptIcon
                        className="h-4 w-4"
                        style={{ color: department.color }}
                      />
                      <span>{department.name} ({department.id})</span> {/* Show name and ID */}
                    </label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Difficulty section can be conditionally rendered based on type */}
        {type === 'course' && (
          <AccordionItem value="difficulty">
            <AccordionTrigger className="text-sm font-medium">
              Difficulty
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {difficultyLevels.map((level) => (
                  <div key={level.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`difficulty-${level.value}`}
                      checked={localSelectedDifficulties.includes(level.value)}
                      onCheckedChange={() =>
                        handleDifficultyChange(level.value)
                      }
                    />
                    <label
                      htmlFor={`difficulty-${level.value}`}
                      className="text-sm leading-none cursor-pointer"
                    >
                      {level.label}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="rating">
          <AccordionTrigger className="text-sm font-medium">
            Minimum Rating
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-2 px-2">
              <Slider
                value={localRatingFilter}
                min={1}
                max={5}
                step={0.5}
                onValueChange={(value) => setLocalRatingFilter(value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
              <div className="text-center font-medium">
                {localRatingFilter[0]} stars and above
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  // ActiveFilters component now uses parent state (`currentFilters`) and calls parent update function
  const ActiveFilters = (): JSX.Element | null => {
    if (activeFiltersCount === 0) return null;

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Active Filters</h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={clearAllFilters} // Use the clearing function
          >
            Clear All
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentFilters.searchQuery && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Search: {currentFilters.searchQuery}</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFilterChange({ ...currentFilters, searchQuery: "" })
                }
              />
            </Badge>
          )}

          {currentFilters.departments.map((deptId) => {
            const dept = getDepartmentById(deptId);
            if (!dept) return null;

            const DeptIcon = dept.icon;
            return (
              <Badge key={deptId} variant="outline" className="flex items-center gap-1">
                <DeptIcon
                  className="h-3 w-3 mr-1"
                  style={{ color: dept.color }}
                />
                <span>{dept.id}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeDepartmentFilter(deptId)}
                />
              </Badge>
            );
          })}

          {currentFilters.difficulties.map((diff) => {
            const diffLevel = difficultyLevels.find((d) => d.value === diff);
            if (!diffLevel) return null;

            return (
              <Badge key={diff} variant="outline" className="flex items-center gap-1">
                <span>{diffLevel.label}</span>
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeDifficultyFilter(diff)}
                />
              </Badge>
            );
          })}

          {currentFilters.rating !== 1 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Rating: {currentFilters.rating}+ stars</span>
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFilterChange({ ...currentFilters, rating: 1 })
                } // Reset rating to default
              />
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full flex justify-between"
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <div className="flex items-center">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </div>
          {activeFiltersCount > 0 && (
            <Badge className="ml-2">{activeFiltersCount}</Badge>
          )}
        </Button>
        {isMobileFilterOpen && <MobileFilters />}
        <ActiveFilters /> {/* Display active filters below button on mobile */}
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        {/* ******** FIX: Added max-h and overflow-y-auto here ******** */}
        <div className="bg-card p-6 rounded-lg border shadow-sm sticky top-[calc(var(--header-height,64px)+1.5rem)] max-h-[calc(100vh-8rem)] overflow-y-auto">
          <h3 className="font-medium text-lg mb-4">Filters</h3>
          <FiltersContent />
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={clearAllFilters}>
              Clear All
            </Button>
            <Button className="flex-1" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
          <ActiveFilters /> {/* Display active filters within desktop view */}
        </div>
      </div>
    </>
  );
}