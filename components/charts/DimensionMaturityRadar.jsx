"use client";

import { useTheme } from "next-themes";
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

const MATURITY_COLORS_LIGHT = {
  0: "#fca5a5", // red
  1: "#fdba74", // orange
  2: "#fde047", // yellow
  3: "#86efac", // green
  4: "#60a5fa", // blue
};

const MATURITY_COLORS_DARK = {
  0: "#ef4444", // stronger red for dark backgrounds
  1: "#f97316", // stronger orange
  2: "#eab308", // stronger yellow
  3: "#22c55e", // stronger green
  4: "#3b82f6", // stronger blue
};

const MATURITY_LEVELS = [0, 1, 2, 3, 4];
const MATURITY_SCORE_DISPLAY = {
  0: "Not Started 0",
  1: "Learner 1 - 25",
  2: "Explorer 26 - 50",
  3: "Transformative 51 - 75",
  4: "Professional 76 - 100",
};

export default function DimensionMaturityRadar({ data }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const maturityColors = isDark ? MATURITY_COLORS_DARK : MATURITY_COLORS_LIGHT;

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
    <div className='h-full lg:h-[560px] w-full overflow-visible'>
      <div className='flex h-full flex-col gap-4 lg:flex-row'>
        <div className='min-h-[420px] flex-1'>
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid />

              <PolarAngleAxis
                dataKey='name'
                tick={{
                  fontSize: 11,
                }}
                tickLine={false}
              />

              <PolarRadiusAxis
                domain={[0, 5]}
                ticks={MATURITY_LEVELS}
                tickFormatter={(value) => MATURITY_LABELS[value]}
                tick={{ fontSize: 11 }}
              />

              {MATURITY_LEVELS.map((level) => (
                <Radar
                  key={`ring-${level}`}
                  dataKey={() => level}
                  stroke='none'
                  fill={maturityColors[level]}
                  fillOpacity={isDark ? 0.14 : 0.08}
                  isAnimationActive={false}
                  dot={false}
                  activeDot={false}
                />
              ))}

              <Radar
                name='Maturity Level'
                dataKey='maturity'
                stroke={isDark ? "#93c5fd" : "#1d4ed8"}
                fill={isDark ? "#60a5fa" : "#3b82f6"}
                fillOpacity={isDark ? 0.45 : 0.35}
                dot={false}
                activeDot={false}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload;
                    return (
                      <div
                        style={{
                          backgroundColor: isDark ? "#ffffff" : "#1f2937",
                          color: isDark ? "#111827" : "#ffffff",
                          padding: "10px 14px",
                          border: "none",
                          borderRadius: "4px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                          fontSize: "13px",
                        }}
                      >
                        <p style={{ margin: "0 0 4px 0" }}>
                          <strong>Dimension:</strong> {point.name}
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>Maturity:</strong>{" "}
                          {MATURITY_LABELS[point.maturity]}
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

        <div className='shrink-0 rounded-md p-3 lg:w-52 lg:overflow-y-visible'>
          <p className='mb-2 text-sm font-medium'>Maturity Legend</p>
          <div className='space-y-2'>
            {MATURITY_LEVELS.map((level) => (
              <div
                key={`legend-${level}`}
                className='flex items-center gap-2 text-sm'
              >
                {/* <span
                  className='h-3 w-3 rounded-sm'
                  style={{ backgroundColor: "#3b82f6" }}
                /> */}
                <span>{MATURITY_SCORE_DISPLAY[level]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}