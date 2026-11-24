import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth"
import { SignupForm } from "./signup-form"

export const metadata: Metadata = { title: "Create an account" }

export default async function SignupPage() {
  const session = await getSession()
  if (session) redirect("/onboarding")

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-medium tracking-[-0.02em]">Create your account</h1>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          One account, then name the organization you work for.
        </p>
      </div>

      <SignupForm />

      <p className="mt-6 text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
