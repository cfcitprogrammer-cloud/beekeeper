"use client"

import * as React from "react"
import { toast } from "sonner"
import { LoaderCircleIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { EntityForm, initialFormValues } from "@/components/entity-form"
import { FormError } from "@/components/form-message"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  fetchChildRows,
  fetchRelationOptions,
  removeChildRow,
  saveChildRow,
} from "@/app/(app)/entities/actions"
import { fieldDisplayLabel } from "@/lib/entities/format"
import type { EntityConfig, EntityRow } from "@/lib/entities/types"

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export function ChildTable({
  config,
  parentField,
  parentId,
}: {
  config: EntityConfig
  parentField: string
  parentId: string
}) {
  const [rows, setRows] = React.useState<EntityRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<EntityRow | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [values, setValues] = React.useState<Record<string, unknown>>({})
  const [relationOptions, setRelationOptions] = React.useState<
    Record<string, { value: string; label: string }[]>
  >({})
  const [deleting, setDeleting] = React.useState<EntityRow | null>(null)
  const [pending, startTransition] = React.useTransition()

  const fields = config.fields.filter((field) => field.name !== parentField)
  const formConfig: EntityConfig = { ...config, fields, columns: fields.map((f) => f.name) }
  const keyFields = config.primaryKeys ?? ["id"]

  function load() {
    startTransition(async () => {
      setLoading(true)
      toast.loading("Loading rows...", { id: `child-rows-${config.key}` })
      const result = await fetchChildRows(config.key, parentField, parentId)
      toast.dismiss(`child-rows-${config.key}`)
      if (result.error) {
        toast.error(result.error)
        setError(result.error)
      } else {
        setError(null)
        setRows(result.rows)
      }
      setLoading(false)
    })
  }

  React.useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.key, parentField, parentId])

  function openForm(row: EntityRow | null) {
    setEditing(row)
    setValues(initialFormValues(formConfig, row))
    setError(null)

    const relationFields = formConfig.fields.filter((field) => field.type === "relation")
    if (relationFields.length) {
      startTransition(async () => {
        toast.loading("Loading options...", { id: `child-options-${config.key}` })
        const results = await Promise.all(
          relationFields.map((field) => fetchRelationOptions(config.key, field.name)),
        )
        toast.dismiss(`child-options-${config.key}`)
        setRelationOptions(
          Object.fromEntries(
            relationFields.map((field, index) => [field.name, results[index].options ?? []]),
          ),
        )
      })
    }
    setFormOpen(true)
  }

  function save() {
    startTransition(async () => {
      toast.loading("Saving row...", { id: `child-save-${config.key}` })
      const keys = editing
        ? Object.fromEntries(keyFields.map((name) => [name, editing[name]]))
        : {}
      const payload = { ...values, [parentField]: parentId }
      const result = await saveChildRow(config.key, payload, keys, !editing)
      toast.dismiss(`child-save-${config.key}`)
      if (!result.ok) {
        toast.error(result.error ?? "Could not save this row.")
        setError(result.error ?? "Could not save this row.")
        return
      }
      toast.success("Saved.")
      setFormOpen(false)
      load()
    })
  }

  function remove() {
    if (!deleting) return
    const keys = Object.fromEntries(keyFields.map((name) => [name, deleting[name]]))
    startTransition(async () => {
      toast.loading("Deleting row...", { id: `child-delete-${config.key}` })
      const result = await removeChildRow(config.key, keys)
      toast.dismiss(`child-delete-${config.key}`)
      if (!result.ok) {
        toast.error(result.error ?? "Could not delete this row.")
        setError(result.error ?? "Could not delete this row.")
        return
      }
      toast.success("Deleted.")
      setDeleting(null)
      load()
    })
  }

  return (
    <section className="mt-6 border bg-card">
      <header className="flex items-center justify-between gap-2 border-b p-3">
        <h2 className="text-xs font-medium">{config.title}</h2>
        <Button size="xs" onClick={() => openForm(null)}>
          <PlusIcon />
          Add {config.singular.toLowerCase()}
        </Button>
      </header>

      {error ? <FormError message={error} className="m-3" /> : null}

      {loading ? (
        <p className="p-4 text-xs text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="p-4 text-xs text-muted-foreground">No {config.title.toLowerCase()} yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                {fields.map((field) => (
                  <th
                    key={field.name}
                    className="px-3 py-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase whitespace-nowrap"
                  >
                    {fieldDisplayLabel(field) || field.name}
                  </th>
                ))}
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  {fields.map((field) => (
                    <td key={field.name} className="px-3 py-2 align-top">
                      {displayValue(row[field.name])}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openForm(row)}
                      aria-label={`Edit ${config.singular}`}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setDeleting(row)}
                      aria-label={`Delete ${config.singular}`}
                    >
                      <Trash2Icon />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={formOpen} onOpenChange={setFormOpen}>
        <DrawerContent className="gap-4 p-4 sm:max-w-xl">
          <DrawerHeader className="p-0">
            <DrawerTitle>
              {editing ? `Edit ${config.singular}` : `New ${config.singular}`}
            </DrawerTitle>
            <DrawerDescription>Record belongs to this parent.</DrawerDescription>
          </DrawerHeader>
          {error ? <FormError message={error} /> : null}
          <EntityForm
            config={formConfig}
            values={values}
            relationOptions={relationOptions}
            fullPage
            onChange={(name, value) =>
              setValues((current) => ({ ...current, [name]: value }))
            }
          />
          <DrawerFooter>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={pending}>
              {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DrawerContent className="gap-4 p-4 sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>Delete this {config.singular.toLowerCase()}?</DrawerTitle>
            <DrawerDescription>This cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={remove} disabled={pending}>
              Delete
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </section>
  )
}