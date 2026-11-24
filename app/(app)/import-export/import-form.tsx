"use client"

import * as React from "react"

import { Field } from "@/components/form-field"
import { FormError, FormSuccess } from "@/components/form-message"
import { SubmitButton } from "@/components/submit-button"
import { Textarea } from "@/components/ui/textarea"
import { importCsv, type ImportState } from "./actions"

const initialState: ImportState = { status: "idle" }

export function ImportForm({
  entities,
}: {
  entities: { value: string; label: string }[]
}) {
  const [state, formAction] = React.useActionState(importCsv, initialState)

  return (
    <form action={formAction} noValidate className="grid max-w-2xl gap-4">
      <Field
        id="entity"
        label="Destination"
        hint="Headers must match the destination field names (case-insensitive)."
      >
        <select
          id="entity"
          name="entity"
          className="h-8 w-full rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
          required
        >
          <option value="">Choose a destination…</option>
          {entities.map((entity) => (
            <option key={entity.value} value={entity.value}>
              {entity.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="csv"
        label="CSV data"
        hint="First row is the header. Up to 200 rows per import. Quoted commas are supported."
      >
        <Textarea
          id="csv"
          name="csv"
          rows={12}
          className="font-mono text-[11px]"
          placeholder={'name,description\nMain Warehouse,Primary stock location'}
          required
        />
      </Field>

      {state.status === "error" && state.message ? <FormError message={state.message} /> : null}
      {state.status === "success" && state.message ? <FormSuccess message={state.message} /> : null}

      {state.errors?.length ? (
        <ul className="max-h-40 overflow-y-auto border border-destructive/30 bg-destructive/5 p-3 text-[11px] text-destructive">
          {state.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      <SubmitButton className="w-fit" pendingLabel="Importing…">
        Import rows
      </SubmitButton>
    </form>
  )
}
