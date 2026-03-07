import { useState, useEffect, useRef, useCallback } from "react";
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
  currentFilters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
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
  
  // Ref to store the debounce timeout for search
  const debouncedSearchRef = useRef<NodeJS.Timeout>();

  const handleChange = (newValue: string) => {
    setValue(value === newValue ? undefined : newValue);
  };

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchQuery(value); // Update UI immediately
    
    // Clear previous timeout
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }
    
    // Set new timeout to update parent after 300ms
    debouncedSearchRef.current = setTimeout(() => {
      onFilterChange({
        ...currentFilters,
        searchQuery: value
      });
    }, 300);
  }, [currentFilters, onFilterChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }
    };
  }, []);

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

        if (filterTop === 0 && !isSticky) {
          setFilterTop(scrollY + rect.top);
        }

        setIsSticky(scrollY > filterTop - 80);
      }
    };

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
        return [deptId, ...prev];
      }
    });
  };

  const handleDifficultyChange = (diffValue: string): void => {
    setLocalSelectedDifficulties((prev) => {
      if (prev.includes(diffValue)) {
        return prev.filter((val) => val !== diffValue);
      } else {
        return [diffValue, ...prev];
      }
    });
  };

  const clearAllFilters = (): void => {
    // Clear debounce timeout if active
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }
    
    setLocalSearchQuery("");
    setLocalSelectedDepartments([]);
    setLocalSelectedDifficulties([]);
    setLocalRatingFilter([1]);
    
    onFilterChange({
      searchQuery: "",
      departments: [],
      difficulties: [],
      rating: 1,
    });
    setIsMobileFilterOpen(false);
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
    onFilterChange({
      searchQuery: localSearchQuery,
      departments: localSelectedDepartments,
      difficulties: localSelectedDifficulties,
      rating: localRatingFilter[0],
    });
    setIsMobileFilterOpen(false);
  };

  // Calculate active filters count based on the parent's state
  useEffect(() => {
    let count = 0;
    if (currentFilters.searchQuery) count++;
    count += currentFilters.departments.length;
    count += currentFilters.difficulties.length;
    if (currentFilters.rating !== 1) count++;
    setActiveFiltersCount(count);
  }, [currentFilters]);

  const getDepartmentById = (
    deptId: string
  ): DepartmentProperties | undefined => {
    return departmentProperties.find((dept) => dept.id === deptId);
  };

  // Plain JSX variable — NOT a component — so React never remounts it on re-render,
  // which keeps the search input focused between keystrokes.
  const filtersContent = (
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
          onChange={(e) => handleSearchChange(e.target.value)}
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
                      <span>{department.name} ({department.id})</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

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

  // Plain JSX variable — NOT a component — for the same reason as filtersContent above.
  const activeFilters = activeFiltersCount === 0 ? null : (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Active Filters</h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={clearAllFilters}
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
              }
            />
          </Badge>
        )}
      </div>
    </div>
  );

  // Plain JSX variable — NOT a component — for the same reason as filtersContent above.
  const mobileFilters = (
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
        {filtersContent}
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
        {isMobileFilterOpen && mobileFilters}
        {activeFilters}
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="sticky top-6 bg-card/60 backdrop-blur-xl p-6 rounded-xl border border-border/60 shadow-lg hover:border-primary/30 hover:bg-card/70 transition-all duration-300 max-h-[calc(100vh-3rem)] overflow-y-auto scrollbar-thin">
          <h3 className="font-black text-xl tracking-tight mb-6 text-foreground">Filters</h3>
          {filtersContent}
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
          {activeFilters}
        </div>
      </div>
    </>
  );
}