import { cache } from "react"
import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
type UserRow = Database["public"]["Tables"]["users"]["Row"]
type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"]
type PermissionRow = Database["public"]["Functions"]["current_permissions"]["Returns"][number]

export type Session = {
  supabase: SupabaseServerClient
  user: User
  profile: UserRow
  organization: OrganizationRow | null
  permissions: PermissionRow[]
  can: (module: string, action?: string) => boolean
}

function permissionKey(module: string, action: string) {
  return `${module}:${action}`
}

/**
 * Resolves the signed-in user, their tenant profile, organization and effective
 * permissions. Cached per request so layouts, pages and actions share one pass.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  // The auth trigger creates this row. A missing profile means the database
  // schema has not been applied yet; treat it as unonboarded rather than crash.
  if (!profile) {
    return null
  }

  let organization: OrganizationRow | null = null
  if (profile.org_id) {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.org_id)
      .maybeSingle()
    organization = data
  }

  const { data: permissionRows } = await supabase.rpc("current_permissions")
  const permissions = permissionRows ?? []
  const granted = new Set(
    permissions.map((permission) => permissionKey(permission.module, permission.action)),
  )

  return {
    supabase,
    user,
    profile,
    organization,
    permissions,
    can: (module, action = "view") => granted.has(permissionKey(module, action)),
  }
})

export async function requireSession() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

export async function requireOrganization() {
  const session = await requireSession()
  if (!session.profile.org_id) {
    redirect("/onboarding")
  }
  return session
}

export function displayName(profile: Pick<UserRow, "full_name" | "email">) {
  const name = profile.full_name.trim()
  if (name) return name
  const local = profile.email.split("@")[0] ?? "there"
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function firstName(profile: Pick<UserRow, "full_name" | "email">) {
  return displayName(profile).split(/\s+/)[0] ?? "there"
}

export function initials(profile: Pick<UserRow, "full_name" | "email">) {
  const parts = displayName(profile).split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2)
  return (letters ?? "?").toUpperCase()
}
