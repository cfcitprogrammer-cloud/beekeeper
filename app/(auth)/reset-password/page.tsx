import type { Metadata } from "next"
import Link from "next/link"
import { CircleAlertIcon } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { ResetPasswordForm } from "./reset-password-form"

export const metadata: Metadata = { title: "Choose a new password" }

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div>
        <span className="flex size-8 items-center justify-center border bg-muted/40 text-destructive">
          <CircleAlertIcon className="size-4" />
        </span>
        <h1 className="mt-4 text-xl font-medium tracking-[-0.02em]">This link has expired</h1>
        <p className="mt-1.5 max-w-[42ch] text-xs leading-relaxed text-muted-foreground">
          Password reset links can only be used once. Request a fresh link and open it in
          this browser.
        </p>
        <Link
          href="/forgot-password"
          className="mt-5 inline-flex text-xs text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-medium tracking-[-0.02em]">Choose a new password</h1>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Signing in as <span className="text-foreground">{user.email}</span>.
        </p>
      </div>

      <ResetPasswordForm />

      <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        You&apos;ll be taken back to your workspace after saving.
      </p>
    </div>
  )
}
