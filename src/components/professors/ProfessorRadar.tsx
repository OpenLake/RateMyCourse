"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

interface ProfessorRadarProps {
  overall: number;
  knowledge: number;
  teaching: number;
  approachability: number;
}

export default function ProfessorRadar({ overall, knowledge, teaching, approachability }: ProfessorRadarProps) {
  const data = [
    { subject: "Overall", value: overall || 0 },
    { subject: "Knowledge", value: knowledge || 0 },
    { subject: "Teaching", value: teaching || 0 },
    { subject: "Approachability", value: approachability || 0 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <Radar
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
