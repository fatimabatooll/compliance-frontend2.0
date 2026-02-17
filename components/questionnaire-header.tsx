"use client"

import { LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function QuestionnaireHeader() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-strong border-b border-border/50 mx-4 mt-3 rounded-2xl px-6 py-3 shadow-lg flex items-center justify-between">
        <div className="flex-1" />

        {/* Center - Company Name */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground">
            GenAI Readiness Assessment
          </h1>
        </div>

        {/* Right Actions */}
        <div className="flex-1 flex items-center justify-end gap-3">
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
                  SC
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  Sarah Chen
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled>
                <div className="flex flex-col">
                  <span className="font-semibold">Sarah Chen</span>
                  <span className="text-xs text-muted-foreground">
                    Consultant
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  router.push("/login")
                }}
                className="text-destructive focus:text-destructive"
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
