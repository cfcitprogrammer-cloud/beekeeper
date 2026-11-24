"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { AuthError } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"

export type AuthField = "fullName" | "email" | "password" | "confirmPassword"

export type AuthFormState = {
  status: "idle" | "error" | "success"
  message?: string
  fieldErrors?: Partial<Record<AuthField, string>>
  email?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

function fieldError(field: AuthField, message: string): AuthFormState {
  return { status: "error", fieldErrors: { [field]: message } }
}

function authErrorMessage(error: AuthError) {
  const message = error.message.toLowerCase()

  if (message.includes("invalid login credentials")) {
    return "That email and password don't match an account."
  }
  if (message.includes("email not confirmed")) {
    return "Confirm your email first. Check your inbox for the link we sent."
  }
  if (message.includes("user already registered")) {
    return "An account already exists for this email. Sign in instead."
  }
  if (message.includes("password should be") || message.includes("password is too short")) {
    return `Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (message.includes("rate limit") || message.includes("too many")) {
    return "Too many attempts. Wait a minute and try again."
  }
  if (message.includes("same password")) {
    return "Choose a password you haven't used before."
  }
  if (message.includes("invalid email") || message.includes("email address")) {
    return "That email address doesn't look right."
  }
  return "Something went wrong. Try again."
}

function safeNext(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard"
  }
  if (
    value.startsWith("/login") ||
    value.startsWith("/signup") ||
    value.startsWith("/forgot-password") ||
    value.startsWith("/auth/")
  ) {
    return "/dashboard"
  }
  return value
}

async function siteOrigin() {
  const headerStore = await headers()
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https")

  if (host) return `${protocol}://${host}`
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
}

export async function signIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const next = safeNext(formData.get("next"))

  if (!EMAIL_PATTERN.test(email)) {
    return fieldError("email", "Enter a valid email address.")
  }
  if (!password) {
    return fieldError("password", "Enter your password.")
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { status: "error", message: authErrorMessage(error), email }
  }

  if (data.user) {
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user.id)
  }

  revalidatePath("/", "layout")
  redirect(next)
}

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  if (fullName.length < 2) {
    return fieldError("fullName", "Enter your full name.")
  }
  if (!EMAIL_PATTERN.test(email)) {
    return fieldError("email", "Enter a valid email address.")
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return fieldError("password", `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
  }
  if (password.length > 72) {
    return fieldError("password", "Use 72 characters or fewer.")
  }
  if (password !== confirmPassword) {
    return fieldError("confirmPassword", "The passwords don't match.")
  }

  const origin = await siteOrigin()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  })

  if (error) {
    return { status: "error", message: authErrorMessage(error), email }
  }

  if (data.session) {
    revalidatePath("/", "layout")
    redirect("/onboarding")
  }

  return {
    status: "success",
    message: "Check your inbox to confirm your email, then create your organization.",
    email,
  }
}

export async function requestPasswordReset(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()

  if (!EMAIL_PATTERN.test(email)) {
    return fieldError("email", "Enter a valid email address.")
  }

  const origin = await siteOrigin()
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error && (error.message.toLowerCase().includes("rate limit") || error.status === 429)) {
    return {
      status: "error",
      message: "Too many reset requests. Wait a minute and try again.",
      email,
    }
  }

  // Always report success so the form cannot be used to probe for accounts.
  return {
    status: "success",
    message: `If an account exists for ${email}, a reset link is on its way.`,
    email,
  }
}

export async function updatePassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  if (password.length < MIN_PASSWORD_LENGTH) {
    return fieldError("password", `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
  }
  if (password.length > 72) {
    return fieldError("password", "Use 72 characters or fewer.")
  }
  if (password !== confirmPassword) {
    return fieldError("confirmPassword", "The passwords don't match.")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      status: "error",
      message: "This reset link has expired. Request a new one from the sign-in page.",
    }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { status: "error", message: authErrorMessage(error) }
  }

  revalidatePath("/", "layout")
  redirect("/onboarding")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
