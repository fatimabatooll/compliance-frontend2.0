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
  0: "#fca5a5", // red
  1: "#fdba74", // orange
  2: "#fde047", // yellow
  3: "#86efac", // green
  4: "#60a5fa", // blue
};
export default function DimensionMaturityRadar({ data }) {
  console.log(data, "dimension");
  if (!data || data.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        No dimension data available
      </p>
    );
  }

  const radarData = data.map((item) => ({
    name: item.name,
    maturity: Number(item.value),
  }));

  return (
    <div className='w-100% h-[560px]'>
      <ResponsiveContainer>
        <RadarChart data={radarData}>
          {/* ✅ Softer grid */}
          <PolarGrid />

          {/* ✅ Better labels */}
          <PolarAngleAxis
            dataKey='name'
            tick={{
              fontSize: 11,
            }}
            tickLine={false}
          />

          {/* ✅ Cleaner scale */}
          <PolarRadiusAxis
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4]}
            tickFormatter={(value) => MATURITY_LABELS[value]}
            tick={{ fontSize: 11 }}
          />

          {/* ✅ Actual data */}
          {[0, 1, 2, 3, 4].map((level) => (
            <Radar
              key={`ring-${level}`}
              dataKey={() => level}
              stroke='none'
              fill={MATURITY_COLORS[level]}
              fillOpacity={0.08}
              isAnimationActive={false}
              dot={false}
              activeDot={false}
            />
          ))}

          {/* ===== Actual maturity data ===== */}
          <Radar
            name='Maturity Level'
            dataKey='maturity'
            stroke='#1d4ed8'
            fill='#3b82f6'
            fillOpacity={0.35}
            dot={false}
            activeDot={false}
          />

          {/* ✅ Better tooltip */}
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div
                    style={{
                      backgroundColor: "#1f2937",
                      color: "white",
                      padding: "10px 14px",
                      border: "none",
                      borderRadius: "4px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      fontSize: "13px",
                    }}
                  >
                    <p style={{ margin: "0 0 4px 0" }}>
                      <strong>Dimension:</strong> {data.name}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Maturity:</strong> {MATURITY_LABELS[data.maturity]}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
