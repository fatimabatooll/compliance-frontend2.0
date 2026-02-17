"use client"

import { use, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, ChevronLeft } from "lucide-react"
import { dimensions, getCompanyById } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { ScoreCards } from "@/components/score-cards"

export default function ReviewAnswersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [currentDimIndex, setCurrentDimIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [answers] = useState<Record<string, any>>({
    "q1-1": {
      type: "text",
      value: "We have some AI initiatives in place",
      answer: "We have some AI initiatives in place",
    },
    "q1-2": {
      type: "mcq",
      value: "option2",
      answer: "Partially implemented",
    },
    "q1-3": {
      type: "binary",
      value: "yes",
      answer: "Yes",
    },
    "q1-4": {
      type: "text",
      value: "Data governance is in place",
      answer: "Data governance is in place",
    },
    "q1-5": {
      type: "multiselect",
      value: ["option1", "option3"],
      answer: ["Policy framework", "Training programs"],
    },
    "q2-1": {
      type: "text",
      value: "Our infrastructure is modern",
      answer: "Our infrastructure is modern",
    },
    "q2-2": {
      type: "mcq",
      value: "option3",
      answer: "Fully implemented",
    },
    "q2-3": {
      type: "binary",
      value: "yes",
      answer: "Yes",
    },
    "q2-4": {
      type: "text",
      value: "Cloud-based architecture deployed",
      answer: "Cloud-based architecture deployed",
    },
    "q2-5": {
      type: "multiselect",
      value: ["option2", "option3"],
      answer: ["API framework", "Microservices"],
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const company = getCompanyById(id)
  const currentDimension = dimensions[currentDimIndex]
  const domainIndex = Math.floor(currentDimIndex / 2)
  const domainName = `Domain ${domainIndex + 1}`

  const calculateScores = () => {
    const dimensionQuestions = currentDimension.questions
    const answeredCount = dimensionQuestions.filter(
      (q) => answers[q.id]?.value
    ).length
    const dimensionScore = Math.round((answeredCount / dimensionQuestions.length) * 100)
    const domainScore = Math.round(dimensionScore * 0.85 + (Math.random() * 30 - 15))

    return {
      dimensionScore,
      domainScore,
      dimensionMaturity: getMaturityLevel(dimensionScore),
      domainMaturity: getMaturityLevel(domainScore),
    }
  }

  const getMaturityLevel = (score: number) => {
    if (score < 25) return "Initial"
    if (score < 50) return "Developing"
    if (score < 75) return "Established"
    return "Transformative"
  }

  const scores = calculateScores()

  const renderAnswer = (question: any) => {
    const answer = answers[question.id]
    if (!answer) return <span className="text-muted-foreground">No answer provided</span>

    switch (question.type) {
      case "text":
        return (
          <p className="text-foreground break-words">{answer.answer}</p>
        )
      case "binary":
        return (
          <span className={cn(
            "inline-flex px-3 py-1 rounded-full text-sm font-medium",
            answer.value === "yes"
              ? "bg-accent/15 text-accent"
              : "bg-destructive/15 text-destructive"
          )}>
            {answer.answer}
          </span>
        )
      case "mcq":
        return (
          <div className="px-4 py-2 rounded-lg bg-secondary text-foreground">
            {answer.answer}
          </div>
        )
      case "multiselect":
        return (
          <div className="flex flex-wrap gap-2">
            {Array.isArray(answer.answer) ? (
              answer.answer.map((item: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-primary/15 text-primary"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">No answer provided</span>
            )}
          </div>
        )
      default:
        return <span className="text-muted-foreground">N/A</span>
    }
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Company not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 pt-20 mt-24">
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Review Answers - {company.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentDimIndex + 1} / {dimensions.length} dimensions reviewed
              </p>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${((currentDimIndex + 1) / dimensions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <main className="flex-1 px-4 pb-8 pt-48">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Panel - Domain & Dimension Navigation */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-4 sticky top-56 max-h-[calc(100vh-300px)] overflow-y-auto">
                {/* Logo Section */}
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
                  Review Progress
                </h3>

                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, domIdx) => {
                    const dims = [
                      dimensions[domIdx * 2],
                      dimensions[domIdx * 2 + 1],
                    ]

                    return (
                      <div key={domIdx}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">
                          Domain {domIdx + 1}
                        </h4>
                        {dims.map((dim: any) => {
                          if (!dim) return null
                          const isActive = currentDimIndex === dim.index

                          return (
                            <div
                              key={dim.index}
                              className={cn(
                                "w-full text-left px-3 py-3 rounded-lg transition-all text-sm",
                                isActive
                                  ? "bg-primary/15 border-l-2 border-primary text-primary font-semibold"
                                  : "border-l-2 border-border text-muted-foreground bg-secondary/30"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span>{dim.name}</span>
                                <Check className="h-4 w-4 text-accent" />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel - Questions and Answers */}
            <div className="lg:col-span-2">
              <div className="glass rounded-2xl p-8 space-y-8">
                {/* Dimension Header */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {domainName}
                  </p>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {currentDimension.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentDimension.description}
                  </p>
                </div>

                {/* Score Cards */}
                <div>
                  <ScoreCards
                    domainScore={scores.domainScore}
                    domainMaturity={scores.domainMaturity}
                    dimensionScore={scores.dimensionScore}
                    dimensionMaturity={scores.dimensionMaturity}
                  />
                </div>

                {/* Questions and Answers */}
                <div className="space-y-6 border-t border-border/50 pt-6">
                  {currentDimension.questions.map(
                    (question: any, qIndex: number) => (
                      <div
                        key={question.id}
                        className="pb-6 border-b border-border/30 last:border-b-0"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/15 flex-shrink-0 text-sm font-bold text-primary">
                            {qIndex + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground font-medium">
                              {question.question}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {question.type.charAt(0).toUpperCase() +
                                question.type.slice(1)}
                            </p>
                          </div>
                        </div>
                        <div className="ml-11">
                          {renderAnswer(question)}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-3 pt-6 border-t border-border/50">
                  <Link
                    href={`/company/${id}`}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Details
                  </Link>
                  <div className="flex-1" />
                  {currentDimIndex > 0 && (
                    <button
                      onClick={() => setCurrentDimIndex(currentDimIndex - 1)}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                  )}
                  {currentDimIndex < dimensions.length - 1 && (
                    <button
                      onClick={() => setCurrentDimIndex(currentDimIndex + 1)}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Next
                      <ChevronLeft className="h-4 w-4 rotate-180" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
