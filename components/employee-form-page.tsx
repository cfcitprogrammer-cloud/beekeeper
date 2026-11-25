"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LoaderCircleIcon } from "lucide-react"

import { EntityForm, initialFormValues } from "@/components/entity-form"
import { FormError } from "@/components/form-message"
import { Button } from "@/components/ui/button"
import {
  fetchRelationOptions,
  saveEntityAction,
} from "@/app/(app)/entities/actions"
import type { EntityConfig, EntityRow } from "@/lib/entities/types"

export function EmployeeFormPage({
  config,
  employeeId,
  initialRow,
}: {
  config: EntityConfig
  employeeId?: string
  initialRow?: EntityRow | null
}) {
  const router = useRouter()
  const [values, setValues] = React.useState<Record<string, unknown>>(
    initialFormValues(config, initialRow ?? null),
  )
  const [relationOptions, setRelationOptions] = React.useState<
    Record<string, { value: string; label: string }[]>
  >({})
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    const relationFields = config.fields.filter((field) => field.type === "relation")
    if (!relationFields.length) return
    startTransition(async () => {
      const results = await Promise.all(
        relationFields.map((field) => fetchRelationOptions(config.key, field.name)),
      )
      setRelationOptions(
        Object.fromEntries(
          relationFields.map((field, index) => [field.name, results[index].options ?? []]),
        ),
      )
    })
  }, [config])

  function save() {
    startTransition(async () => {
      try {
        const result = await saveEntityAction(config.key, employeeId ?? null, values)
        if (!result.ok) {
          setError(result.error ?? "Could not save this record.")
          return
        }
        toast.success(`${config.singular} saved.`)
        router.push("/employees?entity=employees")
        router.refresh()
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not save this record.")
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">
            {employeeId ? `Edit ${config.singular}` : `New ${config.singular}`}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Complete the Philippine-compliant 201 file.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <div className="mt-6 border bg-card p-6">
        {error ? <FormError message={error} className="mb-4" /> : null}

        <EntityForm
          config={config}
          values={values}
          relationOptions={relationOptions}
          relationLabels={initialRow?.__labels}
          fullPage
          onChange={(name, value) =>
            setValues((current) => ({ ...current, [name]: value }))
          }
        />

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={pending}>
            {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}