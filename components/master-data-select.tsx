"use client"

import * as React from "react"
import { toast } from "sonner"

import { fetchMasterDataOptions } from "@/app/(app)/entities/actions"
import { Field } from "@/components/form-field"

type Option = { value: string; label: string }

export function MasterDataSelect({
  fieldName,
  typeCode,
  label,
  value,
  disabled,
  onChange,
}: {
  fieldName: string
  typeCode: string
  label: string
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const id = `master-${fieldName}`
  const [options, setOptions] = React.useState<Option[]>([])

  React.useEffect(() => {
    let cancelled = false
    toast.loading("Loading options...", { id: `master-data-${typeCode}` })
    void fetchMasterDataOptions(typeCode)
      .then((result) => {
        if (cancelled) return
        setOptions(result.options ?? [])
        toast.dismiss(`master-data-${typeCode}`)
      })
      .catch(() => {
        if (cancelled) return
        toast.error("Could not load options.", { id: `master-data-${typeCode}` })
      })
    return () => {
      cancelled = true
    }
  }, [typeCode])

  const missing = Boolean(value) && !options.some((option) => option.value === value)

  return (
    <Field id={id} label={label}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
      >
        <option value="">— None —</option>
        {missing ? <option value={value}>{value}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
