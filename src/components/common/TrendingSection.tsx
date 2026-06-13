"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Flame, Star } from "lucide-react";

interface TrendingItem {
  id: string;
  title: string;
  code?: string;
  rating: number;
  review_count: number;
}

export default function TrendingSection() {
  const [courses, setCourses] = useState<TrendingItem[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, title, code, overall_rating, review_count")
        .order("review_count", { ascending: false })
        .limit(6);
      if (data) {
        setCourses(data.map((c) => ({ id: c.id, title: c.title, code: c.code, rating: c.overall_rating || 0, review_count: c.review_count || 0 })));
      }
    };
    fetch();
  }, []);

  if (courses.length === 0) return null;

  return (
    <div className="w-full max-w-3xl px-4 sm:px-0">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-4 w-4 text-orange-500" />
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground">Most Reviewed</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {courses.map((c) => (
          <Link
            key={c.id}
            href={`/courses/${c.id}`}
            className="p-3 rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:bg-card/70 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-primary">{c.code}</span>
              <div className="flex items-center gap-1 text-xs font-mono">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="font-bold">{c.rating.toFixed(1)}</span>
              </div>
            </div>
            <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">{c.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.review_count} reviews</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
