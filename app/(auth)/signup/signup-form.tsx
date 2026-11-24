"use client"

import * as React from "react"
import Link from "next/link"
import { MailCheckIcon } from "lucide-react"

import { Field } from "@/components/form-field"
import { FormError } from "@/components/form-message"
import { PasswordInput } from "@/components/password-input"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { signUp, type AuthFormState } from "../actions"

const initialState: AuthFormState = { status: "idle" }

export function SignupForm() {
  const [state, formAction] = React.useActionState(signUp, initialState)

  if (state.status === "success") {
    return (
      <div className="border bg-card p-5">
        <span className="flex size-8 items-center justify-center border bg-muted/40 text-primary">
          <MailCheckIcon className="size-4" />
        </span>
        <h2 className="mt-4 text-sm font-medium">Check your inbox</h2>
        <p className="mt-1.5 max-w-[40ch] text-xs leading-relaxed text-muted-foreground">
          {state.message} We sent the confirmation link to{" "}
          <span className="text-foreground">{state.email}</span>.
        </p>
        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          The link expires in 24 hours. If it doesn&apos;t arrive, check your spam folder or{" "}
          <Link
            href="/signup"
            className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            try again with the same address
          </Link>
          .
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex text-xs text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="grid gap-4">
      <Field id="fullName" label="Full name" error={state.fieldErrors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          placeholder="Amara Okafor"
          aria-invalid={Boolean(state.fieldErrors?.fullName)}
          aria-describedby={state.fieldErrors?.fullName ? "fullName-error" : undefined}
          required
        />
      </Field>

      <Field id="email" label="Work email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          defaultValue={state.email}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          required
        />
      </Field>

      <Field
        id="password"
        label="Password"
        hint="At least 8 characters."
        error={state.fieldErrors?.password}
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : "password-hint"
          }
          required
        />
      </Field>

      <Field
        id="confirmPassword"
        label="Confirm password"
        error={state.fieldErrors?.confirmPassword}
      >
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          aria-describedby={
            state.fieldErrors?.confirmPassword ? "confirmPassword-error" : undefined
          }
          required
        />
      </Field>

      {state.status === "error" && state.message ? (
        <FormError message={state.message} />
      ) : null}

      <SubmitButton className="mt-1 w-full" pendingLabel="Creating account">
        Create account
      </SubmitButton>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        You&apos;ll become the first Administrator of the organization you create next.
        Every tenant&apos;s data is isolated by row-level security.
      </p>
    </form>
  )
}
