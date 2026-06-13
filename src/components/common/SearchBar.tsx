"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, BookOpen, Users, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "course" | "professor";
  rating: number;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase();

      const [coursesRes, professorsRes] = await Promise.all([
        supabase
          .from("courses")
          .select("id, code, title, overall_rating, department")
          .or(`title.ilike.%${q}%,code.ilike.%${q}%`)
          .limit(5),
        supabase
          .from("professors")
          .select("id, name, department, overall_rating, post")
          .ilike("name", `%${q}%`)
          .limit(5),
      ]);

      const mapped: SearchResult[] = [
        ...(coursesRes.data || []).map((c) => ({
          id: c.id,
          title: c.title,
          subtitle: c.code,
          type: "course" as const,
          rating: c.overall_rating || 0,
        })),
        ...(professorsRes.data || []).map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: p.department,
          type: "professor" as const,
          rating: p.overall_rating || 0,
        })),
      ];

      setResults(mapped);
      setOpen(mapped.length > 0);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div ref={ref} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search courses or professors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-accent"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden"
          >
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {results.map((r) => (
                  <Link
                    key={`${r.type}-${r.id}`}
                    href={`/${r.type === "course" ? "courses" : "professors"}/${r.id}`}
                    onClick={() => { setOpen(false); setQuery(""); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors border-b border-border/20 last:border-0"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      {r.type === "course" ? (
                        <BookOpen className="h-4 w-4 text-primary" />
                      ) : (
                        <Users className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-primary">
                      ★ {r.rating.toFixed(1)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
