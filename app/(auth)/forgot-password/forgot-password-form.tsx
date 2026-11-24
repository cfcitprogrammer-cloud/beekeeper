"use client"

import * as React from "react"
import Link from "next/link"
import { MailCheckIcon } from "lucide-react"

import { Field } from "@/components/form-field"
import { FormError } from "@/components/form-message"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { requestPasswordReset, type AuthFormState } from "../actions"

const initialState: AuthFormState = { status: "idle" }

export function ForgotPasswordForm() {
  const [state, formAction] = React.useActionState(requestPasswordReset, initialState)

  if (state.status === "success") {
    return (
      <div className="border bg-card p-5">
        <span className="flex size-8 items-center justify-center border bg-muted/40 text-primary">
          <MailCheckIcon className="size-4" />
        </span>
        <h2 className="mt-4 text-sm font-medium">Check your inbox</h2>
        <p className="mt-1.5 max-w-[40ch] text-xs leading-relaxed text-muted-foreground">
          {state.message} The link brings you back here to choose a new password.
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
      <Field
        id="email"
        label="Work email"
        error={state.fieldErrors?.email}
        hint="Use the address on your Beekeeper account."
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          defaultValue={state.email}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : "email-hint"}
          required
        />
      </Field>

      {state.status === "error" && state.message ? (
        <FormError message={state.message} />
      ) : null}

      <SubmitButton className="mt-1 w-full" pendingLabel="Sending link">
        Send reset link
      </SubmitButton>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/login"
          className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          Return to sign in
        </Link>
        .
      </p>
    </form>
  )
}
