"use client"

import * as React from "react"
import { toast } from "sonner"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"

import { searchRelationOptions } from "@/app/(app)/entities/actions"
import { Field } from "@/components/form-field"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

type Option = { value: string; label: string }

export function SearchableRelationCombobox({
  entityKey,
  fieldName,
  label,
  value,
  selectedLabel,
  disabled,
  onChange,
}: {
  entityKey: string
  fieldName: string
  label: string
  value: string
  selectedLabel?: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const id = `combobox-${fieldName}`
  const toastId = `relation-search-${entityKey}-${fieldName}`
  const [query, setQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")
  const [results, setResults] = React.useState<Option[]>([])
  const [known, setKnown] = React.useState<Option[]>(() =>
    value && selectedLabel ? [{ value, label: selectedLabel }] : []
  )

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250)
    return () => clearTimeout(timer)
  }, [query])

  React.useEffect(() => {
    let cancelled = false
    toast.loading("Searching records...", { id: toastId })

    void searchRelationOptions(entityKey, fieldName, debouncedQuery)
      .then((result) => {
        if (cancelled) return
        const options = result.options ?? []
        setResults(options)
        setKnown((current) => {
          const merged = new Map(current.map((option) => [option.value, option]))
          for (const option of options) merged.set(option.value, option)
          return [...merged.values()]
        })
        toast.dismiss(toastId)
      })
      .catch(() => {
        if (cancelled) return
        toast.error("Could not load options.", { id: toastId })
      })

    return () => {
      cancelled = true
    }
  }, [entityKey, fieldName, debouncedQuery, toastId])

  const items = React.useMemo(
    () =>
      ComboboxPrimitive.createItems(known, {
        getValue: (option: Option) => option.value,
        getLabel: (option: Option) => option.label,
      }),
    [known]
  )

  const filteredItems = results

  return (
    <Field id={id} label={label}>
      <Combobox
        items={items}
        filteredItems={filteredItems}
        value={value || null}
        onValueChange={(next) => {
          if (next && !known.some((option) => option.value === next)) {
            setKnown((current) => [...current, { value: next, label: next }])
          }
          onChange(next ?? "")
        }}
        disabled={disabled}
      >
        <ComboboxInput
          id={id}
          placeholder="Search..."
          showClear
          className="h-8 w-full text-xs"
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
        <ComboboxContent className="w-(--anchor-width)">
          <ComboboxEmpty>No matching records.</ComboboxEmpty>
          <ComboboxList>
            {(option: Option) => (
              <ComboboxItem key={option.value} value={option.value}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  )
}
