"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

type Role = "admin" | "consultant"

function MeshBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient mesh */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, hsl(200 100% 50% / 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, hsl(165 80% 45% / 0.12) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, hsl(200 100% 50% / 0.1) 0%, transparent 50%)",
        }}
      />
      {/* Floating orbs */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
      <div
        className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-accent/8 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 right-1/6 w-48 h-48 rounded-full bg-primary/5 blur-2xl animate-pulse-glow"
        style={{ animationDelay: "0.5s" }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("consultant")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { login, isAuthenticated, isInitializing, user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isInitializing || !isAuthenticated || !user) return
    router.replace(user.role === "admin" ? "/admin/consultants" : "/companies")
  }, [isInitializing, isAuthenticated, user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setIsLoading(true)
    try {
      await login({ email, password, role })
      router.replace(role === "admin" ? "/admin/consultants" : "/companies")
    } catch (error: any) {
      setErrorMessage(
        error?.message || error?.error || "Incorrect email or password."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Login Form (narrower) */}
      <div className="relative z-10 w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-center px-8 md:px-16">
        <div
          className={`max-w-sm mx-auto w-full transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-none">
                GenAI Readiness
              </h1>
              <p className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                Index Platform
              </p>
            </div>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in to continue assessing organizational AI readiness
            </p>
          </div>

          {/* Role Selector - Segmented Control */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Role
            </label>
            <div className="relative flex bg-secondary rounded-xl p-1">
              <div
                className="absolute top-1 bottom-1 rounded-lg bg-card shadow-md transition-all duration-300 ease-out glow-sm"
                style={{
                  left: role === "admin" ? "4px" : "50%",
                  right: role === "consultant" ? "4px" : "50%",
                }}
              />
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  role === "admin"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRole("consultant")}
                className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  role === "consultant"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Consultant
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "admin"
                    ? "admin@genai-index.com"
                    : "consultant@genai-index.com"
                }
                className="w-full h-11 px-4 rounded-xl bg-secondary/70 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 px-4 pr-11 rounded-xl bg-secondary/70 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-11 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 group overflow-hidden"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Sign in as {role === "admin" ? "Admin" : "Consultant"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
              <div className="absolute inset-0 bg-foreground/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </button>
            {errorMessage && (
              <p className="text-xs text-destructive font-medium text-center">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Right side - Abstract AI Canvas */}
      <div className="hidden lg:flex flex-1 relative bg-card overflow-hidden rounded-l-3xl">
        <MeshBackground />
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16">
          <div
            className={`text-center transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs font-medium text-primary">
                AI-Powered Assessment
              </span>
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-foreground mb-4 leading-tight text-balance">
              Measure Your
              <br />
              <span className="gradient-text">AI Readiness</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Comprehensive assessment framework for evaluating organizational
              readiness for Generative AI adoption
            </p>
          </div>

          {/* Floating stat cards */}
          <div
            className={`mt-12 flex gap-4 transition-all duration-1000 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {[
              { label: "Companies Assessed", value: "200+" },
              { label: "Avg Score Lift", value: "+34%" },
              { label: "Dimensions", value: "6" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-xl px-5 py-4 text-center min-w-[120px]"
              >
                <p className="text-xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
