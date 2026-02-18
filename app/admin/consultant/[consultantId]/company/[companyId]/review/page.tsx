"use client"

import { use, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import companyService from "@/services/companyService"
import questionnaireService, {
  type Domain,
  type DomainScore,
} from "@/services/questionnaireService"

type ReviewQuestion = {
  id: string
  text: string
  type: string
  answer: string | boolean | string[] | null | undefined
}

type ReviewDimension = {
  id: string
  name: string
  domain: string
  domainScore: number
  domainMaturity: string
  dimensionScore: number
  dimensionMaturity: string
  questions: ReviewQuestion[]
}

const formatMaturity = (value?: string | number | null) => {
  if (value === undefined || value === null) return "N/A"

  if (typeof value === "number") {
    const maturityByLevel: Record<number, string> = {
      0: "UNINITIATED",
      1: "LEARNER",
      2: "EXPLORER",
      3: "TRANSFORMATIVE",
      4: "PROFESSIONAL",
    }
    return maturityByLevel[value] || String(value)
  }

  return String(value).replace(/_/g, " ").toUpperCase()
}

const parseAnswer = (answer: ReviewQuestion["answer"]) => {
  if (answer === undefined || answer === null || answer === "") return null
  if (Array.isArray(answer)) return answer.filter(Boolean).map(String)
  if (typeof answer === "boolean") return answer ? "Yes" : "No"
  if (typeof answer === "string" && answer.includes("$")) {
    return answer
      .split("$")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return String(answer)
}

const normalizeDimensions = (domains: Domain[], scores: DomainScore[]) => {
  const scoreByDomainId = new Map(scores.map((item) => [item.domainId, item]))

  return domains.flatMap((domain) => {
    const domainScore = scoreByDomainId.get(domain.id)

    return domain.dimensions.map((dimension) => {
      const dimScoreData = domainScore?.dimensionScores?.find(
        (item) => item.dimensionId === dimension.id
      )
      const responseQuestions =
        dimScoreData?.responses?.map((item, index) => ({
          id: item.question?.id || `${dimension.id}-${index}`,
          text: item.question?.question || item.question?.text || "Question",
          type: item.question?.type || "text",
          answer: item.response,
        })) || []

      const fallbackQuestions =
        dimension.questions?.map((question) => ({
          id: question.id,
          text: question.question || question.text || "Question",
          type: question.type || "text",
          answer: null,
        })) || []

      return {
        id: dimension.id,
        name: dimension.title,
        domain: domain.title,
        domainScore: domainScore?.domainScore ?? 0,
        domainMaturity: formatMaturity(domainScore?.maturityLevel),
        dimensionScore: dimScoreData?.dimensionScore ?? 0,
        dimensionMaturity: formatMaturity(dimScoreData?.maturityLevel),
        questions: responseQuestions.length ? responseQuestions : fallbackQuestions,
      } as ReviewDimension
    })
  })
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ consultantId: string; companyId: string }>
}) {
  const { companyId } = use(params)
  const searchParams = useSearchParams()
  const { token } = useAuth()
  const readinessIndexType = searchParams.get("index") || "genai"

  const [companyName, setCompanyName] = useState("Company")
  const [dimensions, setDimensions] = useState<ReviewDimension[]>([])
  const [currentDimIndex, setCurrentDimIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage("")

        const [company, domains, scores] = await Promise.all([
          companyService.getCompanyById(companyId, token, readinessIndexType),
          questionnaireService.getDomains(readinessIndexType, token),
          questionnaireService.viewResponses(companyId, readinessIndexType, token),
        ])

        if (company?.name) setCompanyName(company.name)

        const normalized = normalizeDimensions(domains, scores)
        setDimensions(normalized)
        setCurrentDimIndex(0)
      } catch (error: unknown) {
        const message =
          typeof error === "object" && error && "message" in error
            ? String((error as { message: string }).message)
            : "Failed to load review details."
        setErrorMessage(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [companyId, token, readinessIndexType])

  const currentDimension = dimensions[currentDimIndex]
  const answeredCount = useMemo(() => {
    if (!currentDimension) return 0
    return currentDimension.questions.filter((q) => parseAnswer(q.answer)).length
  }, [currentDimension])

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 p-8 text-center text-sm text-muted-foreground">
        Loading review...
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

  if (!currentDimension) {
    return (
      <div className="rounded-2xl border border-border/50 p-8 text-center text-sm text-muted-foreground">
        No review data available.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">{companyName}</h1>
        <p className="text-sm text-muted-foreground">Assessment Review</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-4 sticky top-32 max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="flex items-center justify-center mb-6 pb-4 border-b border-border/50">
              <Image
                src="/logo-sidat-hyder.png"
                alt="SIDAT HYDER"
                width={120}
                height={40}
              />
            </div>

            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              Assessment Review
            </h3>

            <div className="space-y-3">
              {Array.from(new Set(dimensions.map((d) => d.domain))).map((domain) => {
                const domainDims = dimensions.filter((d) => d.domain === domain)
                return (
                  <div key={domain}>
                    <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                      {domain}
                    </p>
                    {domainDims.map((dim) => {
                      const index = dimensions.findIndex((item) => item.id === dim.id)
                      const isActive = currentDimIndex === index
                      const dimAnswered = dim.questions.filter((q) =>
                        parseAnswer(q.answer)
                      ).length
                      const dimComplete = dimAnswered === dim.questions.length

                      return (
                        <button
                          key={dim.id}
                          onClick={() => setCurrentDimIndex(index)}
                          className={cn(
                            "w-full text-left px-3 py-3 rounded-lg transition-all text-sm mb-2",
                            isActive
                              ? "bg-primary/15 border-l-2 border-l-primary text-primary font-semibold"
                              : dimComplete
                                ? "bg-accent/10 border-l-2 border-l-accent text-foreground"
                                : "border-l-2 border-l-border text-muted-foreground"
                          )}
                        >
                          <p>{dim.name}</p>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6 border-l-4 border-l-primary">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Domain Score
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-primary">
                      {currentDimension.domainScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-primary/15">
                  <div className="text-lg">DS</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Maturity: {currentDimension.domainMaturity}
              </p>
            </div>

            <div className="glass rounded-2xl p-6 border-l-4 border-l-accent">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Dimension Score
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-accent">
                      {currentDimension.dimensionScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-accent/15">
                  <div className="text-lg">DM</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Maturity: {currentDimension.dimensionMaturity}
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {currentDimension.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentDimension.domain} • {answeredCount} of{" "}
                {currentDimension.questions.length} questions answered
              </p>
              <div className="mt-4 w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${(answeredCount / Math.max(currentDimension.questions.length, 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-6">
              {currentDimension.questions.map((question) => {
                const answer = parseAnswer(question.answer)
                return (
                  <div
                    key={question.id}
                    className="pb-6 border-b border-border/30 last:border-0"
                  >
                    <p className="font-medium text-foreground mb-3">
                      {question.text}
                    </p>
                    <div className="bg-secondary/50 rounded-lg p-4 text-sm text-foreground">
                      {Array.isArray(answer) ? (
                        <div className="flex flex-wrap gap-2">
                          {answer.map((item, index) => (
                            <span
                              key={`${question.id}-${index}`}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : answer ? (
                        <p>{answer}</p>
                      ) : (
                        <p className="text-muted-foreground italic">
                          No answer provided
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setCurrentDimIndex(Math.max(0, currentDimIndex - 1))}
              disabled={currentDimIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <div className="flex-1" />
            <button
              onClick={() =>
                setCurrentDimIndex(
                  Math.min(dimensions.length - 1, currentDimIndex + 1)
                )
              }
              disabled={currentDimIndex === dimensions.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
