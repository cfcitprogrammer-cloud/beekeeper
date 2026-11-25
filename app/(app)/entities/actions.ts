"use server"

import { revalidatePath } from "next/cache"

import { requireSession } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"
import {
  listEntities,
  relationOptions,
  removeEntity,
  saveEntity,
  validateValues,
} from "@/lib/entities/server"

export async function fetchEntities(
  key: string,
  page: number,
  search: string,
  status: string,
) {
  const session = await requireSession()
  return listEntities(session, key, { page, search, status })
}

export async function fetchRelationOptions(key: string, fieldName: string) {
  const session = await requireSession()
  return relationOptions(session, key, fieldName)
}

export async function saveEntityAction(
  key: string,
  id: string | null,
  values: Record<string, unknown>,
) {
  const session = await requireSession()
  const result = await saveEntity(session, key, id, values)
  if (result.ok) {
    const entityModule = getEntity(key)?.module
    if (entityModule) revalidatePath(`/${entityModule.replace("_", "-")}`)
  }
  return result
}

export async function deleteEntityAction(key: string, id: string) {
  const session = await requireSession()
  const result = await removeEntity(session, key, id)
  if (result.ok) {
    const entityModule = getEntity(key)?.module
    if (entityModule) revalidatePath(`/${entityModule.replace("_", "-")}`)
  }
  return result
}

export async function fetchChildRows(
  childKey: string,
  fkField: string,
  parentId: string,
) {
  const session = await requireSession()
  const config = getEntity(childKey)
  if (!config?.child || !session.can(config.module, "view")) {
    return { rows: [], error: "No access." }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (session.supabase as any)
    .from(config.table)
    .select("*")
    .eq(fkField, parentId)
  if (config.tenantScoped) {
    query = query.eq("org_id", session.profile.org_id)
  }
  const { data, error } = await query.order(config.defaultOrder, { ascending: false })
  if (error) return { rows: [], error: error.message }
  return { rows: (data ?? []) as Record<string, unknown>[] }
}

export async function saveChildRow(
  childKey: string,
  values: Record<string, unknown>,
  keys: Record<string, unknown>,
  isCreate: boolean,
) {
  const session = await requireSession()
  const config = getEntity(childKey)
  if (!config?.child) return { ok: false, error: "Unknown child table." }
  const action = isCreate ? "create" : "update"
  if (!session.can(config.module, action)) {
    return { ok: false, error: `You can't ${action} here.` }
  }

  try {
    const data = validateValues(config, values, isCreate)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = (session.supabase as any).from(config.table)
    const { error } = isCreate
      ? await table.insert(data)
      : await table.update(data).match(keys)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (caught) {
    return {
      ok: false,
      error: caught instanceof Error ? caught.message : "Could not save this child row.",
    }
  }
}

export async function removeChildRow(childKey: string, keys: Record<string, unknown>) {
  const session = await requireSession()
  const config = getEntity(childKey)
  if (!config?.child) return { ok: false, error: "Unknown child table." }
  if (!session.can(config.module, "delete")) {
    return { ok: false, error: "You can't delete here." }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (session.supabase as any).from(config.table).delete().match(keys)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
