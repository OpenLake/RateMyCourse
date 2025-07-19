'use client';
import React from 'react';
import { Professor } from '@/types';

export default function ProfessorPageHeader({ professor }: { professor: Professor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted p-4">
      <div className="flex items-center space-x-4">
        {professor.avatar_url && (
          <img
            src={professor.avatar_url}
            alt={professor.name}
            className="w-16 h-16 rounded-full object-cover border"
          />
        )}
        <div>
          <h1 className="text-xl font-semibold">{professor.name}</h1>
          <p className="text-sm text-muted-foreground">{professor.post} | {professor.department}</p>
        </div>
      </div>
    </div>
  );
}
