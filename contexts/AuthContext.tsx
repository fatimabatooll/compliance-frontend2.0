"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { apiService } from "@/services/apiService"
import authService, { type AuthRole, type AuthUser } from "@/services/authService"

type LoginInput = {
  email: string
  password: string
  role: AuthRole
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (input: LoginInput) => Promise<void>
  logout: () => void
  updateUser: (user: Pick<AuthUser, "name" | "email">) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setToken(null)
  }, [])

  useEffect(() => {
    const session = authService.getSession()
    if (session) {
      setUser(session.user)
      setToken(session.token)
    }
    setIsInitializing(false)
  }, [])

  useEffect(() => {
    apiService.setUnauthorizedHandler(() => {
      logout()
      if (window.location.pathname !== "/login") {
        window.location.replace("/login")
      }
    })
  }, [logout])

  const login = useCallback(async (input: LoginInput) => {
    const result = await authService.login(input)
    setUser(result.user)
    setToken(result.token)
  }, [])

  const updateUser = useCallback((updated: Pick<AuthUser, "name" | "email">) => {
    setUser((current) => (current ? { ...current, ...updated } : current))
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      login,
      logout,
      updateUser,
    }),
    [user, token, isInitializing, login, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider")
  }
  return context
}