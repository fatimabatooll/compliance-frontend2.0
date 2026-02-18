import { apiService } from "@/services/apiService"

export type Domain = {
  id: string
  title: string
  dimensions: {
    id: string
    title: string
    questions?: {
      id: string
      question?: string
      text?: string
      type?: string
    }[]
  }[]
}

export type DimensionQuestion = {
  id: string
  question?: string
  text?: string
  type?: string
  maxScore?: number
  checkboxes?: { option: string; marks?: number }[]
  options?: string[]
  placeholder?: string
}

export type DimensionDetails = {
  id: string
  title: string
  questions: DimensionQuestion[]
}

export type DomainScore = {
  domainId: string
  domainScore: number
  maturityLevel?: string
  dimensionScores: {
    id?: string
    dimensionId: string
    dimensionScore: number
    maturityLevel?: string
    responses?: {
      response?: string | boolean | string[] | null
      question?: {
        id?: string
        question?: string
        text?: string
        type?: string
      }
    }[]
  }[]
}

type ResponsePayload = {
  companyId: string
  currentDomain?: string | number
  currentDimension?: string | number
  dimensionId: string
  domainId: string
  index?: string
  dimensionScoreId?: string
  responses: {
    questionId: string
    response: string | boolean
    maxScore?: number
    obtScore?: number
    type?: string
  }[]
}

type ApiResponse<T> = {
  data?: T | { data?: T }
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

class QuestionnaireService {
  async getDomains(readinessIndexType: string, token?: string | null) {
    const response = await apiService.get<ApiResponse<Domain[]> | Domain[]>(
      `/domain/${readinessIndexType}`,
      token
    )
    return extractPayload<Domain[]>(response) || []
  }

  async viewResponses(
    companyId: string,
    readinessIndexType: string,
    token?: string | null
  ) {
    try {
      const response = await apiService.get<ApiResponse<DomainScore[]> | DomainScore[]>(
        `/domain-score/${companyId}/${readinessIndexType}`,
        token
      )
      return extractPayload<DomainScore[]>(response) || []
    } catch (error: unknown) {
      const status =
        typeof error === "object" && error && "status" in error
          ? Number((error as { status?: number }).status)
          : undefined
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message?: string }).message)
          : ""

      // Backend returns 404 when questionnaire has no saved scores yet.
      if (status === 404 || message.toLowerCase().includes("scores not found")) {
        return []
      }
      throw error
    }
  }

  async getDimensionById(dimensionId: string, token?: string | null) {
    const response = await apiService.get<
      ApiResponse<DimensionDetails> | DimensionDetails
    >(`/dimension/${dimensionId}`, token)
    return extractPayload<DimensionDetails>(response)
  }

  async sendResponse(payload: ResponsePayload, token?: string | null) {
    return apiService.post("/response", payload, token)
  }

  async updateResponses(payload: ResponsePayload, token?: string | null) {
    return apiService.put("/response/update", payload, token)
  }

  async submitQuestionnaire(
    payload: { companyId: string; index: string },
    token?: string | null
  ) {
    try {
      return await apiService.put("/response/submit", payload, token)
    } catch (error: unknown) {
      const status =
        typeof error === "object" && error && "status" in error
          ? Number((error as { status?: number }).status)
          : undefined
      if (status === 404 || status === 405) {
        return apiService.post("/response/submit", payload, token)
      }
      throw error
    }
  }
}

const questionnaireService = new QuestionnaireService()
export default questionnaireService
