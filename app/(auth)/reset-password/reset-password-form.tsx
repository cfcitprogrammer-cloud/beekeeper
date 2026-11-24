"use client"

import * as React from "react"

import { Field } from "@/components/form-field"
import { FormError } from "@/components/form-message"
import { PasswordInput } from "@/components/password-input"
import { SubmitButton } from "@/components/submit-button"
import { updatePassword, type AuthFormState } from "../actions"

const initialState: AuthFormState = { status: "idle" }

export function ResetPasswordForm() {
  const [state, formAction] = React.useActionState(updatePassword, initialState)

  return (
    <form action={formAction} noValidate className="grid gap-4">
      <Field
        id="password"
        label="New password"
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
        label="Confirm new password"
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

      <SubmitButton className="mt-1 w-full" pendingLabel="Saving password">
        Save new password
      </SubmitButton>
    </form>
  )
}
