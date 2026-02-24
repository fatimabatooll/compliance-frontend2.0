import { apiService } from "@/services/apiService"

export type Consultant = {
  id: string
  name: string
  email: string
  createdAt: string
  companiesCount: number
  companies: ConsultantCompanySummary[]
}

export type ConsultantCompanySummary = {
  id: string
  name: string
  isDeleted: boolean
  isEvaluated: boolean
  readinessScore: number
  domainScores: {
    index?: string
    domainName?: string
    domainScore?: number | null
    isDeleted?: boolean
  }[]
  evaluationDetails?: Record<
    string,
    {
      status?: number | string
      score?: number
      overallScore?: number
    }
  >
}

type CreateConsultantInput = {
  userName: string
  email: string
  password: string
  confirmPassword: string
}

type ApiPayload = {
  id?: string | number
  _id?: string | number
  userName?: string
  name?: string
  email?: string
  createdAt?: string
  companiesCount?: number
  companyCount?: number
  companies?: ApiCompanyPayload[]
}

type ApiCompanyPayload = {
  id?: string | number
  _id?: string | number
  companyName?: string
  name?: string
  isDeleted?: boolean
  isEvaluated?: boolean
  readinessScore?: number
  domainScores?: {
    index?: string
    domainName?: string
    domainScore?: number | null
    isDeleted?: boolean
  }[]
  evaluationDetails?: Record<
    string,
    {
      status?: number | string
      score?: number
      overallScore?: number
    }
  >
}

type ApiResponse<T> = {
  data?: T | { data?: T }
  message?: string
}

const toConsultant = (raw: ApiPayload): Consultant => {
  const companies = Array.isArray(raw.companies)
    ? raw.companies.map((company) => ({
        id: String(company.id || company._id || ""),
        name: company.companyName || company.name || "Company",
        isDeleted: Boolean(company.isDeleted),
        isEvaluated: Boolean(company.isEvaluated),
        readinessScore:
          typeof company.readinessScore === "number" ? company.readinessScore : 0,
        domainScores: Array.isArray(company.domainScores)
          ? company.domainScores.map((score) => ({
            index: score.index,
              domainName: score.domainName,
              domainScore:
                typeof score.domainScore === "number" ? score.domainScore : null,
              isDeleted: Boolean(score.isDeleted),
            }))
          : [],
        evaluationDetails: company.evaluationDetails,
      }))
    : []
  const companiesLength = companies.filter((company) => !company.isDeleted).length

  return {
    id: String(raw.id || raw._id || ""),
    name: raw.userName || raw.name || "Unknown",
    email: raw.email || "-",
    createdAt: raw.createdAt || "",
    companiesCount:
      raw.companiesCount ?? raw.companyCount ?? companiesLength ?? 0,
    companies: companies.filter((company) => company.id && !company.isDeleted),
  }
}

const extractArray = (
  response: ApiPayload[] | ApiResponse<ApiPayload[]> | undefined
) => {
  if (!response) return []
  if (Array.isArray(response)) return response
  if (Array.isArray(response.data)) return response.data
  if (response.data && "data" in response.data && Array.isArray(response.data.data)) {
    return response.data.data
  }
  return []
}

class ConsultantService {
  async createConsultant(data: CreateConsultantInput, token?: string | null) {
    return apiService.post("/consultant/create", data, token)
  }

  async getAllConsultants(token?: string | null) {
    const response = await apiService.get<ApiPayload[] | ApiResponse<ApiPayload[]>>(
      "/consultant/all",
      token
    )
    return extractArray(response).map(toConsultant).filter((item) => item.id)
  }

  async getConsultantById(consultantId: string, token?: string | null) {
    const response = await apiService.get<ApiResponse<ApiPayload> | ApiPayload>(
      `/consultant/${consultantId}`,
      token
    )
    const payload =
      "data" in (response as ApiResponse<ApiPayload>)
        ? ((response as ApiResponse<ApiPayload>).data as ApiPayload)
        : (response as ApiPayload)
    if (!payload) return null
    return toConsultant(payload)
  }
}

const consultantService = new ConsultantService()
export default consultantService
