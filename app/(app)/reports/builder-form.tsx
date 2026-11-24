"use client"

import * as React from "react"

import { Field } from "@/components/form-field"
import { FormError, FormSuccess } from "@/components/form-message"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { REPORT_VIEWS } from "@/lib/reports"
import { saveReportDefinition, type ReportFormState } from "./actions"

const initialState: ReportFormState = { status: "idle" }

export function ReportBuilderForm() {
  const [state, formAction] = React.useActionState(saveReportDefinition, initialState)
  const [source, setSource] = React.useState<string>("rpt_visit_compliance")
  const columns = REPORT_VIEWS[source as keyof typeof REPORT_VIEWS] ?? []

  return (
    <form action={formAction} noValidate className="grid max-w-2xl gap-4">
      <Field id="name" label="Report name">
        <Input id="name" name="name" placeholder="Visit compliance by rep" required />
      </Field>

      <Field id="description" label="Description" hint="What question does this report answer?">
        <Textarea id="description" name="description" rows={2} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="data_source" label="Data source" hint="Curated views only; raw tables are never exposed.">
          <select
            id="data_source"
            name="data_source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="h-8 w-full rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
          >
            {Object.keys(REPORT_VIEWS).map((view) => (
              <option key={view} value={view}>
                {view}
              </option>
            ))}
          </select>
        </Field>

        <Field id="chart" label="Default chart">
          <select
            id="chart"
            name="chart"
            className="h-8 w-full rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
          >
            {["table", "bar", "line", "pie"].map((chart) => (
              <option key={chart} value={chart}>
                {chart}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset className="border p-3">
        <legend className="px-1 text-xs font-medium">Columns</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {columns.map((column) => (
            <label key={column} className="flex items-center gap-2 text-[11px]">
              <input
                type="checkbox"
                name="columns"
                value={column}
                defaultChecked
                className="size-3.5 accent-[var(--primary)]"
              />
              <span className="font-mono">{column}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.status === "error" && state.message ? <FormError message={state.message} /> : null}
      {state.status === "success" && state.message ? <FormSuccess message={state.message} /> : null}

      <SubmitButton className="w-fit" pendingLabel="Saving report">
        Save report
      </SubmitButton>
    </form>
  )
}
