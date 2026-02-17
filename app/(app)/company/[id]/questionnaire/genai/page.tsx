"use client"

import { use, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowLeft, Check, Save, ChevronRight } from "lucide-react"
import { dimensions, getCompanyById, companies } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function QuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const company = getCompanyById(id) || companies[0]

  const [currentDimIndex, setCurrentDimIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | number[] | string>>({})
  const [savedPulse, setSavedPulse] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentDim = dimensions[currentDimIndex]
  const dimAnsweredCount = currentDim.questions.filter(
    (q) => answers[q.id] !== undefined
  ).length
  const isCurrentDimComplete = dimAnsweredCount === currentDim.questions.length

  const totalAnswered = Object.keys(answers).length
  const totalQuestions = dimensions.reduce((acc, d) => acc + d.questions.length, 0)
  const overallProgress = (totalAnswered / totalQuestions) * 100

  const handleAnswer = useCallback((questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setSavedPulse(true)
    setTimeout(() => setSavedPulse(false), 1500)
  }, [])

  const handleNextDimension = () => {
    if (isCurrentDimComplete && currentDimIndex < dimensions.length - 1) {
      setCurrentDimIndex(currentDimIndex + 1)
    }
  }

  const handlePreviousDimension = () => {
    if (currentDimIndex > 0) {
      setCurrentDimIndex(currentDimIndex - 1)
    }
  }

  const canProceedToNext = isCurrentDimComplete

  // Group dimensions by domain
  const domainGroups = dimensions.reduce(
    (acc, dim, idx) => {
      const domain = dim.domain
      if (!acc[domain]) {
        acc[domain] = []
      }
      acc[domain].push({ ...dim, index: idx })
      return acc
    },
    {} as Record<string, any[]>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 pt-24 mt-24">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {company.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                GenAI Readiness Assessment
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">
                {Math.round(overallProgress)}% Complete
              </div>
              <p className="text-xs text-muted-foreground">
                {totalAnswered} of {totalQuestions} questions
              </p>
            </div>
          </div>
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <main className="flex-1 px-4 pb-8 pt-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Panel - Domain & Dimension Navigation */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-4 sticky top-40 max-h-[calc(100vh-200px)] overflow-y-auto">
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
                  Assessment Progress
                </h3>

                {Object.entries(domainGroups).map(([domain, dims]) => (
                  <div key={domain} className="mb-6">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 opacity-70">
                      {domain}
                    </h4>
                    <div className="space-y-2">
                      {dims.map((dim: any) => {
                        const dimQAnswered = dim.questions.filter(
                          (q: any) => answers[q.id] !== undefined
                        ).length
                        const dimIsComplete =
                          dimQAnswered === dim.questions.length
                        const isActive = currentDimIndex === dim.index

                        return (
                          <div
                            key={dim.index}
                            className={cn(
                              "w-full text-left px-3 py-3 rounded-lg transition-all text-sm",
                              isActive
                                ? "bg-primary/15 border-l-2 border-primary text-primary font-semibold"
                                : dimIsComplete
                                  ? "bg-accent/10 border-l-2 border-accent text-foreground"
                                  : "border-l-2 border-border text-muted-foreground"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span>{dim.name}</span>
                              <div className="flex items-center gap-1.5">
                                {dimIsComplete && (
                                  <Check className="h-4 w-4 text-accent" />
                                )}
                                {dimQAnswered > 0 && !dimIsComplete && (
                                  <span className="text-xs font-medium bg-primary/20 px-2 py-0.5 rounded">
                                    {dimQAnswered}/5
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Questions */}
            <div className="lg:col-span-2">
              {/* Dimension Header */}
              <div
                className={`mb-6 transition-all duration-500 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <div className="mb-4">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    {currentDim.domain} • Dimension {currentDimIndex + 1} of{" "}
                    {dimensions.length}
                  </span>
                  <h1 className="text-3xl font-bold text-foreground mt-2">
                    {currentDim.name}
                  </h1>
                </div>

                {/* Dimension Progress */}
                <div className="glass rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      {dimAnsweredCount} of {currentDim.questions.length} answered
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium px-3 py-1 rounded-full",
                        isCurrentDimComplete
                          ? "bg-accent/15 text-accent"
                          : "bg-primary/15 text-primary"
                      )}
                    >
                      {isCurrentDimComplete ? "Complete ✓" : "In Progress"}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        isCurrentDimComplete
                          ? "bg-gradient-to-r from-accent to-accent"
                          : "bg-gradient-to-r from-primary to-primary"
                      )}
                      style={{
                        width: `${
                          (dimAnsweredCount / currentDim.questions.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6 mb-8">
                {currentDim.questions.map((question, idx) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={idx}
                    answer={answers[question.id]}
                    onAnswer={handleAnswer}
                  />
                ))}
              </div>

              {/* Navigation & Save Status */}
              <div className="glass rounded-2xl p-6 sticky bottom-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {savedPulse && (
                      <div className="flex items-center gap-2 text-accent animate-pulse">
                        <Save className="h-4 w-4" />
                        <span className="text-sm font-medium">Auto-saving...</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/company/${company.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Exit Assessment
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  {currentDimIndex > 0 && (
                    <button
                      onClick={handlePreviousDimension}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </button>
                  )}
                  <div className="flex-1" />
                  {currentDimIndex === dimensions.length - 1 &&
                  isCurrentDimComplete ? (
                    <Link
                      href={`/company/${company.id}`}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-all"
                    >
                      <Check className="h-4 w-4" />
                      Complete Assessment
                    </Link>
                  ) : (
                    <button
                      onClick={handleNextDimension}
                      disabled={!canProceedToNext}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all",
                        !canProceedToNext
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      Next Dimension
                      <ArrowRight className="h-4 w-4" />
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

interface QuestionCardProps {
  question: any
  index: number
  answer?: number | number[] | string
  onAnswer: (questionId: string, value: any) => void
}

function QuestionCard({ question, index, answer, onAnswer }: QuestionCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={`glass rounded-2xl p-6 transition-all duration-500 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 text-primary font-semibold text-sm">
          {index + 1}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">
            {question.text}
          </h3>
          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md">
            {question.type === "mcq" && "Multiple Choice"}
            {question.type === "text" && "Text Response"}
            {question.type === "binary" && "Yes / No"}
            {question.type === "multiselect" && "Select Multiple"}
          </span>
        </div>
      </div>

      {/* Render based on question type */}
      {question.type === "mcq" && (
        <div className="space-y-3">
          {question.options?.map((option: string, idx: number) => (
            <button
              key={idx}
              onClick={() => onAnswer(question.id, idx)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm",
                answer === idx
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border-2 transition-all",
                    answer === idx
                      ? "border-primary bg-primary"
                      : "border-border bg-card"
                  )}
                />
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {question.type === "binary" && (
        <div className="flex gap-3">
          {question.options?.map((option: string, idx: number) => (
            <button
              key={idx}
              onClick={() => onAnswer(question.id, idx)}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all",
                answer === idx
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === "text" && (
        <textarea
          value={(answer as string) || ""}
          onChange={(e) => onAnswer(question.id, e.target.value)}
          placeholder={question.placeholder || "Enter your response..."}
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-all resize-none h-28 font-medium"
        />
      )}

      {question.type === "multiselect" && (
        <div className="space-y-3">
          {question.options?.map((option: string, idx: number) => {
            const isSelected = Array.isArray(answer)
              ? answer.includes(idx)
              : false

            return (
              <button
                key={idx}
                onClick={() => {
                  const currentSelected = Array.isArray(answer) ? answer : []
                  const newSelected = isSelected
                    ? currentSelected.filter((i) => i !== idx)
                    : [...currentSelected, idx]
                  onAnswer(question.id, newSelected)
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm",
                  isSelected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-card text-foreground hover:border-accent/50 hover:bg-accent/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-4 w-4 rounded border-2 transition-all flex items-center justify-center",
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-border bg-card"
                    )}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 text-accent-foreground" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
