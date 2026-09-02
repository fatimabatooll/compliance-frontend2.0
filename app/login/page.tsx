"use client";

import React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Sparkles, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import authService from "@/services/authService";

type Role = "admin" | "consultant";
type AuthMode = "login" | "forgotPassword";

type LoginErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRequirements: {
  label: string;
  test: (value: string) => boolean;
}[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
  {
    label: "One special character",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

const getPasswordStrengthError = (password: string): string | null => {
  const unmet = passwordRequirements.filter((rule) => !rule.test(password));
  if (unmet.length === 0) return null;
  return `Password must have ${passwordRequirements
    .map((rule) => rule.label.toLowerCase())
    .join(", ")}.`;
};

const validateLoginForm = (email: string, password: string): LoginErrors => {
  const errors: LoginErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(trimmedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
};

const validateForgetPasswordForm = (
  email: string,
  newPassword: string,
  confirmPassword: string,
): LoginErrors => {
  const errors: LoginErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(trimmedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!newPassword) {
    errors.password = "New password is required.";
  } else {
    const strengthError = getPasswordStrengthError(newPassword);
    if (strengthError) {
      errors.password = strengthError;
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your new password.";
  } else if (newPassword && confirmPassword !== newPassword) {
    errors.confirmPassword = "Password Mismatch";
  }

  return errors;
};

const getLoginErrorsFromServer = (
  error: unknown,
  selectedRole: Role,
): LoginErrors => {
  const message =
    typeof error === "object" && error
      ? "message" in error && error.message
        ? String(error.message)
        : "error" in error && error.error
          ? String(error.error)
          : ""
      : "";

  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("password") &&
    !normalizedMessage.includes("email")
  ) {
    return { password: message };
  }

  if (
    normalizedMessage.includes("email") ||
    normalizedMessage.includes("user") ||
    normalizedMessage.includes("account") ||
    normalizedMessage.includes("not found")
  ) {
    return { email: message };
  }

  if (
    normalizedMessage.includes("invalid") ||
    normalizedMessage.includes("incorrect")
  ) {
    const roleLabel = selectedRole === "admin" ? "an Admin" : "a Consultant";

    return {
      email: `You are not registered as ${roleLabel}.`,
      password: "Check that the password is correct.",
    };
  }

  return { form: message || "Unable to sign in. Please try again." };
};

const getForgetPasswordErrorsFromServer = (error: unknown): LoginErrors => {
  const message =
    typeof error === "object" && error
      ? "message" in error && error.message
        ? String(error.message)
        : "error" in error && error.error
          ? String(error.error)
          : ""
      : "";

  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("mismatch")) {
    return { confirmPassword: message };
  }

  if (
    normalizedMessage.includes("email") ||
    normalizedMessage.includes("registered")
  ) {
    return { email: message };
  }

  if (normalizedMessage.includes("password")) {
    return { password: message };
  }

  return { form: message || "Unable to update password. Please try again." };
};

function MeshBackground() {
  return (
    <div className='absolute inset-0 overflow-hidden'>
      {/* Animated gradient mesh */}
      <div
        className='absolute inset-0'
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, hsl(200 100% 50% / 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, hsl(165 80% 45% / 0.12) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, hsl(200 100% 50% / 0.1) 0%, transparent 50%)",
        }}
      />
      {/* Floating orbs */}
      <div className='absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse-glow' />
      <div
        className='absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-accent/8 blur-3xl animate-pulse-glow'
        style={{ animationDelay: "1s" }}
      />
      <div
        className='absolute top-1/2 right-1/6 w-48 h-48 rounded-full bg-primary/5 blur-2xl animate-pulse-glow'
        style={{ animationDelay: "0.5s" }}
      />
      {/* Grid pattern */}
      <div
        className='absolute inset-0 opacity-[0.03]'
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<Role>("consultant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const { login, isAuthenticated, isInitializing, user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isInitializing || !isAuthenticated || !user) return;
    router.replace(user.role === "admin" ? "/admin/consultants" : "/companies");
  }, [isInitializing, isAuthenticated, user, router]);

  const handleModeChange = (nextMode: AuthMode) => {
    setAuthMode(nextMode);
    setErrors({});
    setSuccessMessage("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === "forgotPassword") {
      await handleForgetPassword();
      return;
    }

    const validationErrors = validateLoginForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password, role });
      router.replace(role === "admin" ? "/admin/consultants" : "/companies");
    } catch (error: unknown) {
      setErrors(getLoginErrorsFromServer(error, role));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgetPassword = async () => {
    const validationErrors = validateForgetPasswordForm(
      email,
      password,
      confirmPassword,
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage("");
      return;
    }

    setErrors({});
    setSuccessMessage("");
    setIsLoading(true);
    try {
      const response = await authService.forgetPassword({
        email: email.trim(),
        newPassword: password,
        confirmPassword,
        role,
      });
      setSuccessMessage(response?.message || "Password has been updated.");
      setAuthMode("login");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error: unknown) {
      setErrors(getForgetPasswordErrorsFromServer(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex bg-background'>
      {/* Left side - Login Form */}
      <div className='relative z-10 w-full lg:w-[540px] xl:w-[600px] flex flex-col justify-center px-8 md:px-14 xl:px-20 py-10'>
        <div
          className={`max-w-md mx-auto w-full transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Logo */}
          <div className='flex items-center gap-3.5 mb-14'>
            <div className='h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg'>
              <Sparkles className='h-6 w-6 text-primary-foreground' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-foreground leading-none'>
                GenAI Readiness
              </h1>
              <p className='text-[11px] font-medium text-muted-foreground tracking-widest uppercase mt-1'>
                Index Platform
              </p>
            </div>
          </div>

          {/* Welcome text */}
          <div className='mb-9'>
            <h2 className='text-3xl font-bold text-foreground mb-3'>
              {authMode === "login" ? "Welcome back" : "Reset password"}
            </h2>
            <p className='text-base text-muted-foreground leading-relaxed'>
              {authMode === "login"
                ? "Sign in to continue assessing organizational AI readiness"
                : "Choose your role and create a new account password"}
            </p>
          </div>

          {/* Role Selector - Segmented Control */}
          <div className='mb-7'>
            <label className='block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3.5'>
              Role
            </label>
            <div className='relative flex bg-secondary rounded-xl p-1'>
              <div
                className='absolute top-1 bottom-1 rounded-lg bg-card shadow-md transition-all duration-300 ease-out glow-sm'
                style={{
                  left: role === "admin" ? "4px" : "50%",
                  right: role === "consultant" ? "4px" : "50%",
                }}
              />
              <button
                type='button'
                onClick={() => {
                  setRole("admin");
                  setErrors({});
                  setSuccessMessage("");
                }}
                className={`relative z-10 flex-1 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  role === "admin"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </button>
              <button
                type='button'
                onClick={() => {
                  setRole("consultant");
                  setErrors({});
                  setSuccessMessage("");
                }}
                className={`relative z-10 flex-1 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
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
          <form onSubmit={handleLogin} className='space-y-6' noValidate>
            <div>
              <label
                htmlFor='email'
                className='block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5'
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((current) => ({ ...current, email: undefined }));
                  setSuccessMessage("");
                }}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                placeholder={
                  role === "admin"
                    ? "admin@genai-index.com"
                    : "consultant@genai-index.com"
                }
                className={`w-full h-12 px-4 rounded-xl bg-secondary/70 border text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.email
                    ? "border-destructive/70 focus:ring-destructive/25 focus:border-destructive"
                    : "border-border/60 focus:ring-primary/30 focus:border-primary/50"
                }`}
              />
              {errors.email && (
                <p
                  id='email-error'
                  className='mt-2 text-xs text-destructive font-medium'
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5'
              >
                {authMode === "login" ? "Password" : "New Password"}
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((current) => ({
                      ...current,
                      password: undefined,
                    }));
                    setSuccessMessage("");
                  }}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  placeholder={
                    authMode === "login"
                      ? "Enter your password"
                      : "Enter your new password"
                  }
                  className={`w-full h-12 px-4 pr-12 rounded-xl bg-secondary/70 border text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? "border-destructive/70 focus:ring-destructive/25 focus:border-destructive"
                      : "border-border/60 focus:ring-primary/30 focus:border-primary/50"
                  }`}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id='password-error'
                  className='mt-2 text-xs text-destructive font-medium'
                >
                  {errors.password}
                </p>
              )}
              {authMode === "forgotPassword" && (
                <ul className='mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2'>
                  {passwordRequirements.map((rule) => {
                    const met = rule.test(password);
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          met ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {met ? (
                          <Check className='h-3.5 w-3.5 shrink-0' />
                        ) : (
                          <X className='h-3.5 w-3.5 shrink-0' />
                        )}
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {authMode === "forgotPassword" && (
              <div>
                <label
                  htmlFor='confirm-password'
                  className='block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5'
                >
                  Confirm Password
                </label>
                <div className='relative'>
                  <input
                    id='confirm-password'
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((current) => ({
                        ...current,
                        confirmPassword: undefined,
                      }));
                      setSuccessMessage("");
                    }}
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirm-password-error"
                        : undefined
                    }
                    placeholder='Confirm your new password'
                    className={`w-full h-12 px-4 pr-12 rounded-xl bg-secondary/70 border text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.confirmPassword
                        ? "border-destructive/70 focus:ring-destructive/25 focus:border-destructive"
                        : "border-border/60 focus:ring-primary/30 focus:border-primary/50"
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p
                    id='confirm-password-error'
                    className='mt-2 text-xs text-destructive font-medium'
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <button
              type='submit'
              disabled={isLoading}
              className='relative w-full h-12 rounded-xl gradient-primary text-primary-foreground text-base font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 group overflow-hidden'
            >
              {isLoading ? (
                <div className='h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin' />
              ) : authMode === "forgotPassword" ? (
                <>
                  Update {role === "admin" ? "Admin" : "Consultant"} Password
                  <ArrowRight className='h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5' />
                </>
              ) : (
                <>
                  Sign in as {role === "admin" ? "Admin" : "Consultant"}
                  <ArrowRight className='h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5' />
                </>
              )}
              <div className='absolute inset-0 bg-foreground/5 opacity-0 hover:opacity-100 transition-opacity duration-300' />
            </button>
            {errors.form && (
              <p className='text-xs text-destructive font-medium text-center'>
                {errors.form}
              </p>
            )}
            {successMessage && (
              <p className='text-xs text-primary font-medium text-center'>
                {successMessage}
              </p>
            )}
            <button
              type='button'
              onClick={() =>
                handleModeChange(
                  authMode === "login" ? "forgotPassword" : "login",
                )
              }
              className='w-full text-sm font-medium text-primary hover:text-primary/80 transition-colors'
            >
              {authMode === "login" ? "Forgot password?" : "Back to sign in"}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Abstract AI Canvas */}
      <div className='hidden lg:flex flex-1 relative bg-card overflow-hidden rounded-l-3xl'>
        <MeshBackground />
        {/* Content overlay */}
        <div className='relative z-10 flex flex-col items-center justify-center w-full px-16 xl:px-24'>
          <div
            className={`text-center transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-9'>
              <div className='h-2 w-2 rounded-full bg-primary animate-pulse-glow' />
              <span className='text-sm font-medium text-primary'>
                AI-Powered Assessment
              </span>
            </div>
            <h2 className='text-5xl xl:text-6xl font-bold text-foreground mb-5 leading-tight text-balance'>
              Measure Your
              <br />
              <span className='gradient-text'>AI Readiness</span>
            </h2>
            <p className='text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed'>
              Comprehensive assessment framework for evaluating organizational
              readiness for Generative AI adoption
            </p>
          </div>

          {/* Floating stat cards */}
          <div
            className={`mt-14 flex gap-5 transition-all duration-1000 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {[
              { label: "Companies Assessed", value: "20+" },
              { label: "Avg Score Lift", value: "+34%" },
              { label: "Dimensions", value: "8" },
            ].map((stat) => (
              <div
                key={stat.label}
                className='glass rounded-xl px-6 py-5 text-center min-w-[140px]'
              >
                <p className='text-2xl font-bold text-foreground'>
                  {stat.value}
                </p>
                <p className='text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1'>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
