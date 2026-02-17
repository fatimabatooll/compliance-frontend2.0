"use client"

import { use, useState } from "react"
import Image from "next/image"
import { getCompanyById, dimensions } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronLeft } from "lucide-react"

const mockAnswers: { [key: string]: any } = {
  "q1-1-1": "Yes, we have established processes",
  "q1-1-2": "C-suite and board level",
  "q1-1-3": 2,
  "q1-1-4": "High strategic importance",
  "q1-1-5": 3,
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ consultantId: string; companyId: string }>
}) {
  const { consultantId, companyId } = use(params)
  const company = getCompanyById(companyId)
  const [currentDimIndex, setCurrentDimIndex] = useState(0)

  if (!company) {
    return <div>Company not found</div>
  }

  const currentDimension = dimensions[currentDimIndex]
  const dimQAnswered = currentDimension.questions.filter(
    (q: any) => mockAnswers[q.id] !== undefined
  ).length

  const getDomainScore = (domainName: string): number => {
    const domainDims = dimensions.filter((d) => d.domain === domainName)
    const totalScore = domainDims.reduce((acc, dim) => {
      const answered = dim.questions.filter(
        (q: any) => mockAnswers[q.id] !== undefined
      ).length
      return acc + (answered / dim.questions.length) * 100
    }, 0)
    return Math.round(totalScore / domainDims.length)
  }

  const getDimensionScore = (dimensionId: string): number => {
    const dimension = dimensions.find((d) => d.id === dimensionId)
    if (!dimension) return 0
    const answered = dimension.questions.filter(
      (q: any) => mockAnswers[q.id] !== undefined
    ).length
    return Math.round((answered / dimension.questions.length) * 100)
  }

  const domainScore = getDomainScore(currentDimension.domain)
  const dimensionScore = getDimensionScore(currentDimension.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-4 sticky top-32 max-h-[calc(100vh-180px)] overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6 pb-4 border-b border-border/50">
              <Image
                src="/logo-sidat-hyder.png"
                alt="SIDAT HYDER"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>

            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              Assessment Review
            </h3>

            <div className="space-y-3">
              {Array.from(new Set(dimensions.map((d) => d.domain))).map(
                (domain) => {
                  const domainDims = dimensions.filter(
                    (d) => d.domain === domain
                  )
                  return (
                    <div key={domain}>
                      <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                        {domain}
                      </p>
                      {domainDims.map((dim) => {
                        const isActive = currentDimIndex === dim.index
                        const dimAnswered = dim.questions.filter(
                          (q: any) => mockAnswers[q.id] !== undefined
                        ).length
                        const dimComplete =
                          dimAnswered === dim.questions.length

                        return (
                          <div
                            key={dim.id}
                            className={cn(
                              "px-3 py-3 rounded-lg transition-all text-sm mb-2",
                              isActive
                                ? "bg-primary/15 border-l-2 border-l-primary text-primary font-semibold"
                                : dimComplete
                                  ? "bg-accent/10 border-l-2 border-l-accent text-foreground"
                                  : "border-l-2 border-l-border text-muted-foreground"
                            )}
                          >
                            <p>{dim.name}</p>
                          </div>
                        )
                      })}
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Domain Score Card */}
            <div className="glass rounded-2xl p-6 border-l-4 border-l-primary">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Domain Score
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-primary">
                      {domainScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-primary/15">
                  <div className="text-lg">📊</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Maturity: TRANSFORMATIVE
              </p>
            </div>

            {/* Dimension Score Card */}
            <div className="glass rounded-2xl p-6 border-l-4 border-l-accent">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Dimension Score
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-accent">
                      {dimensionScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-accent/15">
                  <div className="text-lg">📑</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Maturity: TRANSFORMATIVE
              </p>
            </div>
          </div>

          {/* Dimension Content */}
          <div className="glass rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {currentDimension.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentDimension.domain} • {dimQAnswered} of{" "}
                {currentDimension.questions.length} questions answered
              </p>
              <div className="mt-4 w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${(dimQAnswered / currentDimension.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {currentDimension.questions.map((question: any) => {
                const answer = mockAnswers[question.id]
                return (
                  <div key={question.id} className="pb-6 border-b border-border/30 last:border-0">
                    <p className="font-medium text-foreground mb-3">
                      {question.text}
                    </p>
                    <div className="bg-secondary/50 rounded-lg p-4 text-sm text-foreground">
                      {answer ? (
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

          {/* Navigation */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() =>
                setCurrentDimIndex(Math.max(0, currentDimIndex - 1))
              }
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
