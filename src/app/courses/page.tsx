"use client"
import { Metadata } from "next";
import Filters from "@/components/courses/Filters";
import ItemList from "@/components/courses/ItemList";


export default function CoursesPage() {
  return (
    <div className="max-w-[calc(95vw)] mx-auto px-4 md:px-6 py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Courses</h1>
          <p className="text-muted-foreground">
            Browse and filter courses offered at IIT Bhilai
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
          <Filters type={`course`} />
          <ItemList type={`course`} />
        </div>
      </div>
    </div>
  );
}