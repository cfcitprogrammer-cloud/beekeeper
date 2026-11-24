import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { FormError } from "@/components/form-message"
import { getSession } from "@/lib/auth"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const session = await getSession()
  if (session) redirect("/onboarding")

  const params = await searchParams

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-medium tracking-[-0.02em]">Sign in</h1>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Open your organization&apos;s workspace.
        </p>
      </div>

      {params.error ? <FormError message={params.error} className="mb-4" /> : null}

      <LoginForm next={params.next} />

      <p className="mt-6 text-xs text-muted-foreground">
        New to Beekeeper?{" "}
        <Link
          href="/signup"
          className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          Create an organization
        </Link>
      </p>
    </div>
  )
}
