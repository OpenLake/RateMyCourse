'use client';
import React from 'react';
import { Star, Users, Check, Award } from 'lucide-react';
import { Professor } from '@/types';

interface ProfessorPageStatsProps {
  professor?: Professor; // make optional
}

const ProfessorPageStats = ({ professor }: ProfessorPageStatsProps) => {
  if (!professor) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-muted dark:border-gray-700 p-4 text-center text-muted-foreground dark:text-gray-400">
        Loading stats...
      </div>
    );
  }

  const stats = [
    {
      label: 'Overall Rating',
      value: `${professor.overall_rating?.toFixed(1) ?? 0}/5`,
      icon: <Star className="w-4 h-4" />,
    },
    {
      label: 'Reviews',
      value: professor.review_count ?? 0,
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: 'Knowledge',
      value: `${professor.knowledge_rating?.toFixed(1) ?? 0}/5`,
      icon: <Check className="w-4 h-4" />,
    },
    {
      label: 'Approachability',
      value: `${professor.approachability_rating?.toFixed(1) ?? 0}/5`,
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessorPageStats;
