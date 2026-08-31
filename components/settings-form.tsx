"use client"

import { useState, type FormEvent } from "react"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import authService from "@/services/authService"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ProfileErrors = { name?: string; email?: string; form?: string }
type PasswordErrors = { newPassword?: string; confirmPassword?: string; form?: string }

export function SettingsForm() {
  const { user, token, updateUser } = useAuth()

  // Profile info state
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({})
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState("")

  // Password state
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({})
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState("")

  if (!user) return null

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileSuccess("")

    const errors: ProfileErrors = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) errors.name = "Name is required."
    if (!trimmedEmail) {
      errors.email = "Email is required."
    } else if (!emailPattern.test(trimmedEmail)) {
      errors.email = "Enter a valid email address."
    }

    setProfileErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSavingProfile(true)
    try {
      const updated = await authService.updateProfile(
        { id: user.id, name: trimmedName, email: trimmedEmail, role: user.role },
        token
      )
      updateUser({ name: updated.name, email: updated.email })
      setProfileSuccess("Profile updated successfully.")
    } catch (error) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message?: string }).message)
          : "Unable to update profile. Please try again."
      setProfileErrors({ form: message })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordSuccess("")

    const errors: PasswordErrors = {}
    if (!newPassword) errors.newPassword = "New password is required."
    if (!confirmPassword) {
      errors.confirmPassword = "Confirm your new password."
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = "Password Mismatch"
    }

    setPasswordErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSavingPassword(true)
    try {
      await authService.changePassword({
        email: user.email,
        newPassword,
        confirmPassword,
        role: user.role,
      })
      setPasswordSuccess("Password updated successfully.")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      const message =
        typeof error === "object" && error && "message" in error
          ? String((error as { message?: string }).message)
          : "Unable to update password. Please try again."
      setPasswordErrors({ form: message })
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="glass rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Profile Information
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Update your name and email address.
        </p>

        <form onSubmit={handleProfileSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="settings-name"
              className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
            >
              Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full h-11 rounded-lg border border-border bg-card px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {profileErrors.name && (
              <p className="mt-1.5 text-xs text-destructive font-medium">
                {profileErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="settings-email"
              className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
            >
              Email
            </label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full h-11 rounded-lg border border-border bg-card px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {profileErrors.email && (
              <p className="mt-1.5 text-xs text-destructive font-medium">
                {profileErrors.email}
              </p>
            )}
          </div>

          {profileErrors.form && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {profileErrors.form}
            </p>
          )}

          {profileSuccess && (
            <p className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {profileSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={isSavingProfile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isSavingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSavingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Change Password
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Choose a new password for your account.
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="settings-new-password"
              className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="settings-new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full h-11 rounded-lg border border-border bg-card px-3.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="mt-1.5 text-xs text-destructive font-medium">
                {passwordErrors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="settings-confirm-password"
              className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="settings-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full h-11 rounded-lg border border-border bg-card px-3.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="mt-1.5 text-xs text-destructive font-medium">
                {passwordErrors.confirmPassword}
              </p>
            )}
          </div>

          {passwordErrors.form && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {passwordErrors.form}
            </p>
          )}

          {passwordSuccess && (
            <p className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {passwordSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={isSavingPassword}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isSavingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSavingPassword ? "Saving..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}