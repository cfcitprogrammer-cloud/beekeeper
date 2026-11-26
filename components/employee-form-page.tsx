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

const FORM_GROUPS: { title: string; description?: string; fields: string[] }[] = [
  {
    title: "Personal information",
    description: "Legal name and personal details.",
    fields: [
      "first_name",
      "middle_name",
      "last_name",
      "name_suffix",
      "date_of_birth",
      "sex",
      "civil_status",
      "nationality",
      "place_of_birth",
      "religion",
      "email",
      "phone",
    ],
  },
  {
    title: "Employment details",
    description: "Employment status and dates.",
    fields: [
      "employee_no",
      "hire_date",
      "regularization_date",
      "employment_type_id",
      "status",
    ],
  },
  {
    title: "Assignment & access",
    description: "Reporting line, territory and system access.",
    fields: [
      "user_id",
      "department_id",
      "position_id",
      "manager_id",
      "territory_id",
      "device_id",
      "is_field_staff",
    ],
  },
  {
    title: "Address",
    description: "Present and permanent address, each with its own location details.",
    fields: [
      "present_address",
      "present_province",
      "present_city_municipality",
      "present_barangay",
      "present_zip_code",
      "permanent_address",
      "permanent_province",
      "permanent_city_municipality",
      "permanent_barangay",
      "permanent_zip_code",
    ],
  },
  {
    title: "Government IDs",
    description: "Statutory identification numbers.",
    fields: [
      "sss_no",
      "philhealth_no",
      "pagibig_no",
      "tin",
      "umid_no",
      "passport_no",
      "drivers_license_no",
      "prc_license_no",
    ],
  },
  {
    title: "Emergency contact",
    description: "Who to contact in an emergency.",
    fields: [
      "emergency_contact_name",
      "emergency_contact_relationship",
      "emergency_contact_phone",
      "emergency_contact_address",
    ],
  },
  {
    title: "Compensation & bank",
    description: "Pay and disbursement details.",
    fields: ["basic_salary", "pay_frequency", "bank_name", "bank_account_no"],
  },
  {
    title: "Education",
    description: "Highest educational attainment.",
    fields: ["highest_education", "school_name", "course", "year_graduated"],
  },
]

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

  const sections = React.useMemo(() => {
    const byName = new Map(config.fields.map((field) => [field.name, field]))
    const assigned = new Set(FORM_GROUPS.flatMap((group) => group.fields))

    const grouped = FORM_GROUPS.map((group) => ({
      title: group.title,
      description: group.description,
      fields: group.fields.flatMap((name) => {
        const field = byName.get(name)
        return field ? [field] : []
      }),
    })).filter((group) => group.fields.length)

    const remaining = config.fields.filter((field) => !assigned.has(field.name))
    if (remaining.length) {
      grouped.push({ title: "Other", description: undefined, fields: remaining })
    }
    return grouped
  }, [config])

  React.useEffect(() => {
    const relationFields = config.fields.filter((field) => field.type === "relation")
    if (!relationFields.length) return
    startTransition(async () => {
      toast.loading("Loading form options...", { id: "employee-options" })
      const results = await Promise.all(
        relationFields.map((field) => fetchRelationOptions(config.key, field.name)),
      )
      toast.dismiss("employee-options")
      setRelationOptions(
        Object.fromEntries(
          relationFields.map((field, index) => [field.name, results[index].options ?? []]),
        ),
      )
    })
  }, [config])

  function save() {
    startTransition(async () => {
      toast.loading("Saving employee...", { id: "employee-save" })
      try {
        const result = await saveEntityAction(config.key, employeeId ?? null, values)
        toast.dismiss("employee-save")
        if (!result.ok) {
          toast.error(result.error ?? "Could not save this record.")
          setError(result.error ?? "Could not save this record.")
          return
        }
        toast.success(`${config.singular} saved.`)
        router.push("/employees?entity=employees")
        router.refresh()
      } catch (caught) {
        toast.dismiss("employee-save")
        const message =
          caught instanceof Error ? caught.message : "Could not save this record."
        toast.error(message)
        setError(message)
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

      {error ? <FormError message={error} className="mt-4" /> : null}

      <div className="mt-6 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="overflow-hidden rounded-lg border bg-card">
            <header className="border-b bg-muted/20 px-5 py-3">
              <h2 className="text-xs font-medium">{section.title}</h2>
              {section.description ? (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {section.description}
                </p>
              ) : null}
            </header>
            <div className="p-5">
              <EntityForm
                config={{ ...config, fields: section.fields }}
                values={values}
                relationOptions={relationOptions}
                relationLabels={initialRow?.__labels}
                fullPage
                onChange={(name, value) =>
                  setValues((current) => ({ ...current, [name]: value }))
                }
              />
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-2 rounded-lg border bg-card p-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button size="sm" onClick={save} disabled={pending}>
          {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
          Save
        </Button>
      </div>
    </div>
  )
}
