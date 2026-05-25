'use client';
import React from 'react';
import { Star, Check, Award, BookOpen } from 'lucide-react';

interface ProfessorPageStatsProps {
  reviewCount: number;
  averageRating: number;
  knowledgeRating: number;
  teachingRating: number;
  approachabilityRating: number;
}

const ProfessorPageStats = ({
  reviewCount,
  averageRating,
  knowledgeRating,
  teachingRating,
  approachabilityRating,
}: ProfessorPageStatsProps) => {
  const stats = [
    {
      label: 'Overall Rating',
      value: `${averageRating.toFixed(1)}/5`,
      icon: <Star className="w-4 h-4" />,
    },
    {
      label: 'Knowledge',
      value: `${knowledgeRating.toFixed(1)}/5`,
      icon: <Check className="w-4 h-4" />,
    },
    {
      label: 'Teaching',
      value: `${teachingRating.toFixed(1)}/5`,
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      label: 'Approachability',
      value: `${approachabilityRating.toFixed(1)}/5`,
      icon: <Award className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-muted dark:border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-muted dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          Professor Statistics
        </h2>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-primary/5 dark:bg-gray-800 p-2 rounded-md"
            >
              <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-md text-primary">
                {stat.icon}
              </div>
              <div>
                <div className="text-xs text-muted-foreground dark:text-gray-400">
                  {stat.label}
                </div>
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {stat.value}
                </div>
                {stat.label === 'Overall Rating' && (
                  <div className="text-[10px] text-muted-foreground dark:text-gray-500">
                    {reviewCount} reviews
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessorPageStats;
