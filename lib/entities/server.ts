import "server-only"

import type { Session } from "@/lib/auth"
import { fieldDisplayLabel } from "./format"
import { getEntity } from "./registry"
import type { EntityConfig, EntityRow, FieldDef } from "./types"

/**
 * Only tables that actually have an `org_id` column can be scoped to the
 * current organization. Generated configs carry this from the migrations, so
 * we use it instead of a hardcoded global-table list.
 */
function isTenantScoped(table: string) {
  return getEntity(table)?.tenantScoped ?? false
}

type RelationLabelConfig = {
  /** Extra columns needed to build a friendly label. */
  columns: string[]
  orderBy: string
  label: (row: Record<string, unknown>) => string
}

function stringOr(value: unknown, fallback = "") {
  return value === null || value === undefined || value === "" ? fallback : String(value)
}

function datePart(value: unknown) {
  const raw = stringOr(value)
  return raw ? raw.slice(0, 10) : ""
}

/**
 * Generated relation metadata points at a single label column. Several tables
 * have no natural label (so the generator fell back to `id`), and employees are
 * friendlier as a full name. These specs fill that gap for tables that are used
 * as relation targets.
 */
const RELATION_LABEL_CONFIG: Record<string, RelationLabelConfig> = {
  users: {
    columns: ["full_name", "email"],
    orderBy: "full_name",
    label: (row) => stringOr(row.full_name, stringOr(row.email, stringOr(row.id))),
  },
  employees: {
    columns: ["employee_no", "first_name", "last_name", "email"],
    orderBy: "first_name",
    label: (row) => {
      const name = [row.first_name, row.last_name]
        .map((part) => stringOr(part).trim())
        .filter(Boolean)
        .join(" ")
      return name || stringOr(row.employee_no, stringOr(row.email, stringOr(row.id)))
    },
  },
  orders: {
    columns: ["order_no"],
    orderBy: "order_no",
    label: (row) => stringOr(row.order_no, "Order"),
  },
  invoices: {
    columns: ["invoice_no"],
    orderBy: "invoice_no",
    label: (row) => stringOr(row.invoice_no, "Invoice"),
  },
  payments: {
    columns: ["payment_no"],
    orderBy: "payment_no",
    label: (row) => stringOr(row.payment_no, "Payment"),
  },
  batches: {
    columns: ["batch_no"],
    orderBy: "batch_no",
    label: (row) => stringOr(row.batch_no, "Batch"),
  },
  sales_transactions: {
    columns: ["txn_no"],
    orderBy: "txn_no",
    label: (row) => stringOr(row.txn_no, "Transaction"),
  },
  visits: {
    columns: ["planned_date", "status"],
    orderBy: "planned_date",
    label: (row) => {
      const date = datePart(row.planned_date)
      const status = stringOr(row.status)
      if (date && status) return `Visit · ${date} (${status.replace(/_/g, " ")})`
      if (date) return `Visit · ${date}`
      return "Visit"
    },
  },
  boms: {
    columns: ["version"],
    orderBy: "version",
    label: (row) => (row.version ? `BOM v${row.version}` : "BOM"),
  },
  stock_counts: {
    columns: ["counted_at"],
    orderBy: "counted_at",
    label: (row) => {
      const date = datePart(row.counted_at)
      return date ? `Stock count · ${date}` : "Stock count"
    },
  },
}

function labelConfigFor(table: string, labelField: string): RelationLabelConfig {
  const known = RELATION_LABEL_CONFIG[table]
  if (known) return known

  return {
    columns: labelField === "id" ? [] : [labelField],
    orderBy: labelField,
    label: (row) => {
      const id = stringOr(row.id)
      const fallback = labelField === "id" ? "" : stringOr(row[labelField])
      if (fallback) return fallback
      // Never leak a raw UUID into the UI.
      return id ? `Record ${id.slice(0, 8)}` : "Unnamed record"
    },
  }
}

function relationSelectColumns(labelConfig: RelationLabelConfig, valueField: string) {
  return [...new Set(["id", valueField, ...labelConfig.columns])].join(", ")
}

/**
 * The generated config table names are dynamic, so the Supabase query builder
 * is deliberately accessed through a narrow escape hatch here. Everything that
 * crosses this boundary is whitelisted by the entity registry and validated.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function from(session: Session, config: EntityConfig): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session.supabase as any).from(config.table)
}

export function coerceValue(field: FieldDef, raw: unknown) {
  if (raw === "" || raw === null || raw === undefined) return null

  switch (field.type) {
    case "number": {
      const value = Number(raw)
      if (!Number.isFinite(value)) {
        throw new Error(`${fieldDisplayLabel(field)} must be a number.`)
      }
      return value
    }
    case "checkbox":
      return raw === true || raw === "true" || raw === "on" || raw === "1"
    case "json":
      try {
        return JSON.parse(String(raw))
      } catch {
        throw new Error(`${fieldDisplayLabel(field)} must be valid JSON.`)
      }
    default:
      return String(raw)
  }
}

export function validateValues(
  config: EntityConfig,
  values: Record<string, unknown>,
  isCreate: boolean,
) {
  const data: Record<string, unknown> = {}

  for (const field of config.fields) {
    if (field.readOnly) {
      // Computed totals are not shown in the form. On create they still need a
      // value because some tables declare them NOT NULL without a default.
      if (isCreate && field.required && field.type === "number") {
        data[field.name] = 0
      }
      continue
    }
    const raw = values[field.name]

    if (raw === undefined) {
      if (isCreate && field.required) {
        throw new Error(`${fieldDisplayLabel(field)} is required.`)
      }
      continue
    }

    const value = coerceValue(field, raw)

    if (value === null) {
      if (isCreate) {
        if (field.required) {
          throw new Error(`${fieldDisplayLabel(field)} is required.`)
        }
        // Let database defaults apply instead of overriding them with NULL.
        continue
      }

      // A NOT NULL column can't be cleared; keep the existing value.
      if (field.notNull) continue

      data[field.name] = null
      continue
    }

    data[field.name] = value
  }

  return data
}

/**
 * Relation columns are stored as UUIDs. Resolve the displayed ones to friendly
 * labels in one query per target table, and attach them as `row.__labels` so
 * the table can render names while forms keep using the raw IDs.
 */
async function attachRelationLabels(
  session: Session,
  config: EntityConfig,
  rows: EntityRow[],
): Promise<EntityRow[]> {
  const relationFields = config.fields.filter(
    (field) => field.type === "relation" && field.relation && field.name !== "org_id",
  )

  if (!rows.length || !relationFields.length) return rows

  type LabelRequest = {
    table: string
    valueField: string
    labelField: string
    ids: Set<string>
  }

  const requests = new Map<string, LabelRequest>()
  for (const field of relationFields) {
    const relation = field.relation!
    const requestKey = `${relation.table}.${relation.field}`
    const request =
      requests.get(requestKey) ??
      ({
        table: relation.table,
        valueField: relation.field,
        labelField: relation.labelField,
        ids: new Set<string>(),
      } satisfies LabelRequest)

    for (const row of rows) {
      const value = row[field.name]
      if (typeof value === "string" && value) request.ids.add(value)
    }
    requests.set(requestKey, request)
  }

  const labelsByRequest = new Map<string, Map<string, string>>()

  await Promise.all(
    [...requests.entries()].map(async ([requestKey, request]) => {
      if (!request.ids.size) return

      const labelConfig = labelConfigFor(request.table, request.labelField)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (session.supabase as any)
        .from(request.table)
        .select(relationSelectColumns(labelConfig, request.valueField))
        .in(request.valueField, [...request.ids])

      if (isTenantScoped(request.table)) {
        query = query.eq("org_id", session.profile.org_id)
      }

      const { data, error } = await query.limit(request.ids.size)
      if (error) {
        console.error(`Could not load ${request.table} labels: ${error.message}`)
        return
      }

      const labels = new Map<string, string>()
      for (const target of (data ?? []) as Record<string, unknown>[]) {
        const value = target[request.valueField] ?? target.id
        if (value === null || value === undefined) continue
        labels.set(String(value), labelConfig.label(target))
      }
      labelsByRequest.set(requestKey, labels)
    }),
  )

  return rows.map((row) => {
    const labels: Record<string, string> = {}

    for (const field of relationFields) {
      const relation = field.relation!
      const value = row[field.name]
      if (typeof value !== "string" || !value) continue
      const label = labelsByRequest.get(`${relation.table}.${relation.field}`)?.get(value)
      if (label) labels[field.name] = label
    }

    return Object.keys(labels).length ? { ...row, __labels: labels } : row
  })
}

export async function getEntityRow(
  session: Session,
  key: string,
  id: string,
): Promise<{ config: EntityConfig | null; row: EntityRow | null; error?: string }> {
  const config = getEntity(key)
  if (!config) return { config: null, row: null, error: "Unknown module." }
  if (!session.can(config.module, "view")) {
    return { config, row: null, error: "You can't view this module." }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (session.supabase as any).from(config.table).select("*").eq("id", id)
  if (config.tenantScoped) {
    query = query.eq("org_id", session.profile.org_id)
  }
  const { data, error } = await query.maybeSingle()

  if (error) return { config, row: null, error: error.message }
  if (!data) return { config, row: null, error: "Record not found." }

  const [row] = await attachRelationLabels(session, config, [data as EntityRow])
  return { config, row: row ?? (data as EntityRow) }
}

export async function listEntities(
  session: Session,
  key: string,
  options: { page: number; search?: string; status?: string },
): Promise<{ rows: EntityRow[]; total: number; error?: string }> {
  const config = getEntity(key)
  if (!config) return { rows: [], total: 0, error: "Unknown module." }
  if (!session.can(config.module, "view")) {
    return { rows: [], total: 0, error: "You can't view this module." }
  }

  const pageSize = 20
  const start = Math.max(0, options.page - 1) * pageSize
  let query = from(session, config).select("*", { count: "exact" })

  if (config.tenantScoped) {
    query = query.eq("org_id", session.profile.org_id)
  }
  if (options.search?.trim() && config.searchColumns.length) {
    const terms = config.searchColumns
      .map((column) => `${column}.ilike.%${options.search!.trim().replace(/[%,]/g, "")}%`)
      .join(",")
    query = query.or(terms)
  }
  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status)
  }

  query = query.order(config.defaultOrder, { ascending: false }).range(start, start + pageSize - 1)

  const { data, count, error } = await query
  if (error) return { rows: [], total: 0, error: error.message }

  const rows = await attachRelationLabels(session, config, (data ?? []) as EntityRow[])
  return { rows, total: count ?? 0 }
}

export async function relationOptions(
  session: Session,
  key: string,
  fieldName: string,
): Promise<{ options: { value: string; label: string }[]; error?: string }> {
  const config = getEntity(key)
  const field = config?.fields.find((item) => item.name === fieldName && item.type === "relation")
  if (!config || !field?.relation) return { options: [], error: "Unknown field." }
  if (!session.can(config.module, "view")) return { options: [], error: "No access." }

  const { table, field: valueField, labelField } = field.relation
  const labelConfig = labelConfigFor(table, labelField)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (session.supabase as any)
    .from(table)
    .select(relationSelectColumns(labelConfig, valueField))

  if (isTenantScoped(table)) {
    query = query.eq("org_id", session.profile.org_id)
  }

  const { data, error } = await query.order(labelConfig.orderBy, { ascending: true }).limit(200)
  if (error) return { options: [], error: error.message }

  return {
    options: ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      value: String(row[valueField]),
      label: labelConfig.label(row),
    })),
  }
}

async function validateRelations(
  session: Session,
  config: EntityConfig,
  data: Record<string, unknown>,
) {
  for (const field of config.fields) {
    if (field.type !== "relation" || !field.relation) continue
    const value = data[field.name]
    if (
      value === null ||
      value === undefined ||
      !isTenantScoped(field.relation.table)
    ) {
      continue
    }
    if (field.name === "org_id") continue

    const { data: belongs, error } = await session.supabase.rpc("parent_belongs_to_org", {
      p_table: field.relation.table,
      p_field: field.relation.field,
      p_id: String(value),
      p_org: session.profile.org_id ?? "",
    })
    if (error || !belongs) {
      throw new Error(`${fieldDisplayLabel(field)} must belong to your organization.`)
    }
  }
}

export async function saveEntity(
  session: Session,
  key: string,
  id: string | null,
  values: Record<string, unknown>,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const config = getEntity(key)
  if (!config) return { ok: false, error: "Unknown module." }
  if (config.readOnly) return { ok: false, error: "This module is read-only." }
  const action = id ? "update" : "create"
  if (!session.can(config.module, action)) {
    return { ok: false, error: `You can't ${action} in this module.` }
  }

  try {
    const data = validateValues(config, values, !id)
    await validateRelations(session, config, data)

    if (!id && config.tenantScoped) {
      data.org_id = session.profile.org_id
    }

    let savedId = id
    const { data: result, error } = id
      ? await from(session, config).update(data).eq("id", id).select("id").single()
      : await from(session, config).insert(data).select("id").single()

    if (error) return { ok: false, error: error.message }
    savedId = String(result?.id ?? id ?? "")

    await session.supabase.rpc("log_audit", {
      p_module: config.module,
      p_entity: config.table,
      p_entity_id: savedId,
      p_action: action,
      p_changes: { fields: Object.keys(data) },
    })

    return { ok: true, id: savedId }
  } catch (caught) {
    return {
      ok: false,
      error: caught instanceof Error ? caught.message : "Could not save this record.",
    }
  }
}

export async function removeEntity(
  session: Session,
  key: string,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const config = getEntity(key)
  if (!config) return { ok: false, error: "Unknown module." }
  if (config.readOnly) return { ok: false, error: "This module is read-only." }
  if (!session.can(config.module, "delete")) {
    return { ok: false, error: "You can't delete in this module." }
  }

  const { error } = await from(session, config).delete().eq("id", id)
  if (error) return { ok: false, error: error.message }

  await session.supabase.rpc("log_audit", {
    p_module: config.module,
    p_entity: config.table,
    p_entity_id: id,
    p_action: "delete",
    p_changes: {},
  })

  return { ok: true }
}
