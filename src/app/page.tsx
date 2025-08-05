"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BookOpen, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [professorCount, setProfessorCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      // Fetch course count
      const { count: coursesCnt, error: coursesError } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true });

      if (coursesError) {
        console.error("Error fetching courses count:", coursesError.message);
        setCourseCount(0);
      } else {
        setCourseCount(coursesCnt || 0);
      }

      // Fetch professor count
      const { count: profCnt, error: profError } = await supabase
        .from("professors")
        .select("*", { count: "exact", head: true });

      if (profError) {
        console.error("Error fetching professors count:", profError.message);
        setProfessorCount(0);
      } else {
        setProfessorCount(profCnt || 0);
      }

      // Fetch reviews count
      const { count: reviewsCnt, error: reviewsError } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true });

      if (reviewsError) {
        console.error("Error fetching reviews count:", reviewsError.message);
        setReviewCount(0);
      } else {
        setReviewCount(reviewsCnt || 0);
      }
    };

    fetchCounts();
  }, []);

  return (
    <main className="relative bg-gradient-to-b from-background to-background/90">
      <div className="absolute top-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto pt-16 pb-20 px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-10">
          
          <div className="space-y-5 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Rate Courses at <span className="text-primary relative">
                IIT Bhilai
                <span className="absolute bottom-1 left-0 w-full h-2 bg-primary/20 -z-10 rounded-lg"></span>
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Wondering if that course is worth it? Let the real student reviews spill the tea!
            </p>
          </div>
          
          {/* <div className="flex flex-col sm:flex-row w-full max-w-2xl gap-3 mt-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for courses or professors..."
                className="pl-12 pr-4 py-3 w-full rounded-lg border border-input bg-card/80 backdrop-blur-sm shadow-md focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all"
              />
            </div>
            <Link
              href="/courses"
              className={buttonVariants({ 
                size: "lg",
                className: "px-8 py-3 font-medium shadow-md"
              })}
            >
              Search
            </Link>
          </div> */}
          {/* <Link
              href="/review/new"
              className={buttonVariants({ 
                variant: "secondary",
                size: "lg",
                className: "shadow-md font-medium"
              })}
            >
              <PenLine className="h-4 w-4 mr-2" />
              Write Your Review!
            </Link> */}
          
          <div className="grid grid-cols-3 gap-6 w-full max-w-3xl mt-3 py-4">
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border border-border shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow">
              <p className="text-3xl font-bold text-primary">
                {courseCount !== null ? `${courseCount}+` : "Loading..."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Courses</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border border-border shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow">
              <p className="text-3xl font-bold text-primary">
                {professorCount !== null ? `${professorCount}+` : "Loading..."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Professors</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border border-border shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow">
              <p className="text-3xl font-bold text-primary">
                {reviewCount !== null ? `${reviewCount}+` : "Loading..."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Reviews</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <Link
              href="/courses"
              className={buttonVariants({ 
                variant: "default",
                size: "lg",
                className: "gap-2 shadow-md bg-primary hover:bg-primary/90"
              })}
            >
              <BookOpen className="h-4 w-4" />
              Browse All Courses
            </Link>
            <Link
              href="/professors"
              className={buttonVariants({ 
                variant: "outline",
                size: "lg",
                className: "gap-2 shadow-sm border-2 border-border hover:bg-accent/10"
              })}
            >
              <Users className="h-4 w-4" />
              View Professors
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
