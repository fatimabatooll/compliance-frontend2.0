"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const MATURITY_LABELS = {
  0: "Not Started",
  1: "Learner",
  2: "Explorer",
  3: "Transformative",
  4: "Professional",
};

const MATURITY_COLORS = {
  0: "#94A3B8",
  1: "#FDBA74",
  2: "#FDE047",
  3: "#86EFAC",
  4: "#93C5FD",
};

export default function DimensionMaturityRadar({ data }: any) {
  if (!data || data.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        No dimension data available
      </p>
    );
  }

  const radarData = data.map((item: any) => ({
    name: item.name,
    maturity: Number(item.maturity),
  }));

  return (
    <div className='w-full h-[520px]'>
      <ResponsiveContainer>
        <RadarChart data={radarData}>
          <PolarGrid stroke='hsl(var(--border))' />

          <PolarAngleAxis
            dataKey='name'
            tick={{ fontSize: 11 }}
            tickLine={false}
          />

          <PolarRadiusAxis
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tickFormatter={(value) => MATURITY_LABELS[value]}
            tick={{ fontSize: 11 }}
          />

          {/* ✅ Background Rings */}
          {[0, 1, 2, 3, 4].map((level) => (
            <Radar
              key={`ring-${level}`}
              dataKey={() => level}
              stroke='none'
              fill={MATURITY_COLORS[level]}
              fillOpacity={0.06}
              isAnimationActive={false}
            />
          ))}

          {/* ✅ Actual Data */}
          <Radar
            name='Maturity'
            dataKey='maturity'
            stroke='hsl(var(--primary))'
            fill='hsl(var(--primary))'
            fillOpacity={0.35}
          />

          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
