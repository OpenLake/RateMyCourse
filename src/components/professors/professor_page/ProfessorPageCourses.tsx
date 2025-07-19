'use client';
import React from 'react';
import Link from 'next/link';

export default function ProfessorPageCourses({ courses }: { courses: string[] }) {
  if (!courses || courses.length === 0) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted p-4">
      <h2 className="text-lg font-semibold mb-2">Courses Taught</h2>
      <ul className="list-disc pl-5 space-y-1">
        {courses.map(courseId => (
          <li key={courseId}>
            <Link href={`/courses/${courseId}`} className="text-primary underline">
              {courseId}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}