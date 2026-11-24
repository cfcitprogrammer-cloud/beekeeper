"use client"

import * as React from "react"

import { Field } from "@/components/form-field"
import { FormError, FormSuccess } from "@/components/form-message"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { updateOrgSettings, type AdminActionState } from "../actions"

const initialState: AdminActionState = { status: "idle" }

export function OrganizationSettingsForm({
  name,
  code,
  timezone,
  currencyCode,
  timezones,
}: {
  name: string
  code: string
  timezone: string
  currencyCode: string
  timezones: string[]
}) {
  const [state, formAction] = React.useActionState(updateOrgSettings, initialState)

  return (
    <form action={formAction} noValidate className="grid max-w-xl gap-4">
      <Field id="name" label="Organization name">
        <Input id="name" name="name" defaultValue={name} required />
      </Field>

      <Field id="code" label="Organization code" hint="Identifies your tenant in paths and exports.">
        <Input id="code" value={code} readOnly className="bg-muted/40" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="timezone" label="Timezone">
          <select
            id="timezone"
            name="timezone"
            defaultValue={timezone}
            className="h-8 w-full rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
          >
            {!timezones.includes(timezone) ? (
              <option value={timezone}>{timezone}</option>
            ) : null}
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>

        <Field id="currency_code" label="Currency">
          <Input
            id="currency_code"
            name="currency_code"
            defaultValue={currencyCode}
            maxLength={3}
            className="uppercase"
            required
          />
        </Field>
      </div>

      {state.status === "error" && state.message ? <FormError message={state.message} /> : null}
      {state.status === "success" && state.message ? <FormSuccess message={state.message} /> : null}

      <SubmitButton className="w-fit" pendingLabel="Saving settings">
        Save settings
      </SubmitButton>
    </form>
  )
}
