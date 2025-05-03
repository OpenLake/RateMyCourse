"use client"
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, BookOpen, PenLine, SearchIcon, Sparkles, Users } from 'lucide-react';

export default function Home() {
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
          
          <div className="flex flex-col sm:flex-row w-full max-w-2xl gap-3 mt-4">
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
          </div>
          <Link
              href="/review/new"
              className={buttonVariants({ 
                variant: "secondary",
                size: "lg",
                className: "shadow-md font-medium"
              })}
            >
              <PenLine className="h-4 w-4 mr-2" />
              Write Your Review!
            </Link>
          
          <div className="grid grid-cols-3 gap-6 w-full max-w-3xl mt-3 py-4">
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border border-border shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow">
              <p className="text-3xl font-bold text-primary">250+</p>
              <p className="text-sm text-muted-foreground mt-1">Courses</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border border-border shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow">
              <p className="text-3xl font-bold text-primary">120+</p>
              <p className="text-sm text-muted-foreground mt-1">Professors</p>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border border-border shadow-sm backdrop-blur-sm hover:shadow-md transition-shadow">
              <p className="text-3xl font-bold text-primary">1,500+</p>
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
              href="/professor"
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