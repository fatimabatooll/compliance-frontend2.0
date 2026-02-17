"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  Target,
} from "lucide-react"
import { domainScores, getMaturityColor, getMaturityLabel } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const reviewPages = [
  {
    title: "Executive Summary",
    icon: FileText,
    content: {
      overallScore: 78,
      maturity: "Advanced",
      summary:
        "Apex Technologies demonstrates strong GenAI readiness with notable strengths in Strategy & Vision and Technology Stack. Key areas for improvement include Culture & Change management and Talent & Skills development. The organization shows a positive trajectory with a 43-point improvement over the past 6 months.",
      recommendations: [
        "Invest in structured AI upskilling programs for cross-functional teams",
        "Establish a formal change management framework for AI initiatives",
        "Strengthen data governance with automated monitoring capabilities",
        "Create an AI ethics review board with diverse stakeholder representation",
      ],
    },
  },
  ...domainScores.map((domain) => ({
    title: domain.domain,
    icon: Target,
    content: {
      score: domain.score,
      maxScore: domain.maxScore,
      maturity: domain.maturity,
      details: getDomainDetails(domain.domain),
    },
  })),
]

function getDomainDetails(domain: string): {
  strengths: string[]
  gaps: string[]
  nextSteps: string[]
} {
  const details: Record<
    string,
    { strengths: string[]; gaps: string[]; nextSteps: string[] }
  > = {
    "Strategy & Vision": {
      strengths: [
        "Formal GenAI strategy documented and approved",
        "Active C-suite sponsorship with dedicated budget",
        "Clear use-case roadmap aligned with business goals",
      ],
      gaps: [
        "Limited board-level reporting on AI progress",
        "Competitive AI landscape analysis not formalized",
      ],
      nextSteps: [
        "Establish quarterly board AI progress reviews",
        "Create competitive AI benchmarking framework",
      ],
    },
    "Data Infrastructure": {
      strengths: [
        "Centralized data lake with good accessibility",
        "Semi-automated ETL pipelines in place",
      ],
      gaps: [
        "Data quality issues in legacy systems",
        "No real-time streaming infrastructure",
        "Limited data lineage tracking",
      ],
      nextSteps: [
        "Implement data quality scoring framework",
        "Pilot real-time streaming for critical use cases",
        "Deploy data lineage tools",
      ],
    },
    "Talent & Skills": {
      strengths: [
        "Small but growing AI team established",
        "Self-directed learning resources available",
      ],
      gaps: [
        "No structured upskilling program",
        "AI skills concentrated in one team",
        "Difficulty retaining AI talent",
      ],
      nextSteps: [
        "Launch AI literacy program for all departments",
        "Create AI ambassador roles in each business unit",
        "Develop competitive compensation packages",
      ],
    },
    "Technology Stack": {
      strengths: [
        "Cloud-native infrastructure with GPU access",
        "Basic CI/CD for model deployment",
        "Modern API architecture",
      ],
      gaps: [
        "No comprehensive MLOps pipeline",
        "Limited model monitoring capabilities",
      ],
      nextSteps: [
        "Implement full MLOps workflow with versioning",
        "Deploy model monitoring and alerting system",
      ],
    },
    "Governance & Ethics": {
      strengths: [
        "Draft AI ethics guidelines published",
        "Periodic bias audits conducted",
      ],
      gaps: [
        "No continuous monitoring for bias",
        "Ethics framework not yet enforced",
        "Lack of diverse review board",
      ],
      nextSteps: [
        "Establish mandatory AI ethics review process",
        "Implement automated bias detection tools",
        "Form cross-functional ethics review board",
      ],
    },
    "Culture & Change": {
      strengths: [
        "Open organizational attitude toward AI",
        "Innovation culture in tech teams",
      ],
      gaps: [
        "No formal change management for AI",
        "Fear and uncertainty in non-tech teams",
        "Limited cross-departmental collaboration",
      ],
      nextSteps: [
        "Create AI change management playbook",
        "Launch AI awareness campaigns across departments",
        "Establish cross-functional AI working groups",
      ],
    },
  }
  return (
    details[domain] || {
      strengths: ["Data not available"],
      gaps: ["Data not available"],
      nextSteps: ["Data not available"],
    }
  )
}

export default function ReviewPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigatePage = (direction: "next" | "prev") => {
    const newIndex =
      direction === "next" ? currentPage + 1 : currentPage - 1
    if (newIndex < 0 || newIndex >= reviewPages.length) return

    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentPage(newIndex)
      setIsTransitioning(false)
    }, 200)
  }

  const page = reviewPages[currentPage]

  return (
    <div>
      {/* Header */}
      <div
        className={`mb-6 transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Link
          href="/company/1"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Company
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Assessment Review
            </h1>
            <p className="text-sm text-muted-foreground">
              Apex Technologies &middot; Read-only executive report
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            Read-only mode
          </div>
        </div>
      </div>

      {/* Page Navigation Strip */}
      <div className="glass rounded-2xl p-2 mb-6 flex items-center gap-1 overflow-x-auto">
        {reviewPages.map((p, i) => (
          <button
            key={p.title}
            onClick={() => {
              setIsTransitioning(true)
              setTimeout(() => {
                setCurrentPage(i)
                setIsTransitioning(false)
              }, 200)
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
              currentPage === i
                ? "bg-card text-foreground shadow-sm glow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            )}
          >
            <p.icon className="h-3.5 w-3.5" />
            {p.title}
          </button>
        ))}
      </div>

      {/* Page Content */}
      <div
        className={cn(
          "transition-all duration-200",
          isTransitioning
            ? "opacity-0 translate-y-2"
            : "opacity-100 translate-y-0"
        )}
      >
        {currentPage === 0 ? (
          <ExecutiveSummary
            data={page.content as (typeof reviewPages)[0]["content"]}
          />
        ) : (
          <DomainReview
            title={page.title}
            data={
              page.content as {
                score: number
                maxScore: number
                maturity: string
                details: { strengths: string[]; gaps: string[]; nextSteps: string[] }
              }
            }
          />
        )}
      </div>

      {/* Page flip navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
        <button
          onClick={() => navigatePage("prev")}
          disabled={currentPage === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            currentPage === 0
              ? "opacity-40 cursor-not-allowed text-muted-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          {currentPage > 0 && reviewPages[currentPage - 1].title}
        </button>
        <span className="text-xs text-muted-foreground">
          {currentPage + 1} / {reviewPages.length}
        </span>
        <button
          onClick={() => navigatePage("next")}
          disabled={currentPage === reviewPages.length - 1}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            currentPage === reviewPages.length - 1
              ? "opacity-40 cursor-not-allowed text-muted-foreground"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          )}
        >
          {currentPage < reviewPages.length - 1 &&
            reviewPages[currentPage + 1].title}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function ExecutiveSummary({
  data,
}: {
  data: {
    overallScore: number
    maturity: string
    summary: string
    recommendations: string[]
  }
}) {
  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Overall GenAI Readiness
        </p>
        <div className="flex items-baseline justify-center gap-2 mb-3">
          <span
            className={cn(
              "text-6xl font-bold",
              getMaturityColor(data.overallScore)
            )}
          >
            {data.overallScore}
          </span>
          <span className="text-xl text-muted-foreground">/100</span>
        </div>
        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
          {getMaturityLabel(data.overallScore)} Maturity
        </span>
      </div>

      {/* Summary */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Summary
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* Domain scores quick view */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Domain Scores
        </h3>
        <div className="space-y-3">
          {domainScores.map((domain) => (
            <div key={domain.domain} className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-32 flex-shrink-0">
                {domain.domain}
              </span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full gradient-primary transition-all duration-1000 ease-out"
                  style={{ width: `${domain.score}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-sm font-bold w-8 text-right",
                  getMaturityColor(domain.score)
                )}
              >
                {domain.score}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium w-20 text-right">
                {domain.maturity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Key Recommendations
        </h3>
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DomainReview({
  title,
  data,
}: {
  title: string
  data: {
    score: number
    maxScore: number
    maturity: string
    details: { strengths: string[]; gaps: string[]; nextSteps: string[] }
  }
}) {
  return (
    <div className="space-y-6">
      {/* Domain score header */}
      <div className="glass rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
          <span
            className={cn(
              "text-xs font-medium px-3 py-1 rounded-full",
              data.maturity === "Advanced" && "bg-accent/10 text-accent",
              data.maturity === "Intermediate" && "bg-primary/10 text-primary",
              data.maturity === "Developing" && "bg-chart-3/10 text-chart-3"
            )}
          >
            {data.maturity}
          </span>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-4xl font-bold",
                getMaturityColor(data.score)
              )}
            >
              {data.score}
            </span>
            <span className="text-sm text-muted-foreground">
              /{data.maxScore}
            </span>
          </div>
          <div className="w-32 h-1.5 rounded-full bg-secondary overflow-hidden mt-2">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-1000"
              style={{ width: `${(data.score / data.maxScore) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Strengths</h3>
          </div>
          <ul className="space-y-3">
            {data.details.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {s}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-chart-3" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Gaps</h3>
          </div>
          <ul className="space-y-3">
            {data.details.gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-chart-3 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {g}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Next Steps
            </h3>
          </div>
          <ul className="space-y-3">
            {data.details.nextSteps.map((n, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {n}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
