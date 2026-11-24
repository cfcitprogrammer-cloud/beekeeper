"use client"

import * as React from "react"

import { Field } from "@/components/form-field"
import { FormError } from "@/components/form-message"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { createOrganization, type OnboardingState } from "./actions"

const initialState: OnboardingState = { status: "idle" }

function deriveCode(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 16)
    .replace(/-+$/g, "")
}

export function OnboardingForm({
  timezones,
  currencies,
}: {
  timezones: { region: string; zones: string[] }[]
  currencies: { code: string; label: string }[]
}) {
  const [state, formAction] = React.useActionState(createOrganization, initialState)
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [codeEdited, setCodeEdited] = React.useState(false)
  const [selectedTimezone, setSelectedTimezone] = React.useState<string | null>(null)

  const detectedTimezone = React.useSyncExternalStore(
    () => () => {},
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => "UTC",
  )
  const timezoneIsKnown = timezones.some((group) =>
    group.zones.includes(detectedTimezone),
  )
  const timezone = selectedTimezone ?? (timezoneIsKnown ? detectedTimezone : "UTC")

  function onNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setName(value)
    if (!codeEdited) setCode(deriveCode(value))
  }

  function onCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "")
    setCode(value)
    setCodeEdited(true)
  }

  return (
    <form action={formAction} noValidate className="grid gap-4">
      <Field id="name" label="Organization name" error={state.fieldErrors?.name}>
        <Input
          id="name"
          name="name"
          autoComplete="organization"
          placeholder="Acme Distribution"
          value={name}
          onChange={onNameChange}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
          required
        />
      </Field>

      <Field
        id="code"
        label="Organization code"
        hint="Shown in the workspace header. 2–16 letters, numbers or hyphens."
        error={state.fieldErrors?.code}
      >
        <Input
          id="code"
          name="code"
          value={code}
          onChange={onCodeChange}
          placeholder="ACME"
          maxLength={16}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={Boolean(state.fieldErrors?.code)}
          aria-describedby={state.fieldErrors?.code ? "code-error" : "code-hint"}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="timezone" label="Timezone" error={state.fieldErrors?.timezone}>
          <select
            id="timezone"
            name="timezone"
            value={timezone}
            onChange={(event) => setSelectedTimezone(event.target.value)}
            className="h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {timezones.map((group) => (
              <optgroup key={group.region} label={group.region}>
                {group.zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone.replace(/_/g, " ")}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>

        <Field id="currency" label="Currency" error={state.fieldErrors?.currency}>
          <select
            id="currency"
            name="currency"
            defaultValue="USD"
            className="h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} — {currency.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {state.status === "error" && state.message ? (
        <FormError message={state.message} />
      ) : null}

      <SubmitButton className="mt-1 w-full" pendingLabel="Creating workspace">
        Create organization
      </SubmitButton>
    </form>
  )
}
