import { useCourses } from "@/hooks/useCourses";
import CourseCard from "./ItemCard";
import { Course, Professor } from "@/types";
import ItemCard from "./ItemCard";
import { useProfessors } from "@/hooks/useProfessors";

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

  const isLoading = type === "course" ? isCoursesLoading : isProfessorsLoading;
  const error = type === "course" ? coursesError : professorsError;
  const items = type === "course" ? courses : professors;

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
          Showing <span className="font-medium">{items.length}</span> {type}s
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
        {items.map((item: Course | Professor) =>
        (
          <ItemCard type={type} item={item} key={item.id} />
        )
        )}
      </div>
    </div>
  );
}
