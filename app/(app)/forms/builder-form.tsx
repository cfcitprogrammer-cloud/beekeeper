"use client"

import * as React from "react"

import { Field } from "@/components/form-field"
import { FormError, FormSuccess } from "@/components/form-message"
import { SubmitButton } from "@/components/submit-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createFormDefinition, type FormBuilderState } from "./actions"

const initialState: FormBuilderState = { status: "idle" }

type DraftField = {
  key: string
  label: string
  field_type: string
  is_required: boolean
  options: string
}

const FIELD_TYPES = ["text", "textarea", "number", "date", "boolean", "select", "photo", "signature", "gps"]

export function FormBuilder() {
  const [state, formAction] = React.useActionState(createFormDefinition, initialState)
  const [fields, setFields] = React.useState<DraftField[]>([
    { key: "outlet_name", label: "Outlet name", field_type: "text", is_required: true, options: "" },
  ])

  function update(index: number, patch: Partial<DraftField>) {
    setFields((current) => current.map((field, position) => (position === index ? { ...field, ...patch } : field)))
  }

  const serialized = JSON.stringify(
    fields.map((field) => ({
      key: field.key,
      label: field.label,
      field_type: field.field_type,
      is_required: field.is_required,
      options: field.field_type === "select"
        ? field.options.split(",").map((value) => value.trim()).filter(Boolean)
        : [],
    })),
  )

  return (
    <form action={formAction} noValidate className="grid max-w-3xl gap-4">
      <input type="hidden" name="fields" value={serialized} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Form name">
          <Input id="name" name="name" placeholder="Shelf audit" required />
        </Field>
        <Field id="form_type" label="Form type" hint="e.g. audit, survey, checklist">
          <Input id="form_type" name="form_type" placeholder="audit" />
        </Field>
      </div>

      <fieldset className="border p-3">
        <legend className="px-1 text-xs font-medium">Fields</legend>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_7rem_auto] sm:items-end">
              <Field id={`key-${index}`} label="Key">
                <Input
                  id={`key-${index}`}
                  value={field.key}
                  onChange={(event) => update(index, { key: event.target.value })}
                  className="font-mono text-[11px]"
                />
              </Field>
              <Field id={`label-${index}`} label="Label">
                <Input
                  id={`label-${index}`}
                  value={field.label}
                  onChange={(event) => update(index, { label: event.target.value })}
                />
              </Field>
              <Field id={`type-${index}`} label="Type">
                <select
                  id={`type-${index}`}
                  value={field.field_type}
                  onChange={(event) => update(index, { field_type: event.target.value })}
                  className="h-8 w-full rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="flex h-8 items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={field.is_required}
                  onChange={(event) => update(index, { is_required: event.target.checked })}
                  className="size-3.5 accent-[var(--primary)]"
                />
                Required
              </label>
              {field.field_type === "select" ? (
                <Field
                  id={`options-${index}`}
                  label="Options"
                  hint="Comma separated"
                  className="sm:col-span-4"
                >
                  <Input
                    id={`options-${index}`}
                    value={field.options}
                    onChange={(event) => update(index, { options: event.target.value })}
                    placeholder="Pass, Fail, N/A"
                  />
                </Field>
              ) : null}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="mt-3"
          onClick={() =>
            setFields((current) => [
              ...current,
              {
                key: `field_${current.length + 1}`,
                label: `Field ${current.length + 1}`,
                field_type: "text",
                is_required: false,
                options: "",
              },
            ])
          }
        >
          Add field
        </Button>
      </fieldset>

      {state.status === "error" && state.message ? <FormError message={state.message} /> : null}
      {state.status === "success" && state.message ? <FormSuccess message={state.message} /> : null}

      <SubmitButton className="w-fit" pendingLabel="Saving form">
        Save form
      </SubmitButton>
    </form>
  )
}
