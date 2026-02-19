"use client";

import { useId } from "react";

type Props = {
  value: number;
  max?: number;
  label: string;
};

const MATURITY_LABELS = {
  0: "Not Started",
  1: "Learner",
  2: "Explorer",
  3: "Transformative",
  4: "Professional",
};

function getMaturityLevel(score: number) {
  if (score <= 0) return 0;
  if (score <= 25) return 1;
  if (score <= 50) return 2;
  if (score <= 75) return 3;
  return 4;
}

export default function CircularProgress({
  value,
  max = 100,
  label,
}: Props) {
  const percentage = Math.min((value / max) * 100, 100);

  const radius = 54;
  const strokeWidth = 6; // ✅ THINNER RING
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (circumference * percentage) / 100;

  const maturityLevel = getMaturityLevel(value);

  const gradientId = useId(); // ✅ Prevent gradient conflicts

  return (
    <div className="flex flex-col items-center group relative">
      
      {/* ✅ Tooltip */}
      <div className="absolute -top-2 translate-y-[-100%] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs shadow-md whitespace-nowrap">
          {MATURITY_LABELS[maturityLevel]}
        </div>
      </div>

      {/* ✅ Circle */}
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90">
          
          {/* ✅ Gradient */}
          <defs>
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#38BDF8" />   {/* Sky */}
              <stop offset="100%" stopColor="#6366F1" /> {/* Indigo */}
            </linearGradient>
          </defs>

          {/* Background */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={`url(#${gradientId})`} // ✅ GRADIENT STROKE
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: "drop-shadow(0 0 6px rgba(99,102,241,0.35))", // ✅ Subtle Glow
            }}
          />
        </svg>

        {/* ✅ Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {value}%
          </span>
        </div>
      </div>

      {/* ✅ Label */}
      <p className="text-sm font-medium text-foreground mt-3 text-center">
        {label}
      </p>
    </div>
  );
}
