import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth"
import { ForgotPasswordForm } from "./forgot-password-form"

export const metadata: Metadata = { title: "Reset your password" }

export default async function ForgotPasswordPage() {
  const session = await getSession()
  if (session) redirect("/onboarding")

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-medium tracking-[-0.02em]">Reset your password</h1>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          We&apos;ll email you a link to choose a new one.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  )
}
