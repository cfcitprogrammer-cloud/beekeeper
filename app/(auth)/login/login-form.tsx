"use client"

import * as React from "react"
import Link from "next/link"

import { Field } from "@/components/form-field"
import { FormError } from "@/components/form-message"
import { PasswordInput } from "@/components/password-input"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { signIn, type AuthFormState } from "../actions"

const initialState: AuthFormState = { status: "idle" }

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = React.useActionState(signIn, initialState)

  return (
    <form action={formAction} noValidate className="grid gap-4">
      <input type="hidden" name="next" value={next ?? "/dashboard"} />

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
        error={state.fieldErrors?.password}
        action={
          <Link
            href="/forgot-password"
            className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        }
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          required
        />
      </Field>

      {state.status === "error" && state.message ? (
        <FormError message={state.message} />
      ) : null}

      <SubmitButton className="mt-1 w-full" pendingLabel="Signing in">
        Sign in
      </SubmitButton>
    </form>
  )
}
