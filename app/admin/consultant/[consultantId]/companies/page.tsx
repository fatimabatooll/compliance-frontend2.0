"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { getStatusColor, getMaturityColor } from "@/lib/ui-helpers"
import { cn } from "@/lib/utils"
import companyService, { type ConsultantCompany } from "@/services/companyService"
import { useAuth } from "@/hooks/useAuth"

const statusFilters = ["All", "Evaluated", "In Progress", "Not Evaluated"]
const readinessOptions = [
  { label: "Gen AI", value: "genai" },
  { label: "Web 3.0", value: "web3.0" },
]

export default function ConsultantCompaniesPage({
  params,
}: {
  params: Promise<{ consultantId: string }>
}) {
  const { consultantId } = use(params)
  const { token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const [selectedReadiness, setSelectedReadiness] = useState("genai")
  const [consultantName, setConsultantName] = useState("Consultant")
  const [companies, setCompanies] = useState<ConsultantCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!token) return

    const fetchCompanies = async () => {
      try {
        setIsLoading(true)
        setErrorMessage("")
        const response = await companyService.getCompaniesByConsultantId(
          consultantId,
          token,
          selectedReadiness
        )
        setConsultantName(response.consultantName)
        setCompanies(response.companies)
      } catch (error: unknown) {
        const message =
          typeof error === "object" && error && "message" in error
            ? String((error as { message: string }).message)
            : "Failed to load companies."
        setErrorMessage(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [consultantId, token, selectedReadiness])

  const toStatus = (filter: string) => {
    if (filter === "Evaluated") return "evaluated"
    if (filter === "In Progress") return "in-progress"
    if (filter === "Not Evaluated") return "pending"
    return "all"
  }

  const filteredCompanies = companies.filter((company) => {
    const matchesFilter =
      activeFilter === "All" || company.status === toStatus(activeFilter)
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Consultant:{" "}
          <span className="font-semibold text-foreground">{consultantName}</span>
        </p>
        <h1 className="text-3xl font-bold text-foreground mb-1">Companies</h1>
        <p className="text-sm text-muted-foreground">
          Manage and review company assessments
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companies..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>

        {/* Readiness Dropdown */}
        <select
          value={selectedReadiness}
          onChange={(e) => setSelectedReadiness(e.target.value)}
          className="px-4 py-2 rounded-xl bg-card border border-border/60 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {readinessOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                activeFilter === filter
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full rounded-2xl border border-border/50 p-8 text-center text-sm text-muted-foreground">
            Loading companies...
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="glass rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                    {company.logo}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {company.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {company.industry}
                    </p>
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

              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/consultant/${consultantId}/company/${company.id}?index=${selectedReadiness}`}
                    className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors text-center"
                  >
                    View Details
                  </Link>
                  {company.status === "evaluated" && (
                    <Link
                      href={`/admin/consultant/${consultantId}/company/${company.id}/review?index=${selectedReadiness}`}
                      className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors text-center"
                    >
                      Review
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && filteredCompanies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            No companies found
          </p>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}
