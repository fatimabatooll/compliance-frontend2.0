"use client"

import React from "react"
import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { LogOut, Moon, Settings, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function AdminHeader() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const router = useRouter()
  const { user, logout } = useAuth()

  const displayName = user?.name || "Administrator"
  const roleLabel = user?.role === "admin" ? "Admin" : "Administrator"
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-strong border-b border-border/50 mx-2 sm:mx-4 mt-3 rounded-2xl px-3 sm:px-6 py-3 shadow-lg flex flex-wrap items-center justify-between gap-y-2">
        {/* Left - Logo (click to return to dashboard) */}
        <Link href="/admin/consultants" className="flex items-center gap-3 shrink-0">
          <Image
            src={resolvedTheme === "dark" ? "/logoWhite.svg" : "/xloop-logo.png"}
            alt="xloop logo"
            width={100}
            height={30}
            className="h-auto w-20 sm:w-[100px]"
          />
        </Link>

        {/* Center - Title */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <h1 className="text-lg font-semibold text-foreground">
            Admin Dashboard
          </h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {initials}
                </div>
                <span className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium text-foreground">
                    {displayName}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {roleLabel}
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem disabled>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-semibold">{displayName}</span>
                  <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {roleLabel}
                  </span>
                  <span
                    className="block max-w-full truncate text-xs text-muted-foreground"
                    title={user?.email || "admin@sidathyder.com"}
                  >
                    {user?.email || "admin@sidathyder.com"}
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout()
                  router.replace("/login")
                }}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, isInitializing } = useAuth()

  useEffect(() => {
    if (isInitializing) return
    if (!isAuthenticated) {
      router.replace("/login")
      return
    }
    if (user?.role !== "admin") {
      router.replace("/companies")
    }
  }, [isInitializing, isAuthenticated, user, router])

  if (isInitializing || !isAuthenticated || user?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="pb-12 px-4 pt-24">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}