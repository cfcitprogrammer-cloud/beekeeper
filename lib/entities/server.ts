import "server-only"

import type { Session } from "@/lib/auth"
import { getEntity } from "./registry"
import type { EntityConfig, EntityRow, FieldDef } from "./types"

const GLOBAL_TABLES = new Set(["organizations", "permissions"])

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
      if (!Number.isFinite(value)) throw new Error(`${field.label} must be a number.`)
      return value
    }
    case "checkbox":
      return raw === true || raw === "true" || raw === "on" || raw === "1"
    case "json":
      try {
        return JSON.parse(String(raw))
      } catch {
        throw new Error(`${field.label} must be valid JSON.`)
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
    if (field.readOnly) continue
    const raw = values[field.name]
    if (raw === undefined) continue
    if (isCreate && field.required && (raw === "" || raw === null)) {
      throw new Error(`${field.label} is required.`)
    }
    data[field.name] = coerceValue(field, raw)
  }

  return data
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

  return { rows: (data ?? []) as EntityRow[], total: count ?? 0 }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (session.supabase as any)
    .from(table)
    .select(`id, ${labelField}`)

  if (!GLOBAL_TABLES.has(table)) {
    query = query.eq("org_id", session.profile.org_id)
  }

  const { data, error } = await query.order(labelField, { ascending: true }).limit(200)
  if (error) return { options: [], error: error.message }

  return {
    options: (data ?? []).map((row: Record<string, unknown>) => ({
      value: String(row[valueField]),
      label: String(row[labelField] ?? row[valueField]),
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
    if (value === null || value === undefined || GLOBAL_TABLES.has(field.relation.table)) {
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
      throw new Error(`${field.label} must belong to your organization.`)
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
