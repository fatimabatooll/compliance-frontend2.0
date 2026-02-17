"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"
import { Sparkles, LogOut, ChevronDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

export function AppHeader() {
  const pathname = usePathname()
  const [avatarHovered, setAvatarHovered] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3">
      <div className="mx-auto max-w-7xl">
        <div className="glass-strong rounded-2xl px-6 py-3 shadow-lg flex items-center">
          {/* Logo */}
          <Link href="/companies" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 glow-md" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground leading-none">
                GenAI
              </span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                Readiness Index
              </span>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 group"
                  onMouseEnter={() => setAvatarHovered(true)}
                  onMouseLeave={() => setAvatarHovered(false)}
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground transition-all duration-300",
                      avatarHovered && "scale-105 shadow-lg"
                    )}
                  >
                    SC
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-strong rounded-xl p-2">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">Sarah Chen</p>
                  <p className="text-xs text-muted-foreground">Consultant</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login" className="flex items-center gap-2 cursor-pointer rounded-lg">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
