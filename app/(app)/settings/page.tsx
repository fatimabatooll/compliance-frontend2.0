"use client"

import { SettingsForm } from "@/components/settings-form"

export default function ConsultantSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account information and password.
        </p>
      </div>
      <SettingsForm />
    </div>
  )
}