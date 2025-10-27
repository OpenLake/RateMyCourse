import { Award, Check, Star, Users, TrendingUp } from "lucide-react";
import React from "react";

interface CoursePageStatsProps {
  reviewCount: number;
}

const CoursePageStats = ({ reviewCount }: CoursePageStatsProps) => {
  const stats = [
    { label: "Students", value: "143", icon: <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" /> },
    { label: "Completion Rate", value: "92%", icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> },
    { label: "Avg. Grade", value: "B+", icon: <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" /> },
    { label: "Reviews", value: reviewCount, icon: <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" /> },
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
