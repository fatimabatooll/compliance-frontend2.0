"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { Plus, Eye, Users, Briefcase, TrendingUp, Award } from "lucide-react"
import consultantService, { type Consultant } from "@/services/consultantService"
import { useAuth } from "@/hooks/useAuth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type AddConsultantForm = {
  userName: string
  email: string
  password: string
  confirmPassword: string
}

const initialForm: AddConsultantForm = {
  userName: "",
  email: "",
  password: "",
  confirmPassword: "",
}

export default function ConsultantsPage() {
  const { token } = useAuth()
  const [consultantsList, setConsultantsList] = useState<Consultant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<AddConsultantForm>(initialForm)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchConsultants = useCallback(async () => {
    if (!token) return

    try {
      setIsLoading(true)
      setErrorMessage("")
      const data = await consultantService.getAllConsultants(token)
      setConsultantsList(data)
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to load consultants."
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchConsultants()
  }, [fetchConsultants])

  const totalConsultants = consultantsList.length
  const totalCompanies = consultantsList.reduce(
    (sum, c) => sum + c.companiesCount,
    0
  )
  const avgCompanies = totalConsultants
    ? Math.round(totalCompanies / totalConsultants)
    : 0
  const maxCompanies = totalConsultants
    ? Math.max(...consultantsList.map((c) => c.companiesCount))
    : 0

  const barChartData = useMemo(
    () =>
      consultantsList.map((c) => ({
        name: c.name.split(" ")[0],
        companies: c.companiesCount,
      })),
    [consultantsList]
  )

  const pieChartData = useMemo(
    () =>
      consultantsList.map((c) => ({
        name: c.name,
        value: c.companiesCount,
      })),
    [consultantsList]
  )

  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  const resetForm = () => {
    setFormData(initialForm)
    setFormError("")
  }

  const handleOpenModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleAddConsultant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) return

    if (!formData.userName || !formData.email || !formData.password) {
      setFormError("Please fill in all required fields.")
      return
    }
    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters.")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError("Password and confirm password do not match.")
      return
    }

    try {
      setIsSubmitting(true)
      setFormError("")
      await consultantService.createConsultant(formData, token)
      await fetchConsultants()
      handleCloseModal()
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to add consultant."
      setFormError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Consultants</h1>
          <p className="text-sm text-muted-foreground">
            Manage consultants and their company assessments
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Consultant
        </button>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
          <h3 className="text-sm text-muted-foreground mb-1">Total Consultants</h3>
          <p className="text-2xl font-bold text-foreground">{totalConsultants}</p>
          <p className="text-xs text-muted-foreground mt-2">Active consultants</p>
        </div>

        <div className="glass rounded-2xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-accent" />
            </div>
          </div>
          <h3 className="text-sm text-muted-foreground mb-1">Total Companies</h3>
          <p className="text-2xl font-bold text-foreground">{totalCompanies}</p>
          <p className="text-xs text-muted-foreground mt-2">Under assessment</p>
        </div>

        <div className="glass rounded-2xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-chart-3/15 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" style={{ color: "hsl(var(--chart-3))" }} />
            </div>
          </div>
          <h3 className="text-sm text-muted-foreground mb-1">Average per Consultant</h3>
          <p className="text-2xl font-bold text-foreground">{avgCompanies}</p>
          <p className="text-xs text-muted-foreground mt-2">Companies assigned</p>
        </div>

        <div className="glass rounded-2xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-lg bg-chart-4/15 flex items-center justify-center">
              <Award className="h-5 w-5" style={{ color: "hsl(var(--chart-4))" }} />
            </div>
          </div>
          <h3 className="text-sm text-muted-foreground mb-1">Highest Workload</h3>
          <p className="text-2xl font-bold text-foreground">{maxCompanies}</p>
          <p className="text-xs text-muted-foreground mt-2">Companies assigned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Companies per Consultant
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar
                dataKey="companies"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Workload Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name.split(" ")[0]}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Created at
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                  Companies
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-sm text-muted-foreground"
                  >
                    Loading consultants...
                  </td>
                </tr>
              ) : consultantsList.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-sm text-muted-foreground"
                  >
                    No consultants found.
                  </td>
                </tr>
              ) : (
                consultantsList.map((consultant, index) => (
                  <tr
                    key={consultant.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-foreground">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {consultant.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {consultant.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {consultant.createdAt
                        ? new Date(consultant.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                        {consultant.companiesCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/admin/consultant/${consultant.id}/companies`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Consultant</DialogTitle>
            <DialogDescription>
              Enter consultant credentials and contact details to provision access.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddConsultant} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="userName">Name</Label>
              <Input
                id="userName"
                value={formData.userName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, userName: e.target.value }))
                }
                placeholder="Consultant name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="consultant@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Minimum 8 characters"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Retype password"
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive font-medium">{formError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Adding..." : "Add Consultant"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
