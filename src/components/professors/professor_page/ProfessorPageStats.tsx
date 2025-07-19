'use client';
import React from 'react';
import { Star, Users } from 'lucide-react';

export default function ProfessorPageStats({ reviewCount }: { reviewCount: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        <span className="text-sm font-medium">{reviewCount} Reviews</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-500" />
        <span className="text-sm font-medium">Top Rated Faculty</span>
      </div>
    </div>
  );
}
