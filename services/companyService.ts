import { apiService } from "@/services/apiService"

export type CompanyStatus = "evaluated" | "in-progress" | "pending"
export type ReadinessIndexType = "genai" | "web3.0" | string

export type ConsultantCompany = {
  id: string
  name: string
  industry: string
  logo: string
  status: CompanyStatus
  readinessScore: number
  evaluationProgress?: number
  size?: string
  consultant?: string
}

export type CompanyDetails = {
  id: string
  name: string
  industry: string
  status: CompanyStatus
  readinessScore: number
  companyImage?: string
  strength?: string
  size?: string,
  personName?:string,
  designation? : string,
}

export type CreateCompanyInput = {
  companyName: string
  industry: string
  strength: string
  companyImage?: string
  personName: string
  designation: string
  email: string
  contactNumber: string
  consultantId: string
}

type ApiScore = {
  index?: string
  score?: number
  overallScore?: number
}

type ApiEvaluationDetails = {
  status?: number | string
  score?: number
  overallScore?: number
  progress?: number
  progressPercentage?: number
  completion?: number
}

type ApiCompanyPayload = {
  personName: string | undefined
  designation: string | undefined
  id?: string
  _id?: string
  name?: string
  companyName?: string
  industry?: string
  companyImage?: string
  logo?: string
  strength?: string
  size?: string
  companySize?: string
  readinessScore?: number
  overAllScore?: ApiScore[]
  isEvaluated?: boolean
  evaluationInProgress?: boolean
  evaluationDetails?: Record<string, ApiEvaluationDetails>
}

type ApiConsultantPayload = {
  id?: string
  _id?: string
  userName?: string
  name?: string
  companies?: ApiCompanyPayload[]
}

type ApiResponse<T> = {
  data?: T | { data?: T }
}

const safeNumber = (value: unknown, fallback = 0) => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

const deriveStatus = (
  raw: ApiCompanyPayload,
  readinessIndexType: ReadinessIndexType
): CompanyStatus => {
  // Some backend payloads can have stale evaluationDetails.status while isEvaluated is true.
  // In that case, trust isEvaluated to avoid showing evaluated companies as in-progress.
  if (raw.isEvaluated) return "evaluated"

  const readinessStatus = raw.evaluationDetails?.[readinessIndexType]?.status
  const fallbackStatus = raw.evaluationDetails?.genai?.status
  const currentStatus = readinessStatus ?? fallbackStatus

  if (typeof currentStatus === "number") {
    if (currentStatus === 2) return "evaluated"
    if (currentStatus === 1) return "in-progress"
    return "pending"
  }
  if (typeof currentStatus === "string") {
    if (currentStatus === "2" || currentStatus.toLowerCase() === "evaluated") {
      return "evaluated"
    }
    if (currentStatus === "1" || currentStatus.toLowerCase() === "in-progress") {
      return "in-progress"
    }
    return "pending"
  }
  if (raw.evaluationInProgress) return "in-progress"
  return "pending"
}

const deriveScore = (
  raw: ApiCompanyPayload,
  readinessIndexType: ReadinessIndexType
) => {
  const fromOverall = raw.overAllScore?.find((item) => item.index === readinessIndexType)
  const fallbackOverall = raw.overAllScore?.find((item) => item.index === "genai")
  const overall = fromOverall || fallbackOverall
  if (typeof overall?.score === "number") return overall.score
  if (typeof overall?.overallScore === "number") return overall.overallScore
  if (typeof raw.evaluationDetails?.[readinessIndexType]?.score === "number") {
    return raw.evaluationDetails[readinessIndexType].score
  }
  if (typeof raw.evaluationDetails?.[readinessIndexType]?.overallScore === "number") {
    return raw.evaluationDetails[readinessIndexType].overallScore
  }
  if (typeof raw.evaluationDetails?.genai?.score === "number") {
    return raw.evaluationDetails.genai.score
  }
  if (typeof raw.evaluationDetails?.genai?.overallScore === "number") {
    return raw.evaluationDetails.genai.overallScore
  }
  return safeNumber(raw.readinessScore)
}

const deriveProgress = (
  raw: ApiCompanyPayload,
  status: CompanyStatus,
  readinessIndexType: ReadinessIndexType
) => {
  if (status !== "in-progress") return undefined

  const current = raw.evaluationDetails?.[readinessIndexType]
  const fallback = raw.evaluationDetails?.genai

  return (
    safeNumber(current?.progress, -1) >= 0
      ? safeNumber(current?.progress)
      : safeNumber(current?.progressPercentage, -1) >= 0
        ? safeNumber(current?.progressPercentage)
        : safeNumber(current?.completion, -1) >= 0
          ? safeNumber(current?.completion)
          : safeNumber(fallback?.progress, -1) >= 0
            ? safeNumber(fallback?.progress)
            : safeNumber(fallback?.progressPercentage, -1) >= 0
              ? safeNumber(fallback?.progressPercentage)
              : safeNumber(fallback?.completion)
  )
}

const deriveLogo = (raw: ApiCompanyPayload, name: string) => {
  if (typeof raw.logo === "string" && raw.logo.trim()) return raw.logo.trim()
  if (typeof raw.companyImage === "string" && raw.companyImage.trim()) {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const toConsultantCompany = (
  raw: ApiCompanyPayload,
  readinessIndexType: ReadinessIndexType
): ConsultantCompany => {
  const status = deriveStatus(raw, readinessIndexType)
  const name = raw.companyName || raw.name || "Unknown Company"

  return {
    id: raw.id || raw._id || "",
    name,
    industry: raw.industry || "N/A",
    logo: deriveLogo(raw, name),
    status,
    readinessScore: deriveScore(raw, readinessIndexType),
    evaluationProgress: deriveProgress(raw, status, readinessIndexType),
    size: raw.size || raw.companySize,
  }
}

const toCompanyDetails = (
  raw: ApiCompanyPayload,
  readinessIndexType: ReadinessIndexType
): CompanyDetails => {
  const status = deriveStatus(raw, readinessIndexType)
  const name = raw.companyName || raw.name || "Unknown Company"

  return {
    id: raw.id || raw._id || "",
    name,
    industry: raw.industry || "N/A",
    status,
    readinessScore: deriveScore(raw, readinessIndexType),
    companyImage: raw.companyImage,
    strength: raw.strength,
    personName: raw.personName,
    designation: raw.designation,
    size: raw.size || raw.companySize,
  }
}

const extractPayload = <T>(response: ApiResponse<T> | T | undefined): T | null => {
  if (!response) return null
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in (response as ApiResponse<T>)
  ) {
    const data = (response as ApiResponse<T>).data
    if (!data) return null
    if (typeof data === "object" && data !== null && "data" in data) {
      return ((data as { data?: T }).data ?? null) as T | null
    }
    return data as T
  }
  return response as T
}

class CompanyService {
  async createCompany(data: CreateCompanyInput, token?: string | null) {
    return apiService.post("/company/create", data, token)
  }

  async getCompaniesByConsultantId(
    consultantId: string,
    token?: string | null,
    readinessIndexType: ReadinessIndexType = "genai"
  ) {
    const response = await apiService.get<ApiResponse<ApiConsultantPayload> | ApiConsultantPayload>(
      `/consultant/${consultantId}`,
      token
    )
    const payload = extractPayload<ApiConsultantPayload>(response)

    const companies = (payload?.companies || [])
      .map((company) => toConsultantCompany(company, readinessIndexType))
      .filter((company) => company.id)

    return {
      consultantName: payload?.userName || payload?.name || "Consultant",
      companies,
    }
  }

  async getCompanyById(
    companyId: string,
    token?: string | null,
    readinessIndexType: ReadinessIndexType = "genai"
  ) {
    const response = await apiService.get<ApiResponse<ApiCompanyPayload> | ApiCompanyPayload>(
      `/company/${companyId}`,
      token
    )
    const payload = extractPayload<ApiCompanyPayload>(response)
    if (!payload) return null
    return toCompanyDetails(payload, readinessIndexType)
  }
}

const companyService = new CompanyService()
export default companyService
