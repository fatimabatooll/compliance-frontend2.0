"use client"

import { use } from "react"
import { getCompanyById, getMaturityLabel } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const domainScores = [
  { domain: "Strategy", score: 65, max: 100 },
  { domain: "Technology", score: 72, max: 100 },
  { domain: "Data & AI", score: 58, max: 100 },
  { domain: "Talent", score: 55, max: 100 },
  { domain: "Governance", score: 70, max: 100 },
  { domain: "Culture", score: 62, max: 100 },
  { domain: "Operations", score: 68, max: 100 },
  { domain: "ROI", score: 60, max: 100 },
]

const dimensionScores = [
  { name: "Strategic Alignment", value: 70 },
  { name: "AI Governance", value: 65 },
  { name: "Data Infrastructure", value: 60 },
  { name: "Talent & Skills", value: 58 },
  { name: "Technology Stack", value: 75 },
  { name: "Use Case Development", value: 62 },
  { name: "Risk Management", value: 68 },
  { name: "Value Realization", value: 60 },
]

export default function CompanyDetailsPage({
  params,
}: {
  params: Promise<{ consultantId: string; companyId: string }>
}) {
  const { consultantId, companyId } = use(params)
  const company = getCompanyById(companyId)

  if (!company) {
    return <div>Company not found</div>
  }

  if (company.status !== "evaluated") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {company.name}
          </h1>
          <p className="text-sm text-muted-foreground">{company.industry}</p>
        </div>
        <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center min-h-96">
          <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <div className="text-2xl">📋</div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Company is not Evaluated
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            This company has not completed the GenAI Readiness Assessment yet.
            Please ensure the questionnaire is completed before viewing detailed
            analytics.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Company Profile */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          {company.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {company.industry} • {company.size} employees • Assessed by{" "}
          {company.consultant}
        </p>
      </div>

      {/* Overall Score Card */}
      <div className="glass rounded-2xl p-6 border-l-4 border-l-primary">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Overall Readiness Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                {company.readinessScore}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Maturity Level
            </p>
            <p className="text-lg font-semibold text-accent">
              {getMaturityLabel(company.readinessScore)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Scores Chart */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Domain Scores
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={domainScores}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="domain"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                textStyle={{ color: "var(--foreground)" }}
              />
              <Bar dataKey="score" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dimension Maturity Radar */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Dimensions Assessment
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={dimensionScores}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                fill="var(--foreground)"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                textStyle={{ color: "var(--foreground)" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Domain Details */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Detailed Domain Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {domainScores.map((domain) => (
            <div
              key={domain.domain}
              className="rounded-xl border border-border/50 p-4 bg-secondary/20"
            >
              <p className="text-sm font-medium text-foreground mb-2">
                {domain.domain}
              </p>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-2xl font-bold text-primary">
                  {domain.score}
                </span>
                <span className="text-xs text-muted-foreground mb-1">
                  /{domain.max}
                </span>
              </div>
              <div className="w-full h-2 bg-border/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(domain.score / domain.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
