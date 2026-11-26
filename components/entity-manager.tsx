"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Columns3Icon,
  DownloadIcon,
  FileTextIcon,
  FilterIcon,
  LayersIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { EntityForm, initialFormValues } from "@/components/entity-form"
import { Field } from "@/components/form-field"
import { FormError } from "@/components/form-message"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  type EntityConfig,
  type EntityRow,
  type FieldDef,
} from "@/lib/entities/types"
import { cn } from "@/lib/utils"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function displayValue(value: unknown, field?: FieldDef) {
  if (value === null || value === undefined || value === "") return "—"
  if (field?.type === "checkbox") return value ? "Yes" : "No"
  if (field?.type === "select") {
    return (
      field.options?.find((option) => option.value === String(value))?.label ??
      String(value)
    )
  }
  if (typeof value === "object") return JSON.stringify(value)
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleString()
  }
  return String(value)
}

function statusVariant(
  value: unknown
): "secondary" | "destructive" | "outline" {
  const text = String(value).toLowerCase()
  if (
    ["active", "success", "completed", "approved", "fulfilled", "paid", "open"].includes(
      text
    )
  ) {
    return "secondary"
  }
  if (
    ["error", "failed", "rejected", "inactive", "cancelled", "terminated", "overdue"].includes(
      text
    )
  ) {
    return "destructive"
  }
  return "outline"
}

function initials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "—"
  )
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
  const [limit, setLimit] = React.useState<number>(DEFAULT_PAGE_SIZE)
  const [sort, setSort] = React.useState<{
    field: string
    direction: "asc" | "desc"
  } | null>(null)
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(config.columns)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [filters, setFilters] = React.useState<Record<string, string>>({})
  const [filterDraft, setFilterDraft] = React.useState<Record<string, string>>(
    {}
  )
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [filterOptions, setFilterOptions] = React.useState<
    Record<string, { value: string; label: string }[]>
  >({})
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

  const childCount = childEntitiesFor(config.key).length
  const pageCount = Math.max(1, Math.ceil(total / limit))
  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const filterableFields = config.fields.filter(
    (field) => field.type !== "json"
  )
  const showActions =
    canUpdate || canDelete || config.key === "employees" || childCount > 0
  const numericColumns = visibleColumns.filter(
    (column) => config.fields.find((field) => field.name === column)?.type === "number"
  )
  const firstResult = total === 0 ? 0 : (page - 1) * limit + 1
  const lastResult = Math.min(page * limit, total)
  const pageNumbers = React.useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, Math.max(1, pageCount - 4)))
    return Array.from({ length: Math.min(5, pageCount) }, (_, index) => start + index)
  }, [page, pageCount])

  function refresh(
    nextPage = page,
    nextSearch = search,
    nextLimit = limit,
    nextFilters = filters,
    nextSort = sort
  ) {
    startTransition(async () => {
      toast.loading("Loading records...", { id: "entity-rows" })
      const result = await fetchEntities(
        config.key,
        nextPage,
        nextSearch,
        "all",
        nextLimit,
        nextFilters,
        nextSort ?? undefined
      )
      toast.dismiss("entity-rows")
      if (result.error) {
        toast.error(result.error)
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

    const relationFields = config.fields.filter(
      (field) => field.type === "relation"
    )
    if (relationFields.length) {
      startTransition(async () => {
        toast.loading("Loading form options...", { id: "form-options" })
        const results = await Promise.all(
          relationFields.map((field) =>
            fetchRelationOptions(config.key, field.name)
          )
        )
        toast.dismiss("form-options")
        setRelationOptions(
          Object.fromEntries(
            relationFields.map((field, index) => [
              field.name,
              results[index].options ?? [],
            ])
          )
        )
      })
    }

    setFormOpen(true)
  }

  function save() {
    startTransition(async () => {
      toast.loading("Saving record...", { id: "entity-save" })
      try {
        const result = await saveEntityAction(
          config.key,
          editing?.id ?? null,
          values
        )
        toast.dismiss("entity-save")
        if (!result.ok) {
          toast.error(result.error ?? "Could not save this record.")
          setError(result.error ?? "Could not save this record.")
          return
        }
        toast.success(`${config.singular} saved.`)
        setFormOpen(false)
        refresh(page)
      } catch (caught) {
        toast.dismiss("entity-save")
        const message =
          caught instanceof Error ? caught.message : "Could not save this record."
        toast.error(message)
        setError(message)
      }
    })
  }

  function remove() {
    if (!deleting?.id) return
    startTransition(async () => {
      toast.loading("Deleting record...", { id: "entity-delete" })
      const result = await deleteEntityAction(config.key, String(deleting.id))
      toast.dismiss("entity-delete")
      if (!result.ok) {
        toast.error(result.error ?? "Could not delete this record.")
        setError(result.error ?? "Could not delete this record.")
        return
      }
      toast.success(`${config.singular} deleted.`)
      setDeleting(null)
      refresh(page)
    })
  }

  const filterSelectClass =
    "h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"

  function openFilters() {
    setFilterDraft({ ...filters })
    setFilterOpen(true)

    const relationFields = filterableFields.filter(
      (field) => field.type === "relation"
    )
    if (relationFields.length) {
      startTransition(async () => {
        toast.loading("Loading filter options...", { id: "filter-options" })
        const results = await Promise.all(
          relationFields.map((field) =>
            fetchRelationOptions(config.key, field.name)
          )
        )
        toast.dismiss("filter-options")
        setFilterOptions(
          Object.fromEntries(
            relationFields.map((field, index) => [
              field.name,
              results[index].options ?? [],
            ])
          )
        )
      })
    }
  }

  function applyFilters() {
    const next = Object.fromEntries(
      Object.entries(filterDraft).filter(([, value]) => value !== "")
    )
    setFilters(next)
    setFilterOpen(false)
    refresh(1, search, limit, next)
  }

  function clearFilters() {
    setFilterDraft({})
    setFilters({})
    setFilterOpen(false)
    refresh(1, search, limit, {})
  }

  function renderFilterControl(field: FieldDef) {
    const value = filterDraft[field.name] ?? ""
    const change = (next: string) =>
      setFilterDraft((current) => ({ ...current, [field.name]: next }))
    const id = `filter-${field.name}`
    const label = fieldDisplayLabel(field)

    if (
      field.type === "select" ||
      field.type === "relation" ||
      field.type === "checkbox"
    ) {
      const options =
        field.type === "checkbox"
          ? [
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ]
          : field.type === "select"
            ? (field.options ?? [])
            : (filterOptions[field.name] ?? [])
      const missing =
        Boolean(value) && !options.some((option) => option.value === value)

      return (
        <select
          id={id}
          value={value}
          onChange={(event) => change(event.target.value)}
          className={filterSelectClass}
          aria-label={`Filter by ${label}`}
        >
          <option value="">Any</option>
          {missing ? <option value={value}>Selected</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    const inputType =
      field.type === "number"
        ? "number"
        : field.type === "date" || field.type === "datetime"
          ? "date"
          : "text"

    return (
      <Input
        id={id}
        type={inputType}
        value={value}
        onChange={(event) => change(event.target.value)}
        placeholder="Any"
      />
    )
  }

  function changeSort(
    field: string,
    direction: "asc" | "desc" | "clear"
  ) {
    const next =
      direction === "clear" ? null : { field, direction }
    setSort(next)
    refresh(1, search, limit, filters, next)
  }

  function toggleColumn(column: string) {
    setVisibleColumns((current) => {
      if (current.includes(column)) {
        return current.length > 1 ? current.filter((item) => item !== column) : current
      }
      return config.columns.filter(
        (item) => current.includes(item) || item === column
      )
    })
  }

  function exportCsv() {
    const escape = (value: unknown) => {
      const text = value === null || value === undefined ? "" : String(value)
      return `"${text.replace(/"/g, '""')}"`
    }
    const header = visibleColumns.map((column) =>
      escape(
        fieldDisplayLabel(config.fields.find((field) => field.name === column)) ||
          column
      )
    )
    const lines = [
      header.join(","),
      ...rows.map((row) =>
        visibleColumns
          .map((column) => {
            const field = config.fields.find((item) => item.name === column)
            const raw =
              field?.type === "relation"
                ? (row.__labels?.[column] ?? "")
                : row[column]
            return escape(raw)
          })
          .join(",")
      ),
    ]
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${config.key}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-[calc(100svh-12rem)] flex-col rounded-lg border bg-card shadow-sm">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-card p-3">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            refresh(1, search)
          }}
          className="min-w-48 flex-1"
        >
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                const next = event.target.value
                setSearch(next)
                if (next === "" && search !== "") refresh(1, "")
              }}
              placeholder={`Search ${config.title.toLowerCase()}...`}
              className="h-7 pl-8 text-xs"
              aria-label={`Search ${config.title}`}
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openFilters}
            disabled={pending}
          >
            <FilterIcon />
            Filter{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" />}
            >
              <Columns3Icon />
              Columns
              <ChevronDownIcon className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {config.columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  checked={visibleColumns.includes(column)}
                  onCheckedChange={() => toggleColumn(column)}
                >
                  {fieldDisplayLabel(
                    config.fields.find((field) => field.name === column)
                  ) || column}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={rows.length === 0}
          >
            <DownloadIcon />
            Export
          </Button>

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
              Create New
            </Button>
          ) : null}
        </div>
      </div>

      {error ? <FormError message={error} className="m-3" /> : null}

      {rows.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <EmptyState
            title={`No ${config.title.toLowerCase()} yet`}
            description={
              canCreate
                ? `Create the first ${config.singular.toLowerCase()} to start using this module.`
                : `Nothing is visible to your role in ${config.title} yet.`
            }
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                {visibleColumns.map((column, columnIndex) => {
                  const field = config.fields.find(
                    (item) => item.name === column
                  )
                  const active = sort?.field === column
                  return (
                    <th
                      key={column}
                      className={cn(
                        "px-3 py-2 text-[10px] font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase",
                        columnIndex === 0 && "sticky left-0 z-20 bg-muted/40"
                      )}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 outline-none hover:text-foreground data-popup-open:text-foreground">
                          {fieldDisplayLabel(field) || column}
                          {active ? (
                            sort.direction === "asc" ? (
                              <ArrowUpIcon className="size-3" />
                            ) : (
                              <ArrowDownIcon className="size-3" />
                            )
                          ) : (
                            <ArrowUpDownIcon className="size-3 opacity-50" />
                          )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40">
                          <DropdownMenuItem onClick={() => changeSort(column, "asc")}>
                            <ArrowUpIcon />
                            Ascending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeSort(column, "desc")}>
                            <ArrowDownIcon />
                            Descending
                          </DropdownMenuItem>
                          {active ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => changeSort(column, "clear")}
                              >
                                Clear sort
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </th>
                  )
                })}
                {showActions ? (
                  <th className="px-3 py-2 text-right text-[10px] font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase">
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const rowId = String(row.id ?? index)
                const selected = selectedId === rowId
                return (
                  <tr
                    key={rowId}
                    onClick={() => setSelectedId(selected ? null : rowId)}
                    className={cn(
                      "group border-b transition-colors last:border-b-0",
                      selected ? "bg-primary/5" : "hover:bg-muted/30"
                    )}
                  >
                    {visibleColumns.map((column, columnIndex) => {
                      const field = config.fields.find(
                        (item) => item.name === column
                      )
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
                      const text = String(value)

                      return (
                        <td
                          key={column}
                          className={cn(
                            "px-3 py-2 align-top tabular-nums",
                            columnIndex === 0 && "sticky left-0 z-10",
                            columnIndex === 0 &&
                              (selected
                                ? "bg-primary/5"
                                : "bg-card group-hover:bg-muted/30")
                          )}
                        >
                          {field?.name === "status" && value !== "—" ? (
                            <Badge
                              variant={statusVariant(value)}
                              className="rounded-full"
                            >
                              {text}
                            </Badge>
                          ) : field?.type === "relation" && value !== "—" ? (
                            <span className="inline-flex max-w-56 items-center gap-2">
                              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-medium text-muted-foreground">
                                {initials(text)}
                              </span>
                              <span className="truncate" title={text}>
                                {text}
                              </span>
                            </span>
                          ) : (
                            <span className="block max-w-64 truncate" title={text}>
                              {value}
                            </span>
                          )}
                        </td>
                      )
                    })}
                    {showActions ? (
                      <td
                        className="px-3 py-2 text-right whitespace-nowrap"
                        onClick={(event) => event.stopPropagation()}
                      >
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
                )
              })}
            </tbody>
            {numericColumns.length ? (
              <tfoot className="border-t bg-muted/30">
                <tr>
                  {visibleColumns.map((column, columnIndex) => {
                    const isNumeric = numericColumns.includes(column)
                    const value = isNumeric
                      ? rows.reduce((sum, row) => {
                          const raw = Number(row[column])
                          return Number.isFinite(raw) ? sum + raw : sum
                        }, 0)
                      : null
                    return (
                      <td
                        key={column}
                        className={cn(
                          "px-3 py-2 font-medium",
                          columnIndex === 0 &&
                            "sticky left-0 z-10 bg-muted/30"
                        )}
                      >
                        {columnIndex === 0 ? "Totals" : isNumeric ? value : ""}
                      </td>
                    )
                  })}
                  {showActions ? <td /> : null}
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      )}

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-3 py-2 text-[11px] text-muted-foreground">
        <span className="tabular-nums">
          Showing {firstResult}-{lastResult} of {total} results
        </span>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={page <= 1 || pending}
              onClick={() => refresh(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeftIcon />
            </Button>
            {pageNumbers.map((number) => (
              <Button
                key={number}
                variant={number === page ? "default" : "outline"}
                size="xs"
                className="min-w-6"
                disabled={pending}
                onClick={() => refresh(number)}
                aria-label={`Page ${number}`}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={page >= pageCount || pending}
              onClick={() => refresh(page + 1)}
              aria-label="Next page"
            >
              <ChevronRightIcon />
            </Button>
          </div>

          <label className="flex items-center gap-1.5">
            Rows per page
            <select
              value={limit}
              onChange={(event) => {
                const nextLimit = Number(event.target.value)
                setLimit(nextLimit)
                refresh(1, search, nextLimit)
              }}
              disabled={pending}
              className="h-7 rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
              aria-label="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <Drawer open={formOpen} onOpenChange={setFormOpen}>
        <DrawerContent className="gap-4 p-4 sm:max-w-xl">
          <DrawerHeader className="p-0">
            <DrawerTitle>
              {editing ? `Edit ${config.singular}` : `New ${config.singular}`}
            </DrawerTitle>
            <DrawerDescription>
              Changes are scoped to your organization and written to the audit
              log.
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={pending}>
              {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete this {config.singular.toLowerCase()}?
            </DialogTitle>
            <DialogDescription>
              This removes the record from your organization. The action is
              recorded in the audit log.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleting(null)}
            >
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
        <DrawerContent className="p-0 sm:max-w-md">
          <DrawerHeader className="pr-12">
            <DrawerTitle>Filter {config.title.toLowerCase()}</DrawerTitle>
            <DrawerDescription>
              Text fields match partial values. Leave a field empty to ignore
              it.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            {filterableFields.map((field) => (
              <Field
                key={field.name}
                id={`filter-${field.name}`}
                label={fieldDisplayLabel(field)}
              >
                {renderFilterControl(field)}
              </Field>
            ))}
          </div>

          <DrawerFooter className="border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={pending}
              >
                Clear all
              </Button>
              <Button
                className="flex-1"
                size="sm"
                onClick={applyFilters}
                disabled={pending}
              >
                Apply filters
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
