"use client"

import React from "react"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ClipboardCheck,
  TrendingUp,
  Target,
  Layers,
} from "lucide-react"
import {
  getCompanyById,
  domainScores,
  trendData,
  radarData,
  strengthsAndGaps,
  getMaturityColor,
  companies,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { ScoreGauge } from "@/components/charts/score-gauge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
} from "recharts"

function ChartCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function CompanyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const company = getCompanyById(id) || companies[0]
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div>
      {/* Header */}
      <div
        className={`mb-8 transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to companies
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-lg font-bold text-foreground">
              {company.logo}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {company.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {company.industry} &middot; {company.size} employees
              </p>
            </div>
          </div>
          <Link
            href={`/company/${company.id}/questionnaire/genai`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <ClipboardCheck className="h-4 w-4" />
            Start Assessment
          </Link>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard
          title="Overall Readiness Score"
          icon={Target}
          className="lg:row-span-2"
        >
          <div className="flex flex-col items-center justify-center h-full py-4">
            <ScoreGauge score={company.readinessScore || 78} />
            <div className="mt-6 grid grid-cols-2 gap-4 w-full">
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <p className="text-lg font-bold text-foreground">6</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Domains
                </p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <p className="text-lg font-bold text-foreground">15</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Questions
                </p>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Domain Maturity Bar Chart */}
        <ChartCard
          title="Domain Maturity"
          icon={Layers}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={domainScores}
              layout="vertical"
              margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="domain"
                width={110}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="score"
                name="Score"
                radius={[0, 6, 6, 0]}
                barSize={16}
              >
                {domainScores.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.score >= 70
                        ? "hsl(var(--accent))"
                        : entry.score >= 50
                          ? "hsl(var(--primary))"
                          : "hsl(var(--chart-3))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar Chart */}
        <ChartCard
          title="Dimension Radar"
          icon={Target}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData} cx="50%" cy="50%">
              <PolarGrid
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Line */}
        <ChartCard title="Readiness Trend" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                name="Score"
                stroke="hsl(var(--primary))"
                fill="url(#areaGrad)"
                strokeWidth={2.5}
                dot={{
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--card))",
                  strokeWidth: 2,
                  r: 4,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Strengths vs Gaps */}
        <ChartCard title="Strengths vs Gaps" icon={Layers}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={strengthsAndGaps}
              layout="vertical"
              margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="area"
                width={100}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="strength"
                name="Strength"
                stackId="a"
                fill="hsl(var(--accent))"
                radius={[0, 0, 0, 0]}
                barSize={14}
              />
              <Bar
                dataKey="gap"
                name="Gap"
                stackId="a"
                fill="hsl(var(--secondary))"
                radius={[0, 4, 4, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Domain Detail Cards */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Domain Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainScores.map((domain, i) => (
            <div
              key={domain.domain}
              className="glass rounded-2xl p-5 hover:glow-sm transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">
                  {domain.domain}
                </h4>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    domain.maturity === "Advanced" &&
                      "bg-accent/10 text-accent",
                    domain.maturity === "Intermediate" &&
                      "bg-primary/10 text-primary",
                    domain.maturity === "Developing" &&
                      "bg-chart-3/10 text-chart-3"
                  )}
                >
                  {domain.maturity}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span
                  className={cn(
                    "text-xl font-bold",
                    getMaturityColor(domain.score)
                  )}
                >
                  {domain.score}
                </span>
                <span className="text-xs text-muted-foreground">
                  / {domain.maxScore}
                </span>
              </div>
              {/* Mini progress bar */}
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full gradient-primary transition-all duration-1000 ease-out"
                  style={{ width: `${domain.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
