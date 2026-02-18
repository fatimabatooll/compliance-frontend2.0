"use client"

import { useEffect, useState } from "react"
import { getMaturityLabel } from "@/lib/ui-helpers"

export function ScoreGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  const circumference = 2 * Math.PI * 54
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference

  const maturityLabel = getMaturityLabel(score)

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          {/* Score arc */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient
              id="gaugeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">
            {animatedScore}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
          {maturityLabel}
        </span>
      </div>
    </div>
  )
}
