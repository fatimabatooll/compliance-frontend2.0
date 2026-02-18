export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

type RequestOptions = {
  method?: HttpMethod
  body?: unknown
  token?: string | null
  headers?: Record<string, string>
}

export default class APIService {
  private baseURL: string
  private onUnauthorized?: () => void

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || ""
  }

  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler
  }

  async request<T = unknown>(path: string, options: RequestOptions = {}) {
    const { method = "GET", body, token, headers = {} } = options

    const requestHeaders: Record<string, string> = { ...headers }
    if (body !== undefined) {
      requestHeaders["Content-Type"] = "application/json"
    }
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (response.status === 401) {
      this.onUnauthorized?.()
    }

    const data = await response
      .json()
      .catch(() => ({ message: "Unexpected response from server." }))

    if (!response.ok) {
      throw data
    }

    return data as T
  }

  get<T = unknown>(path: string, token?: string | null) {
    return this.request<T>(path, { method: "GET", token })
  }

  post<T = unknown>(path: string, body?: unknown, token?: string | null) {
    return this.request<T>(path, { method: "POST", body, token })
  }

  patch<T = unknown>(path: string, body?: unknown, token?: string | null) {
    return this.request<T>(path, { method: "PATCH", body, token })
  }

  delete<T = unknown>(path: string, token?: string | null) {
    return this.request<T>(path, { method: "DELETE", token })
  }
}

export const apiService = new APIService()
