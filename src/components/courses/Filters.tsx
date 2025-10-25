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
  const [value, setValue] = useState<string | undefined>(undefined);

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

  // FiltersContent component
  const FiltersContent = (): JSX.Element => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="search"
          className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground"
        >
          Search
        </label>
        <Input
          id="search"
          placeholder={`Search ${type}s...`}
          className="w-full font-bold border-border/60 focus:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm"
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
        <AccordionItem value="department" className="border-border/60">
          <AccordionTrigger className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] hover:text-primary transition-colors duration-300">
            Department
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {departmentProperties.map((department) => {
                const DeptIcon = department.icon;
                return (
                  <div key={department.id} className="flex items-center space-x-2 group">
                    <Checkbox
                      id={`department-${department.id}`}
                      checked={localSelectedDepartments.includes(department.id)}
                      onCheckedChange={() => handleDepartmentChange(department.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor={`department-${department.id}`}
                      className="text-sm font-bold leading-none flex items-center space-x-2 cursor-pointer group-hover:text-primary transition-colors duration-300"
                    >
                      <DeptIcon
                        className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
                        style={{ color: department.color }}
                      />
                      <span>
                        {department.name}{" "}
                        <span className="font-mono text-xs text-muted-foreground">
                          ({department.id})
                        </span>
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {type === "course" && (
          <AccordionItem value="difficulty" className="border-border/60">
            <AccordionTrigger className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] hover:text-primary transition-colors duration-300">
              Difficulty
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {difficultyLevels.map((level) => (
                  <div key={level.value} className="flex items-center space-x-2 group">
                    <Checkbox
                      id={`difficulty-${level.value}`}
                      checked={localSelectedDifficulties.includes(level.value)}
                      onCheckedChange={() =>
                        handleDifficultyChange(level.value)
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor={`difficulty-${level.value}`}
                      className="text-sm font-bold leading-none cursor-pointer group-hover:text-primary transition-colors duration-300"
                    >
                      {level.label}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="rating" className="border-border/60">
          <AccordionTrigger className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] hover:text-primary transition-colors duration-300">
            Minimum Rating
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-2 px-2">
              <div className="space-y-2">
                <Slider
                  value={localRatingFilter}
                  min={1}
                  max={5}
                  step={0.5}
                  onValueChange={(value) => setLocalRatingFilter(value)}
                  className="w-full cursor-grab active:cursor-grabbing"
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono font-bold text-muted-foreground">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
              <div className="text-center font-black text-lg font-mono tabular-nums tracking-tighter text-primary">
                {localRatingFilter[0]}★
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  // ActiveFilters component
  const ActiveFilters = (): JSX.Element | null => {
    if (activeFiltersCount === 0) return null;

    return (
      <div className="mt-4 p-3 rounded-lg border border-border/60 bg-card/30 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Active Filters
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs font-bold tracking-wide hover:text-primary hover:bg-primary/10 transition-all duration-300"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentFilters.searchQuery && (
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 font-bold border-border/60 hover:border-primary/50 transition-colors duration-300 bg-card/50 backdrop-blur-sm"
            >
              <span className="text-xs font-mono">
                Search: {currentFilters.searchQuery}
              </span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-primary transition-colors duration-300"
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
              <Badge
                key={deptId}
                variant="outline"
                className="flex items-center gap-1.5 font-bold border-border/60 hover:border-primary/50 transition-colors duration-300 bg-card/50 backdrop-blur-sm"
              >
                <DeptIcon
                  className="h-3 w-3"
                  style={{ color: dept.color }}
                />
                <span className="text-xs font-mono">{dept.id}</span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary transition-colors duration-300"
                  onClick={() => removeDepartmentFilter(deptId)}
                />
              </Badge>
            );
          })}

          {currentFilters.difficulties.map((diff) => {
            const diffLevel = difficultyLevels.find((d) => d.value === diff);
            if (!diffLevel) return null;

            return (
              <Badge
                key={diff}
                variant="outline"
                className="flex items-center gap-1.5 font-bold border-border/60 hover:border-primary/50 transition-colors duration-300 bg-card/50 backdrop-blur-sm"
              >
                <span className="text-xs">{diffLevel.label}</span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-primary transition-colors duration-300"
                  onClick={() => removeDifficultyFilter(diff)}
                />
              </Badge>
            );
          })}

          {currentFilters.rating !== 1 && (
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 font-bold border-border/60 hover:border-primary/50 transition-colors duration-300 bg-card/50 backdrop-blur-sm"
            >
              <span className="text-xs font-mono">{currentFilters.rating}★+</span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-primary transition-colors duration-300"
                onClick={() =>
                  onFilterChange({ ...currentFilters, rating: 1 })
                }
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

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-card/40 backdrop-blur-xl p-6 rounded-lg border border-border/60 shadow-sm sticky top-[calc(var(--header-height,64px)+1.5rem)] max-h-[calc(100vh-8rem)] overflow-y-auto hover:border-primary/30 hover:bg-card/50 transition-all duration-300">
          <h3 className="font-black text-lg tracking-tight mb-4">Filters</h3>
          <FiltersContent />
          <div className="mt-6 flex gap-2">
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