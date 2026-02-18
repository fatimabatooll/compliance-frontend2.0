import { apiService } from "@/services/apiService"

export type Consultant = {
  id: string
  name: string
  email: string
  createdAt: string
  companiesCount: number
}

type CreateConsultantInput = {
  userName: string
  email: string
  password: string
  confirmPassword: string
}

type ApiPayload = {
  id?: string
  _id?: string
  userName?: string
  name?: string
  email?: string
  createdAt?: string
  companiesCount?: number
  companyCount?: number
  companies?: unknown[]
}

type ApiResponse<T> = {
  data?: T | { data?: T }
  message?: string
}

const toConsultant = (raw: ApiPayload): Consultant => {
  const companiesLength = Array.isArray(raw.companies) ? raw.companies.length : 0

  return {
    id: raw.id || raw._id || "",
    name: raw.userName || raw.name || "Unknown",
    email: raw.email || "-",
    createdAt: raw.createdAt || "",
    companiesCount:
      raw.companiesCount ?? raw.companyCount ?? companiesLength ?? 0,
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
