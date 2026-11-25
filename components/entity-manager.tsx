"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import {
  FileTextIcon,
  LayersIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { EmptyState } from "@/components/empty-state"
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
import { Input } from "@/components/ui/input"
import {
  deleteEntityAction,
  fetchEntities,
  fetchRelationOptions,
  saveEntityAction,
} from "@/app/(app)/entities/actions"
import { fieldDisplayLabel } from "@/lib/entities/format"
import { childEntitiesFor } from "@/lib/entities/registry"
import type { EntityConfig, EntityRow, FieldDef } from "@/lib/entities/types"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function displayValue(value: unknown, field?: FieldDef) {
  if (value === null || value === undefined || value === "") return "—"
  if (field?.type === "checkbox") return value ? "Yes" : "No"
  if (field?.type === "select") {
    return (
      field.options?.find((option) => option.value === String(value))?.label ?? String(value)
    )
  }
  if (typeof value === "object") return JSON.stringify(value)
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleString()
  }
  return String(value)
}

export function EntityManager({
  config,
  initialRows,
  initialTotal,
  canCreate,
  canUpdate,
  canDelete,
}: {
  config: EntityConfig
  initialRows: EntityRow[]
  initialTotal: number
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}) {
  const [rows, setRows] = React.useState(initialRows)
  const [total, setTotal] = React.useState(initialTotal)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [error, setError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<EntityRow | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [values, setValues] = React.useState<Record<string, unknown>>({})
  const [relationOptions, setRelationOptions] = React.useState<
    Record<string, { value: string; label: string }[]>
  >({})
  const [deleting, setDeleting] = React.useState<EntityRow | null>(null)
  const [pending, startTransition] = React.useTransition()
  const router = useRouter()

  const statusField = config.fields.find((field) => field.name === "status")
  const childCount = childEntitiesFor(config.key).length
  const pageCount = Math.max(1, Math.ceil(total / 20))

  function refresh(nextPage = page, nextSearch = search, nextStatus = status) {
    startTransition(async () => {
      const result = await fetchEntities(config.key, nextPage, nextSearch, nextStatus)
      if (result.error) {
        setError(result.error)
        return
      }
      setError(null)
      setRows(result.rows)
      setTotal(result.total)
      setPage(nextPage)
    })
  }

  function openForm(row: EntityRow | null) {
    setEditing(row)
    setValues(initialFormValues(config, row))
    setError(null)

    const relationFields = config.fields.filter((field) => field.type === "relation")
    if (relationFields.length) {
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
    }

    setFormOpen(true)
  }

  function save() {
    startTransition(async () => {
      try {
        const result = await saveEntityAction(config.key, editing?.id ?? null, values)
        if (!result.ok) {
          setError(result.error ?? "Could not save this record.")
          return
        }
        toast.success(`${config.singular} saved.`)
        setFormOpen(false)
        refresh(page)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not save this record.")
      }
    })
  }

  function remove() {
    if (!deleting?.id) return
    startTransition(async () => {
      const result = await deleteEntityAction(config.key, String(deleting.id))
      if (!result.ok) {
        setError(result.error ?? "Could not delete this record.")
        return
      }
      toast.success(`${config.singular} deleted.`)
      setDeleting(null)
      refresh(page)
    })
  }

  return (
    <div className="border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            refresh(1, search, status)
          }}
          className="flex min-w-48 flex-1 gap-2"
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${config.title.toLowerCase()}…`}
            className="h-7 max-w-xs text-xs"
            aria-label={`Search ${config.title}`}
          />
          <Button type="submit" variant="outline" size="sm" disabled={pending}>
            Search
          </Button>
        </form>

        {statusField?.options?.length ? (
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              refresh(1, search, event.target.value)
            }}
            className="h-7 rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {statusField.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}

        <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
          {total} {total === 1 ? "record" : "records"}
        </span>

        {canCreate ? (
          <Button
            size="sm"
            onClick={() =>
              config.key === "employees"
                ? router.push("/employees/new")
                : openForm(null)
            }
          >
            <PlusIcon />
            New {config.singular.toLowerCase()}
          </Button>
        ) : null}
      </div>

      {error ? <FormError message={error} className="m-3" /> : null}

      {rows.length === 0 ? (
        <EmptyState
          title={`No ${config.title.toLowerCase()} yet`}
          description={
            canCreate
              ? `Create the first ${config.singular.toLowerCase()} to start using this module.`
              : `Nothing is visible to your role in ${config.title} yet.`
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                {config.columns.map((column) => {
                  const field = config.fields.find((item) => item.name === column)
                  return (
                    <th
                      key={column}
                      className="px-3 py-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase whitespace-nowrap"
                    >
                      {fieldDisplayLabel(field) || column}
                    </th>
                  )
                })}
                {canUpdate || canDelete || config.key === "employees" || childCount > 0 ? (
                  <th className="px-3 py-2 text-right text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row, index) => (
                <tr key={String(row.id ?? index)} className="hover:bg-muted/30">
                  {config.columns.map((column) => {
                    const field = config.fields.find((item) => item.name === column)
                    const raw = row[column]
                    // Never fall back to a raw reference UUID in the table.
                    const value =
                      field?.type === "relation"
                        ? (row.__labels?.[column] ?? "—")
                        : column.endsWith("_id") &&
                            typeof raw === "string" &&
                            UUID_PATTERN.test(raw)
                          ? "—"
                          : displayValue(raw, field)

                    return (
                      <td key={column} className="px-3 py-2 align-top tabular-nums">
                        {value}
                      </td>
                    )
                  })}
                  {canUpdate || canDelete || config.key === "employees" || childCount > 0 ? (
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {config.key === "employees" && row.id ? (
                          <Link
                            href={`/employees/201/${row.id}`}
                            aria-label="View 201 file"
                            className="inline-flex size-7 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <FileTextIcon className="size-3.5" />
                          </Link>
                      ) : null}
                      {childCount > 0 && row.id ? (
                        <Link
                          href={`/${config.module}/${config.key}/${row.id}`}
                          aria-label="Manage related records"
                          className="inline-flex size-7 items-center justify-center border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <LayersIcon className="size-3.5" />
                        </Link>
                      ) : null}
                      {canUpdate ? (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            config.key === "employees" && row.id
                              ? router.push(`/employees/${row.id}/edit`)
                              : openForm(row)
                          }
                          aria-label={`Edit ${config.singular}`}
                        >
                          <PencilIcon />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setDeleting(row)}
                          aria-label={`Delete ${config.singular}`}
                        >
                          <Trash2Icon />
                        </Button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
        <span className="text-[11px] text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="xs"
            disabled={page <= 1 || pending}
            onClick={() => refresh(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="xs"
            disabled={page >= pageCount || pending}
            onClick={() => refresh(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Drawer open={formOpen} onOpenChange={setFormOpen}>
        <DrawerContent className="gap-4 p-4 sm:max-w-xl">
          <DrawerHeader className="p-0">
            <DrawerTitle>
              {editing ? `Edit ${config.singular}` : `New ${config.singular}`}
            </DrawerTitle>
            <DrawerDescription>
              Changes are scoped to your organization and written to the audit log.
            </DrawerDescription>
          </DrawerHeader>

          {error ? <FormError message={error} /> : null}

          <EntityForm
            config={config}
            values={values}
            relationOptions={relationOptions}
            relationLabels={editing?.__labels}
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
        <DrawerContent className="gap-4 p-4 w-full sm:max-w-5xl">
          <DrawerHeader>
            <DrawerTitle>Delete this {config.singular.toLowerCase()}?</DrawerTitle>
            <DrawerDescription>
              This removes the record from your organization. The action is recorded in
              the audit log.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={remove}
              disabled={pending}
            >
              Delete
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
