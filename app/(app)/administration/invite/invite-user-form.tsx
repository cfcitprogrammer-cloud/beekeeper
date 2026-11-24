"use client"

import * as React from "react"

import { Field } from "@/components/form-field"
import { FormError, FormSuccess } from "@/components/form-message"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { inviteUser, type AdminActionState } from "../actions"

const initialState: AdminActionState = { status: "idle" }

export function InviteUserForm({ roles }: { roles: { value: string; label: string }[] }) {
  const [state, formAction] = React.useActionState(inviteUser, initialState)

  return (
    <form action={formAction} noValidate className="grid max-w-md gap-4">
      <Field id="fullName" label="Full name">
        <Input id="fullName" name="fullName" autoComplete="name" placeholder="Amara Okafor" required />
      </Field>

      <Field id="email" label="Work email">
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          placeholder="amara@company.com"
          required
        />
      </Field>

      <Field id="roleId" label="Role" hint="You can change the role after they accept.">
        <select
          id="roleId"
          name="roleId"
          className="h-8 w-full rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
        >
          <option value="">No role yet</option>
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </Field>

      {state.status === "error" && state.message ? (
        <FormError message={state.message} />
      ) : null}
      {state.status === "success" && state.message ? (
        <FormSuccess message={state.message} />
      ) : null}

      <SubmitButton className="w-fit" pendingLabel="Sending invitation">
        Send invitation
      </SubmitButton>
    </form>
  )
}
