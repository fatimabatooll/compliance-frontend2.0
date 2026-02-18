"use client"

import { use, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getMaturityLabel } from "@/lib/ui-helpers"
import companyService, { type CompanyDetails } from "@/services/companyService"
import consultantService from "@/services/consultantService"
import questionnaireService from "@/services/questionnaireService"
import { useAuth } from "@/hooks/useAuth"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

type DomainChartRow = {
  domain: string
  score: number
  max: number
}

type DimensionChartRow = {
  name: string
  value: number
}

export default function CompanyDetailsPage({
  params,
}: {
  params: Promise<{ consultantId: string; companyId: string }>
}) {
  const { consultantId, companyId } = use(params)
  const searchParams = useSearchParams()
  const { token } = useAuth()
  const readinessIndexType = searchParams.get("index") || "genai"

  const [company, setCompany] = useState<CompanyDetails | null>(null)
  const [consultantName, setConsultantName] = useState("Consultant")
  const [domainScores, setDomainScores] = useState<DomainChartRow[]>([])
  const [dimensionScores, setDimensionScores] = useState<DimensionChartRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage("")

        const [companyData, consultantData] = await Promise.all([
          companyService.getCompanyById(companyId, token, readinessIndexType),
          consultantService.getConsultantById(consultantId, token),
        ])

        setCompany(companyData)
        if (consultantData?.name) {
          setConsultantName(consultantData.name)
        }

        if (!companyData || companyData.status !== "evaluated") {
          setDomainScores([])
          setDimensionScores([])
          return
        }

        try {
          const [domains, scores] = await Promise.all([
            questionnaireService.getDomains(readinessIndexType, token),
            questionnaireService.viewResponses(companyId, readinessIndexType, token),
          ])

          const domainScoreMap = new Map(
            scores.map((item) => [item.domainId, item.domainScore])
          )
          const dimensionScoreMap = new Map(
            scores.flatMap((item) =>
              item.dimensionScores.map((dimension) => [
                dimension.dimensionId,
                dimension.dimensionScore,
              ])
            )
          )

          const domainRows: DomainChartRow[] = domains.map((domain) => ({
            domain: domain.title,
            score: domainScoreMap.get(domain.id) ?? 0,
            max: 100,
          }))

          const dimensionRows: DimensionChartRow[] = domains
            .flatMap((domain) =>
              domain.dimensions.map((dimension) => ({
                name: dimension.title,
                value: dimensionScoreMap.get(dimension.id) ?? 0,
              }))
            )
            .slice(0, 10)

          setDomainScores(domainRows)
          setDimensionScores(dimensionRows)
        } catch {
          setDomainScores([])
          setDimensionScores([])
        }
      } catch (error: unknown) {
        const message =
          typeof error === "object" && error && "message" in error
            ? String((error as { message: string }).message)
            : "Failed to load company details."
        setErrorMessage(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [companyId, consultantId, token, readinessIndexType])

  const maturityLabel = useMemo(() => {
    if (!company) return "-"
    return getMaturityLabel(company.readinessScore)
  }, [company])

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 p-8 text-center text-sm text-muted-foreground">
        Loading company details...
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {errorMessage}
      </div>
    )
  }

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
            <div className="text-2xl">Not Ready</div>
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
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">{company.name}</h1>
        <p className="text-sm text-muted-foreground">
          {company.industry}
          {company.size ? ` • ${company.size}` : ""} • Assessed by {consultantName}
        </p>
      </div>

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
            <p className="text-lg font-semibold text-accent">{maturityLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              />
              <Bar dataKey="score" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

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
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

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
