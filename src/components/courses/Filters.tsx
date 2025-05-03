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
import {
  X,
  SlidersHorizontal
} from "lucide-react";
import departmentProperties from "@/constants/department";
import { DepartmentProperties } from "@/types";

interface DifficultyLevel {
  value: string;
  label: string;
}

interface Filters {
  searchQuery: string;
  departments: string[];
  difficulties: string[];
  rating: number;
}

const difficultyLevels: DifficultyLevel[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" }
];

interface FilterProps {
  type: 'course' | 'professor';
}

export default function Filters({type}: FilterProps): JSX.Element {

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number[]>([3]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);


  const handleDepartmentChange = (deptId: string): void => {
    setSelectedDepartments(prev => {
      if (prev.includes(deptId)) {
        return prev.filter(id => id !== deptId);
      } else {
        return [...prev, deptId];
      }
    });
  };


  const handleDifficultyChange = (diffValue: string): void => {
    setSelectedDifficulties(prev => {
      if (prev.includes(diffValue)) {
        return prev.filter(val => val !== diffValue);
      } else {
        return [...prev, diffValue];
      }
    });
  };


  const clearAllFilters = (): void => {
    setSearchQuery("");
    setSelectedDepartments([]);
    setSelectedDifficulties([]);
    setRatingFilter([3]);
  };


  const removeDepartmentFilter = (deptId: string): void => {
    setSelectedDepartments(prev => prev.filter(id => id !== deptId));
  };


  const removeDifficultyFilter = (diffValue: string): void => {
    setSelectedDifficulties(prev => prev.filter(val => val !== diffValue));
  };


  const applyFilters = (): void => {
    const filters: Filters = {
      searchQuery,
      departments: selectedDepartments,
      difficulties: selectedDifficulties,
      rating: ratingFilter[0]
    };
    
    console.log(filters);
    setIsMobileFilterOpen(false);
    
  
  
  };


  useEffect(() => {
    let count = 0;
    if (searchQuery) count++;
    count += selectedDepartments.length;
    count += selectedDifficulties.length;
    if (ratingFilter[0] !== 3) count++;
    setActiveFiltersCount(count);
  }, [searchQuery, selectedDepartments, selectedDifficulties, ratingFilter]);


  const getDepartmentById = (deptId: string): DepartmentProperties | undefined => {
    return departmentProperties.find(dept => dept.id === deptId);
  };


  const MobileFilters = (): JSX.Element => (
    <div className={`fixed inset-0 z-50 bg-background ${isMobileFilterOpen ? 'flex' : 'hidden'} flex-col`}>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-lg">Filters</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileFilterOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <FiltersContent />
      </div>
      <div className="p-4 border-t flex gap-2">
        <Button variant="outline" className="flex-1" onClick={clearAllFilters}>
          Clear All
        </Button>
        <Button className="flex-1" onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );


  const FiltersContent = (): JSX.Element => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="search" className="text-sm font-medium">Search</label>
        <Input 
          id="search" 
          placeholder={`Search ${type}s...`}
          className="w-full" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Accordion type="multiple" defaultValue={["department", "difficulty", "rating"]} className="w-full">
        <AccordionItem value="department">
          <AccordionTrigger className="text-sm font-medium">Department</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {departmentProperties.map((department) => {
                const DeptIcon = department.icon;
                return (
                  <div key={department.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`department-${department.id}`} 
                      checked={selectedDepartments.includes(department.id)}
                      onCheckedChange={() => handleDepartmentChange(department.id)}
                    />
                    <label
                      htmlFor={`department-${department.id}`}
                      className="text-sm leading-none flex items-center space-x-2 cursor-pointer"
                    >
                      <DeptIcon className="h-4 w-4" style={{ color: department.color }} />
                      <span>{department.id}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="difficulty">
          <AccordionTrigger className="text-sm font-medium">Difficulty</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {difficultyLevels.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`difficulty-${level.value}`} 
                    checked={selectedDifficulties.includes(level.value)}
                    onCheckedChange={() => handleDifficultyChange(level.value)}
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
        
        <AccordionItem value="rating">
          <AccordionTrigger className="text-sm font-medium">Minimum Rating</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-2 px-2">
              <Slider
                value={ratingFilter}
                min={1}
                max={5}
                step={0.5}
                onValueChange={(value) => setRatingFilter(value)}
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
                {ratingFilter[0]} stars and above
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );


  const ActiveFilters = (): JSX.Element | null => {
    if (activeFiltersCount === 0) return null;
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Active Filters</h4>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearAllFilters}>
            Clear All
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Search: {searchQuery}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
            </Badge>
          )}
          
          {selectedDepartments.map(deptId => {
            const dept = getDepartmentById(deptId);
            if (!dept) return null;
            
            const DeptIcon = dept.icon;
            return (
              <Badge key={deptId} variant="outline" className="flex items-center gap-1">
                <DeptIcon className="h-3 w-3 mr-1" style={{ color: dept.color }} />
                <span>{dept.id}</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeDepartmentFilter(deptId)} />
              </Badge>
            );
          })}
          
          {selectedDifficulties.map(diff => {
            const diffLevel = difficultyLevels.find(d => d.value === diff);
            if (!diffLevel) return null;
            
            return (
              <Badge key={diff} variant="outline" className="flex items-center gap-1">
                <span>{diffLevel.label}</span>
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeDifficultyFilter(diff)} />
              </Badge>
            );
          })}
          
          {ratingFilter[0] !== 3 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Rating: {ratingFilter[0]}+ stars</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => setRatingFilter([3])} />
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
        <ActiveFilters />
      </div>
      
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
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
          <ActiveFilters />
        </div>
      </div>
    </>
  );
}