'use client';

import React, { useState } from 'react';
import { Professor } from '@/types';
import { StarRating } from '@/components/common/StarRating';
import { ExternalLink } from 'lucide-react';

interface ProfessorPageHeaderProps {
  professor: Professor;
  averageRating: number;
  reviewCount: number;
}

export default function ProfessorPageHeader({
  professor,
  averageRating,
  reviewCount,
}: ProfessorPageHeaderProps) {
  const [showAllInterests, setShowAllInterests] = useState(false);

  const interests = professor.research_interests || [];
  const visibleInterests = showAllInterests ? interests : interests.slice(0, 3);
  const hiddenCount = interests.length - 3;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-muted dark:border-gray-700 overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          {/* Left Section: Avatar + Info */}
          <div className="flex items-start gap-4">
            {professor.avatar_url && (
              <img
                src={professor.avatar_url}
                alt={professor.name}
                className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              />
            )}
            <div>
              {/* Name and Position */}
              <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">
                {professor.name}
              </h1>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
                {professor.post} | {professor.department}
              </p>

              {/* Website link */}
              {professor.website && (
                <a
                  href={professor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 gap-1 mb-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              )}

              {/* Research Interests */}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {visibleInterests.map((interest, index) => (
                    <span
                      key={index}
                      className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md"
                    >
                      {interest}
                    </span>
                  ))}

                  {hiddenCount > 0 && !showAllInterests && (
                    <button
                      onClick={() => setShowAllInterests(true)}
                      className="text-xs text-muted-foreground dark:text-gray-400 underline"
                    >
                      +{hiddenCount} more
                    </button>
                  )}

                  {showAllInterests && (
                    <button
                      onClick={() => setShowAllInterests(false)}
                      className="text-xs text-muted-foreground dark:text-gray-400 underline"
                    >
                      Show less
                    </button>
                  )}
                </div>
              )}

              {/* Ratings Row */}
              <div className="flex items-center mt-3 gap-6">
                <div className="flex items-center">
                  <StarRating rating={averageRating ?? 0} />
                  <span className="text-xs text-muted-foreground dark:text-gray-400 ml-2">
                    ({reviewCount ?? 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
