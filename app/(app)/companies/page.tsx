"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Building2,
  TrendingUp,
  BarChart3,
  Search,
  Plus,
} from "lucide-react"
import companyService, {
  type ConsultantCompany,
  type CreateCompanyInput,
} from "@/services/companyService"
import { getStatusColor, getMaturityColor } from "@/lib/ui-helpers"
import { cn } from "@/lib/utils"
import { AddCompanyModal } from "@/components/add-company-modal"
import { useAuth } from "@/hooks/useAuth"

const statusFilters = ["All", "Evaluated", "In Progress", "Pending"]

function HeroStrip({ companies }: { companies: ConsultantCompany[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const totalCompanies = companies.length
  const evaluatedCount = companies.filter((c) => c.status === "evaluated").length
  const evaluatedPct = totalCompanies
    ? Math.round((evaluatedCount / totalCompanies) * 100)
    : 0
  const scoredCompanies = companies.filter((c) => c.readinessScore > 0)
  const avgScore = scoredCompanies.length
    ? Math.round(
        scoredCompanies.reduce((sum, item) => sum + item.readinessScore, 0) /
          scoredCompanies.length
      )
    : 0

  const stats = [
    {
      label: "Total Companies",
      value: totalCompanies,
      icon: Building2,
      color: "text-primary",
    },
    {
      label: "Evaluated",
      value: `${evaluatedPct}%`,
      icon: BarChart3,
      color: "text-accent",
    },
    {
      label: "Avg Readiness",
      value: avgScore,
      icon: TrendingUp,
      color: "text-chart-3",
    },
  ]

  return (
    <div
      className={`mb-8 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="my-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Company Portfolio
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor and manage GenAI readiness assessments across your client base
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="glass rounded-2xl p-5 hover:glow-sm transition-all duration-300"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  stat.color === "text-primary" && "bg-primary/10",
                  stat.color === "text-accent" && "bg-accent/10",
                  stat.color === "text-chart-3" && "bg-chart-3/10"
                )}
              >
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CompanyCard({
  company,
  index,
}: {
  company: ConsultantCompany
  index: number
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const progress = company.evaluationProgress ?? 0

  const renderActions = () => {
    if (company.status === "evaluated") {
      return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href={`/company/${company.id}/review-answers`}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors text-center"
          >
            Review Answers
          </Link>
          <Link
            href={`/company/${company.id}`}
            className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors text-center"
          >
            Details
          </Link>
        </div>
      )
    }

    if (company.status === "in-progress") {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Progress: {company?.evaluationProgress}%
            </p>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${company?.evaluationProgress}%` }}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Link
              href={`/company/${company.id}/questionnaire/genai`}
              className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors text-center"
            >
              Continue
            </Link>
            <Link
              href={`/company/${company.id}`}
              className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors text-center"
            >
              Details
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="flex gap-2">
        <Link
          href={`/company/${company.id}/questionnaire/genai`}
          className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors text-center"
        >
          Start Questionnaire
        </Link>
        <Link
          href={`/company/${company.id}`}
          className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors text-center"
        >
          Details
        </Link>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none border border-primary/20" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
            {company.logo}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors capitalize">
              {company.name}
            </h3>
            <p className="text-xs text-muted-foreground">{company.industry}</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border",
            getStatusColor(company.status)
          )}
        >
          {company.status === "evaluated" && (
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          )}
          {company.status === "in-progress" && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          )}
          {company.status.charAt(0).toUpperCase() +
            company.status.slice(1).replace("-", " ")}
        </span>
      </div>

      {company.status === "evaluated" && (
        <div className="mb-4">
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-2xl font-bold",
                getMaturityColor(company.readinessScore)
              )}
            >
              {company.readinessScore}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-border/50">
        <p className="text-[11px] text-muted-foreground mb-3">
          {company.size ? `${company.size} employees` : "Company assessment"}
        </p>
        {renderActions()}
      </div>
    </div>
  )
}

export default function CompaniesPage() {
  const { token, user } = useAuth()
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [companiesList, setCompaniesList] = useState<ConsultantCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const fetchCompanies = useCallback(async () => {
    if (!token || !user?.id) return

    try {
      setIsLoading(true)
      setErrorMessage("")
      const response = await companyService.getCompaniesByConsultantId(
        user.id,
        token,
        "genai"
      )
      setCompaniesList(response.companies)
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to load companies."
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }, [token, user?.id])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const filteredCompanies = useMemo(
    () =>
      companiesList.filter((company) => {
        const matchesFilter =
          activeFilter === "All" ||
          company.status === activeFilter.toLowerCase().replace(" ", "-")
        const matchesSearch =
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.industry.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
      }),
    [companiesList, activeFilter, searchQuery]
  )
   
  const handleAddCompany = async (
    newCompany: Omit<CreateCompanyInput, "consultantId">
  ) => {
    if (!token || !user?.id) return

    await companyService.createCompany(
      {
        ...newCompany,
        consultantId: user.id,
      },
      token
    )
    await fetchCompanies()
  }

  return (
    <div>
      <HeroStrip companies={companiesList} />

      {errorMessage && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive mb-4">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm self-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companies..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>

        <div className="flex items-center lg:gap-2 flex-wrap justify-center gap-4">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                activeFilter === filter
                  ? "bg-primary text-primary-foreground shadow-sm glow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              {filter}
            </button>
          ))}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-xl text-xs font-medium hover:bg-accent/90 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border/50 p-8 text-center text-sm text-muted-foreground">
          Loading companies...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company, i) => (
            <CompanyCard key={company.id} company={company} index={i} />
          ))}
        </div>
      )}

      {!isLoading && filteredCompanies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            No companies found
          </p>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      <AddCompanyModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAddCompany={handleAddCompany}
      />
    </div>
  )
}