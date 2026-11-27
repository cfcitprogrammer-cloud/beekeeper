"use server"

import { revalidatePath } from "next/cache"

import { requireSession } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"
import {
  listEntities,
  relationOptions,
  removeEntity,
  saveEntity,
  validateRelations,
  validateValues,
} from "@/lib/entities/server"

export async function fetchEntities(
  key: string,
  page: number,
  search: string,
  status: string,
  limit: number,
  filters: Record<string, string>,
  sort?: { field: string; direction: "asc" | "desc" },
) {
  const session = await requireSession()
  return listEntities(session, key, { page, search, status, limit, filters, sort })
}

export async function saveAccountWithContacts(
  values: Record<string, unknown>,
  contacts: {
    first_name: string
    last_name: string
    title: string
    email: string
    phone: string
    is_primary: boolean
  }[],
  addresses: {
    address_type: "billing" | "shipping" | "both"
    label: string
    line1: string
    line2: string
    barangay: string
    city: string
    province: string
    postal_code: string
    country_code: string
    is_default: boolean
  }[] = [],
) {
  const session = await requireSession()
  if (!session.can("accounts", "create")) {
    return { ok: false, error: "You can't create accounts." }
  }

  const config = getEntity("accounts")
  if (!config) return { ok: false, error: "Unknown module." }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = session.supabase as any
  let accountId: string | null = null
  try {
    const data = validateValues(config, values, true)
    await validateRelations(session, config, data)
    data.org_id = session.profile.org_id

    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .insert(data)
      .select("id")
      .single()
    if (accountError) return { ok: false, error: accountError.message }
    const newAccountId = String(account.id)
    accountId = newAccountId

    const rows = contacts
      .filter((contact) => contact.first_name.trim())
      .map((contact) => ({
        org_id: session.profile.org_id,
        account_id: newAccountId,
        first_name: contact.first_name.trim(),
        last_name: contact.last_name.trim() || null,
        title: contact.title.trim() || null,
        email: contact.email.trim() || null,
        phone: contact.phone.trim() || null,
        is_primary: contact.is_primary,
      }))

    if (rows.length) {
      const { error: contactsError } = await supabase.from("contacts").insert(rows)
      if (contactsError) throw new Error(contactsError.message)
    }

    const addressRows = addresses
      .filter((address) => address.line1.trim() && address.city.trim())
      .map((address) => ({
        org_id: session.profile.org_id,
        account_id: newAccountId,
        address_type: address.address_type,
        label: address.label.trim() || null,
        line1: address.line1.trim(),
        line2: address.line2.trim() || null,
        barangay: address.barangay.trim() || null,
        city: address.city.trim(),
        province: address.province.trim() || null,
        postal_code: address.postal_code.trim() || null,
        country_code: address.country_code.trim().toUpperCase().slice(0, 2) || "PH",
        is_default: address.is_default,
        is_active: true,
      }))

    if (addressRows.length) {
      const { error: addressesError } = await supabase.from("addresses").insert(addressRows)
      if (addressesError) throw new Error(addressesError.message)
    }

    await session.supabase.rpc("log_audit", {
      p_module: "accounts",
      p_entity: "accounts",
      p_entity_id: accountId,
      p_action: "create",
      p_changes: {
        fields: Object.keys(data),
        contacts: rows.length,
        addresses: addressRows.length,
      },
    })

    revalidatePath("/accounts")
    return { ok: true, id: accountId }
  } catch (caught) {
    if (accountId) {
      await session.supabase.from("accounts").delete().eq("id", accountId)
    }
    return {
      ok: false,
      error: caught instanceof Error ? caught.message : "Could not save this account.",
    }
  }
}

export async function fetchRelationOptions(key: string, fieldName: string) {
  const session = await requireSession()
  return relationOptions(session, key, fieldName)
}

export async function fetchMasterDataOptions(typeCode: string) {
  const session = await requireSession()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = session.supabase as any

  const { data: type } = await supabase
    .from("master_data_types")
    .select("id")
    .eq("org_id", session.profile.org_id)
    .eq("code", typeCode)
    .maybeSingle()

  if (!type) return { options: [] as { value: string; label: string }[] }

  const { data, error } = await supabase
    .from("master_data_items")
    .select("code, label, is_active, sort_order")
    .eq("type_id", type.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) return { options: [] as { value: string; label: string }[], error: error.message }

  return {
    options: ((data ?? []) as { code: string; label: string }[]).map((item) => ({
      value: item.code,
      label: item.label,
    })),
  }
}

export async function searchRelationOptions(
  key: string,
  fieldName: string,
  query: string,
  limit = 10,
) {
  const session = await requireSession()
  return relationOptions(session, key, fieldName, { search: query, limit })
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
