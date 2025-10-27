import { useState, useEffect, useRef } from "react";
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
  const [value, setValue] = useState<string | undefined>(undefined);
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filterTop, setFilterTop] = useState<number>(0);

  const handleChange = (newValue: string) => {
    setValue(value === newValue ? undefined : newValue);
  };

  // Update local state if external filters change (e.g., clear all)
  useEffect(() => {
    setLocalSearchQuery(currentFilters.searchQuery);
    setLocalSelectedDepartments(currentFilters.departments);
    setLocalSelectedDifficulties(currentFilters.difficulties);
    setLocalRatingFilter([currentFilters.rating]);
  }, [currentFilters]);

  // Calculate initial position and handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) {
        const rect = filterRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;

        // Get the initial offset if not set
        if (filterTop === 0 && !isSticky) {
          setFilterTop(scrollY + rect.top);
        }

        // Check if we've scrolled past the filter's initial position
        setIsSticky(scrollY > filterTop - 80); // 80px = top-20
      }
    };

    // Calculate initial position
    if (filterRef.current && filterTop === 0) {
      const rect = filterRef.current.getBoundingClientRect();
      setFilterTop(window.scrollY + rect.top);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filterTop, isSticky]);

  const handleDepartmentChange = (deptId: string): void => {
    setLocalSelectedDepartments((prev) => {
      if (prev.includes(deptId)) {
        return prev.filter((id) => id !== deptId);
      } else {
        // *** THIS IS THE FIX ***
        // Add new departments to the FRONT of the array, not the back.
        return [deptId, ...prev];
      }
    });
  };

  const handleDifficultyChange = (diffValue: string): void => {
    setLocalSelectedDifficulties((prev) => {
      if (prev.includes(diffValue)) {
        return prev.filter((val) => val !== diffValue);
      } else {
        // Also add new difficulties to the front
        return [diffValue, ...prev];
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

  // Mobile Filters component
  const MobileFilters = (): JSX.Element => (
    <div
      className={`fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl ${
        isMobileFilterOpen ? "flex" : "hidden"
      } flex-col`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <h2 className="font-black text-lg tracking-tight">Filters</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileFilterOpen(false)}
          className="hover:bg-primary/10 transition-colors duration-300"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <FiltersContent />
      </div>
      <div className="p-4 border-t border-border/60 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 relative overflow-hidden group"
          onClick={clearAllFilters}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          <span className="relative font-mono">Clear All</span>
        </Button>
        <Button
          className="flex-1 relative overflow-hidden group"
          onClick={applyFilters}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          <span className="relative font-mono">Apply ({activeFiltersCount})</span>
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
        type="single"
        collapsible
        value={value}
        onValueChange={handleChange}
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
        {type === "course" && (
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
        {/* The active filter badges will now appear in the order of selection */}
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
          className="w-full flex justify-between font-bold tracking-wide hover:scale-[1.01] transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 relative overflow-hidden group"
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          <div className="flex items-center relative">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <span className="font-mono">Filters</span>
          </div>
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 font-mono tabular-nums">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        {isMobileFilterOpen && <MobileFilters />}
        <ActiveFilters />
      </div>

      {/* Desktop Filters - Better positioning */}
      <div className="hidden lg:block">
        <div className="sticky top-6 bg-card/60 backdrop-blur-xl p-6 rounded-xl border border-border/60 shadow-lg hover:border-primary/30 hover:bg-card/70 transition-all duration-300 max-h-[calc(100vh-3rem)] overflow-y-auto scrollbar-thin">
          <h3 className="font-black text-xl tracking-tight mb-6 text-foreground">Filters</h3>
          <FiltersContent />
          <div className="mt-6 flex gap-2 pt-6 border-t border-border/40">
            <Button
              variant="outline"
              className="flex-1 relative overflow-hidden group"
              onClick={clearAllFilters}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <span className="relative font-mono">Clear All</span>
            </Button>
            <Button
              className="flex-1 relative overflow-hidden group"
              onClick={applyFilters}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <span className="relative font-mono">Apply</span>
            </Button>
          </div>
          <ActiveFilters />
        </div>
      </div>
    </>
  );
}