"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BookOpen, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Typewriter from 'typewriter-effect';

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
    <main className="relative bg-background min-h-screen font-sans overflow-hidden">
      {/* Texture overlay - adjusted for light/dark modes */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40 dark:opacity-60" />

      {/* Noise texture - adjusted for light/dark modes */}
      <div className="absolute inset-0 bg-noise opacity-[0.06] dark:opacity-[0.1] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuODUiIG51bU9jdGF2ZXM9IjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjQiLz48L3N2Zz4=')] opacity-10 dark:opacity-20 mix-blend-soft-light pointer-events-none" />

      {/* Gradient accents - adjusted for light/dark modes and responsive */}
      <div className="absolute top-10 sm:top-20 -left-20 sm:-left-40 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 sm:bottom-40 -right-20 sm:-right-40 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-primary/8 dark:bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />

      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-4xl mx-auto pt-6 sm:pt-10 pb-16 sm:pb-32 px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-10 sm:space-y-16">

          <div className="space-y-4 sm:space-y-6 text-center w-full">
            <div className="inline-block px-3 py-1 border border-border/40 rounded-full mb-2 sm:mb-4 hover:border-primary/40 transition-colors duration-300">
              <p className="text-[9px] sm:text-[10px] font-mono font-bold text-muted-foreground tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                Student Reviews Platform
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] px-2">
              Rate Courses at{" "}
              <span className="font-mono font-black text-primary tracking-tighter">IIT_Bhilai</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto font-bold tracking-wide leading-relaxed px-4">
              {/* Wondering if that course is worth it? Let the real student reviews spill the tea! */}
              <Typewriter
                options={{
                  strings: [
                    "Because GPA isn’t everything.",
                    "So you don’t fall for 'easy A' myths again.",
                    "One bad course review at a time.",
                    "Save a friend from a 3-hour lecture trap.",
                    "Because 'attendance 100%' doesn’t mean fun.",
                    "Real pain. Real reviews. Real IIT_Bhilai.",
                    "Helping you dodge surprise quizzes since 2025.",
                    "Know before you cry in midsems.",
                    "Rate. Rant. Repeat.",
                    "Your emotional support platform for electives."
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 75,
                  deleteSpeed: 10,
                  cursor: "|",
                }}
                onInit={(typewriter) => {
                  typewriter
                    .pauseFor(1000)
                    .deleteAll()
                    .start()
                }}
              />

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

          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-2xl border border-border/60 rounded-lg p-4 sm:p-6 md:p-8 bg-card/50 hover:border-primary/30 hover:bg-card/60 transition-all duration-300 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-1 sm:space-y-2 group cursor-default">
              <p className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums tracking-tighter group-hover:text-primary transition-colors duration-300">
                {courseCount !== null ? courseCount : "---"}
              </p>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.1em] sm:tracking-[0.15em]">
                Courses
              </p>
            </div>
            <div className="flex flex-col items-center space-y-1 sm:space-y-2 border-x border-border/50 group cursor-default">
              <p className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums tracking-tighter group-hover:text-primary transition-colors duration-300">
                {professorCount !== null ? professorCount : "---"}
              </p>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.1em] sm:tracking-[0.15em]">
                Professors
              </p>
            </div>
            <div className="flex flex-col items-center space-y-1 sm:space-y-2 group cursor-default">
              <p className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums tracking-tighter group-hover:text-primary transition-colors duration-300">
                {reviewCount !== null ? reviewCount : "---"}
              </p>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.1em] sm:tracking-[0.15em]">
                Reviews
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/courses"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "gap-2 relative overflow-hidden group w-full sm:w-auto rounded-sm"
              })}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <BookOpen className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300 relative" />
              <span className="relative font-mono">Browse Courses</span>
            </Link>
            <Link
              href="/professors"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "gap-2 relative overflow-hidden group w-full sm:w-auto rounded-sm"
              })}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <Users className="h-4 w-4 group-hover:scale-110 transition-transform duration-300 relative" />
              <span className="relative font-mono">View Professors</span>
            </Link>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
    </main>
  );
}
