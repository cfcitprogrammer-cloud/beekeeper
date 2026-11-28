"use client"

import { AutocompleteField } from "@/components/autocomplete-field"
import { FileField } from "@/components/file-field"
import { Field } from "@/components/form-field"
import { MasterDataSelect } from "@/components/master-data-select"
import { MultiFileField } from "@/components/multi-file-field"
import { SearchableRelationCombobox } from "@/components/searchable-relation-combobox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { fieldDisplayLabel } from "@/lib/entities/format"
import type { EntityConfig, EntityRow, FieldDef } from "@/lib/entities/types"

export function initialFormValues(config: EntityConfig, row: EntityRow | null) {
  const values: Record<string, unknown> = {}

  for (const field of config.fields) {
    if (field.readOnly) continue
    const raw = row?.[field.name]

    if (raw !== undefined && raw !== null) {
      values[field.name] =
        (field.type === "json" || field.type === "attachments") && typeof raw === "object"
          ? JSON.stringify(raw)
          : String(raw)
      continue
    }

    if (field.type === "checkbox") values[field.name] = "false"
    else if (field.type === "select" && field.options?.length) {
      values[field.name] = field.options[0].value
    } else values[field.name] = ""
  }

  return values
}

export function EntityForm({
  config,
  values,
  onChange,
  relationOptions,
  relationLabels,
  fullPage = false,
}: {
  config: EntityConfig
  values: Record<string, unknown>
  onChange: (name: string, value: string) => void
  relationOptions: Record<string, { value: string; label: string }[]>
  /** Friendly labels for already-selected relations, even beyond the option limit. */
  relationLabels?: Record<string, string>
  /** Render without the compact scroll container used inside sheets. */
  fullPage?: boolean
}) {
  return (
    <div
      className={
        fullPage
          ? "grid gap-4 sm:grid-cols-2"
          : "grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
      }
    >
      {config.fields
        .filter((field: FieldDef) => {
          const condition = field.showWhenRelation
          if (!condition) return true
          const selected = String(values[condition.field] ?? "")
          if (!selected) return false
          const source = config.fields.find((item) => item.name === condition.field)
          const options =
            source?.type === "relation" ? (relationOptions[condition.field] ?? []) : []
          return options.find((option) => option.value === selected)?.label === condition.label
        })
        .map((field: FieldDef) => {
        if (field.readOnly) return null
        const value = String(values[field.name] ?? "")
        const describedBy = field.hint ? `${field.name}-hint` : undefined

        if (field.type === "attachments") {
          return (
            <MultiFileField
              key={field.name}
              id={field.name}
              label={fieldDisplayLabel(field)}
              hint={field.hint}
              value={value}
              bucket={field.storageBucket ?? "attachments"}
              entityKey={config.key}
              onChange={(next) => onChange(field.name, next)}
            />
          )
        }

        if (field.type === "file") {
          return (
            <FileField
              key={field.name}
              id={field.name}
              label={fieldDisplayLabel(field)}
              hint={field.hint}
              value={value}
              bucket={field.storageBucket ?? "attachments"}
              entityKey={config.key}
              onChange={(next) => onChange(field.name, next)}
            />
          )
        }

        if (field.type === "checkbox") {
          return (
            <label key={field.name} className="flex items-center gap-2 text-xs sm:col-span-2">
              <input
                type="checkbox"
                checked={value === "true"}
                onChange={(event) => onChange(field.name, String(event.target.checked))}
                className="size-3.5 accent-[var(--primary)]"
              />
              {fieldDisplayLabel(field)}
            </label>
          )
        }

        if (field.type === "textarea" || field.type === "json") {
          return (
            <Field
              key={field.name}
              id={field.name}
              label={fieldDisplayLabel(field)}
              hint={field.hint ?? (field.type === "json" ? "Enter valid JSON." : undefined)}
              className="sm:col-span-2"
            >
              <Textarea
                id={field.name}
                name={field.name}
                value={value}
                onChange={(event) => onChange(field.name, event.target.value)}
                rows={field.type === "json" ? 5 : 3}
                className="resize-y"
                placeholder={field.placeholder}
                aria-describedby={describedBy}
              />
            </Field>
          )
        }

        if (field.autocomplete) {
          return (
            <AutocompleteField
              key={field.name}
              kind={field.autocomplete}
              label={fieldDisplayLabel(field)}
              value={value}
              country={String(values.country ?? "")}
              region={String(values.region ?? "")}
              disabled={field.readOnly}
              onChange={(next) => onChange(field.name, next)}
            />
          )
        }

        if (field.masterDataType) {
          return (
            <MasterDataSelect
              key={field.name}
              fieldName={field.name}
              typeCode={field.masterDataType}
              label={fieldDisplayLabel(field)}
              value={value}
              disabled={field.readOnly}
              onChange={(next) => onChange(field.name, next)}
            />
          )
        }

        if (field.type === "relation" && field.searchable) {
          return (
            <SearchableRelationCombobox
              key={field.name}
              entityKey={config.key}
              fieldName={field.name}
              label={fieldDisplayLabel(field)}
              value={value}
              selectedLabel={relationLabels?.[field.name]}
              disabled={field.readOnly}
              onChange={(next) => onChange(field.name, next)}
            />
          )
        }

        if (field.type === "select" || field.type === "relation") {
          const options =
            field.type === "relation" ? (relationOptions[field.name] ?? []) : (field.options ?? [])
          // Keep the current relation visible when it falls outside the option limit.
          const missingSelection =
            Boolean(value) && !options.some((option) => option.value === value)

          return (
            <Field
              key={field.name}
              id={field.name}
              label={fieldDisplayLabel(field)}
              hint={field.hint}
              className={field.wide ? "sm:col-span-2" : undefined}
            >
              <select
                id={field.name}
                name={field.name}
                value={value}
                onChange={(event) => onChange(field.name, event.target.value)}
                className="h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30"
                required={field.required}
              >
                <option value="">— None —</option>
                {missingSelection ? (
                  <option value={value}>
                    {relationLabels?.[field.name] ?? "Current selection"}
                  </option>
                ) : null}
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          )
        }

        return (
          <Field
            key={field.name}
            id={field.name}
            label={fieldDisplayLabel(field)}
            hint={field.hint}
            className={field.wide ? "sm:col-span-2" : undefined}
          >
            <Input
              id={field.name}
              name={field.name}
              type={
                field.type === "number"
                  ? "number"
                  : field.type === "date"
                    ? "date"
                    : field.type === "datetime"
                      ? "datetime-local"
                      : field.type === "email"
                        ? "email"
                        : "text"
              }
              step={field.type === "number" ? "any" : undefined}
              value={value}
              onChange={(event) => onChange(field.name, event.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              aria-describedby={describedBy}
            />
          </Field>
        )
      })}
    </div>
  )
}
