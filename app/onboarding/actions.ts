"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export type OnboardingField = "name" | "code" | "timezone" | "currency"

export type OnboardingState = {
  status: "idle" | "error"
  message?: string
  fieldErrors?: Partial<Record<OnboardingField, string>>
}

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{1,15}$/
const CURRENCY_PATTERN = /^[A-Z]{3}$/

function fieldError(field: OnboardingField, message: string): OnboardingState {
  return { status: "error", fieldErrors: { [field]: message } }
}

export async function createOrganization(
  _previousState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const name = String(formData.get("name") ?? "").trim()
  const code = String(formData.get("code") ?? "").trim().toUpperCase()
  const timezone = String(formData.get("timezone") ?? "").trim()
  const currency = String(formData.get("currency") ?? "").trim().toUpperCase()

  if (name.length < 2) {
    return fieldError("name", "Enter the organization's name.")
  }
  if (name.length > 80) {
    return fieldError("name", "Keep the name to 80 characters or fewer.")
  }
  if (!CODE_PATTERN.test(code)) {
    return fieldError(
      "code",
      "Use 2–16 uppercase letters, numbers or hyphens, starting with a letter or number.",
    )
  }
  if (!timezone) {
    return fieldError("timezone", "Choose a timezone.")
  }
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format()
  } catch {
    return fieldError("timezone", "Choose a valid timezone.")
  }
  if (!CURRENCY_PATTERN.test(currency)) {
    return fieldError("currency", "Choose a three-letter currency code.")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.org_id) {
    redirect("/dashboard")
  }

  const { data: organizationId, error } = await supabase.rpc("bootstrap_organization", {
    p_name: name,
    p_code: code,
    p_timezone: timezone,
    p_currency_code: currency,
  })

  if (!error && organizationId) {
    await supabase.rpc("seed_standard_roles", { p_org: organizationId })
  }

  if (error) {
    const message = error.message.toLowerCase()
    if (message.includes("already belongs")) {
      redirect("/dashboard")
    }
    if (message.includes("organizations_code_key") || message.includes("duplicate key")) {
      return fieldError("code", "That organization code is already in use.")
    }
    return {
      status: "error",
      message:
        "We couldn't create the organization. Your database may not have the latest migrations applied yet.",
    }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
