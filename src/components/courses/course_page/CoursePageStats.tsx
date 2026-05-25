import { Flame, MessageSquare, Star, Zap } from "lucide-react";
import React from "react";

interface CoursePageStatsProps {
  overallRating: number;
  difficultyRating: number;
  workloadRating: number;
  reviewCount: number;
}

const CoursePageStats = ({
  overallRating,
  difficultyRating,
  workloadRating,
  reviewCount,
}: CoursePageStatsProps) => {
  const stats = [
    {
      label: "Overall Rating",
      value: `${overallRating.toFixed(1)}/5`,
      icon: <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />,
    },
    {
      label: "Difficulty",
      value: `${difficultyRating.toFixed(1)}/5`,
      icon: <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />,
    },
    {
      label: "Workload",
      value: `${workloadRating.toFixed(1)}/5`,
      icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    },
    {
      label: "Reviews",
      value: reviewCount.toString(),
      icon: <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />,
    },
  ];

  return (
    <div className="p-2sm:p-6 ">
      {/* <div className="p-3 border-b border-muted dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          Course Statistics
        </h2>
      </div> */}
      <div className="p-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="   bg-card 
            border border-border 
            rounded-lg sm:rounded-xl 
            p-4 sm:p-6 
            backdrop-blur-sm 
            text-card-foreground 
            transition 
            hover:border-primary/50 
            hover:shadow-md"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold">
                {stat.value}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursePageStats;
