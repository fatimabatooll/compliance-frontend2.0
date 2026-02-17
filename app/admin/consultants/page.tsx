"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Eye, Users, Briefcase, TrendingUp, Award } from "lucide-react"
import { consultants } from "@/lib/mock-data"
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
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function ConsultantsPage() {
  const [consultantsList] = useState(consultants)

  // Calculate metrics
  const totalConsultants = consultantsList.length
  const totalCompanies = consultantsList.reduce(
    (sum, c) => sum + c.companiesCount,
    0
  )
  const avgCompanies = Math.round(totalCompanies / totalConsultants)
  const maxCompanies = Math.max(...consultantsList.map((c) => c.companiesCount))

  // Chart data
  const barChartData = consultantsList.map((c) => ({
    name: c.name.split(" ")[0],
    companies: c.companiesCount,
  }))

  const pieChartData = consultantsList.map((c) => ({
    name: c.name,
    value: c.companiesCount,
  }))

  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Consultants</h1>
          <p className="text-sm text-muted-foreground">
            Manage consultants and their company assessments
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Consultant
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Consultants */}
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

        {/* Total Companies */}
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

        {/* Average Companies */}
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

        {/* Highest Workload */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
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

        {/* Pie Chart */}
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
                  <Cell key={`cell-${index}`} fill={chartColors[index]} />
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

      {/* Consultants Table */}
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
              {consultantsList.map((consultant, index) => (
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
                    {new Date(consultant.createdAt).toLocaleDateString()}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
