"use server"

import { revalidatePath } from "next/cache"

import { requireSession } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"
import {
  listEntities,
  relationOptions,
  removeEntity,
  saveEntity,
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
