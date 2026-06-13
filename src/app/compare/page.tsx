"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, X, ArrowLeftRight } from "lucide-react";
import { motion } from "framer-motion";

interface CourseData {
  id: string;
  code: string;
  title: string;
  department: string;
  credits: number;
  overall_rating: number;
  difficulty_rating: number;
  workload_rating: number;
  review_count: number;
}

function RatingBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = value >= 4 ? "bg-green-500" : value >= 3 ? "bg-yellow-500" : value >= 2 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-primary">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function CourseSelector({ onSelect, selected }: { onSelect: (c: CourseData) => void; selected: CourseData | null }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CourseData[]>([]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, code, title, department, credits, overall_rating, difficulty_rating, workload_rating, review_count")
        .or(`title.ilike.%${query}%,code.ilike.%${query}%`)
        .limit(6);
      setResults(data || []);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  if (selected) {
    return (
      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-primary">{selected.code}</span>
          <button onClick={() => onSelect(null as any)} className="p-1 rounded hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="font-semibold text-sm">{selected.title}</p>
        <p className="text-xs text-muted-foreground">{selected.department} · {selected.credits} credits</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search course..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border/60 bg-card/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      {results.length > 0 && (
        <div className="border border-border/40 rounded-lg overflow-hidden bg-background/95 shadow-lg">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => { onSelect(c); setQuery(""); setResults([]); }}
              className="w-full text-left px-4 py-2.5 hover:bg-accent/50 border-b border-border/20 last:border-0 transition-colors"
            >
              <span className="text-xs font-mono font-bold text-primary">{c.code}</span>
              <span className="text-sm ml-2">{c.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const [courseA, setCourseA] = useState<CourseData | null>(null);
  const [courseB, setCourseB] = useState<CourseData | null>(null);

  const canCompare = courseA && courseB;

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40 dark:opacity-60" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            <span className="text-primary font-mono">Compare</span> Courses
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Select two courses to compare side by side</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start mb-8">
          <CourseSelector onSelect={setCourseA} selected={courseA} />
          <div className="hidden md:flex items-center justify-center pt-2">
            <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <CourseSelector onSelect={setCourseB} selected={courseB} />
        </div>

        {canCompare && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[courseA, courseB].map((course) => (
              <div key={course.id} className="p-6 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm space-y-4">
                <div>
                  <span className="text-xs font-mono font-bold text-primary">{course.code}</span>
                  <h3 className="font-bold text-lg mt-1">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">{course.department} · {course.credits} credits · {course.review_count} reviews</p>
                </div>
                <div className="space-y-3">
                  <RatingBar label="Overall" value={course.overall_rating || 0} />
                  <RatingBar label="Difficulty" value={course.difficulty_rating || 0} />
                  <RatingBar label="Workload" value={course.workload_rating || 0} />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
