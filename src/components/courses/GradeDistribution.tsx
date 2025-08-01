import React from 'react'

const GradeDistribution = () => {
    const gradeDistribution = [
        { grade: 'A+', percentage: 15 },
        { grade: 'A', percentage: 25 },
        { grade: 'B+', percentage: 20 },
        { grade: 'B', percentage: 15 },
        { grade: 'C+', percentage: 10 },
        { grade: 'C', percentage: 8 },
        { grade: 'D', percentage: 5 },
        { grade: 'F', percentage: 2 },
      ];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted overflow-hidden">
        <div className="p-3 border-b border-muted">
        <h2 className="font-semibold">Grade Distribution</h2>
        </div>
        <div className="p-3">
        <div className="space-y-1.5">
            {gradeDistribution.map((item, index) => (
            <div key={item.grade} className="flex items-center text-xs">
                <span className="w-6 font-medium">{item.grade}</span>
                <div className="flex-1 mx-1">
                <div className="relative">
                    <div 
                    className="h-4 rounded-sm"
                    style={{ 
                        width: `${item.percentage * 2}%`,
                        background: `hsl(var(--primary))` 
                    }}
                    ></div>
                </div>
                </div>
                <span className="w-8 text-right">{item.percentage}%</span>
            </div>
            ))}
        </div>
        </div>
    </div>
    )   
}

export default GradeDistribution
