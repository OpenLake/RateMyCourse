'use client';
import React from 'react';

export default function ProfessorPageReviews({ id, reviewCount }: { id: string, reviewCount: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted p-4">
      <h2 className="text-lg font-semibold mb-2">Student Reviews ({reviewCount})</h2>
      <p className="text-muted-foreground text-sm italic">(Reviews functionality coming soon)</p>
    </div>
  );
}
