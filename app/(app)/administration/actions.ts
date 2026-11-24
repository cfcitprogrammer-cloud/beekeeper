"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { requireOrganization } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export type AdminActionState = { status: "idle" | "error" | "success"; message?: string }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function inviteUser(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireOrganization()
  if (!session.can("administration", "create")) {
    return { status: "error", message: "You can't add users in this organization." }
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const fullName = String(formData.get("fullName") ?? "").trim()
  const roleId = String(formData.get("roleId") ?? "")

  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Enter a valid email address." }
  }
  if (fullName.length < 2) {
    return { status: "error", message: "Enter the invitee's full name." }
  }

  const headerStore = await headers()
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  const protocol = headerStore.get("x-forwarded-proto") ?? "https"
  const redirectTo = host ? `${protocol}://${host}/login` : undefined

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo,
  })

  if (error) {
    return {
      status: "error",
      message: "The invitation couldn't be sent. Check that email delivery is configured.",
    }
  }

  const userId = data.user.id

  await admin
    .from("users")
    .update({ org_id: session.profile.org_id, full_name: fullName, status: "invited" })
    .eq("id", userId)

  if (roleId) {
    const { data: role } = await admin
      .from("roles")
      .select("id")
      .eq("id", roleId)
      .eq("org_id", session.profile.org_id ?? "")
      .maybeSingle()

    if (role) {
      await admin.from("user_roles").insert({ user_id: userId, role_id: roleId })
    }
  }

  await session.supabase.rpc("log_audit", {
    p_module: "administration",
    p_entity: "users",
    p_entity_id: userId,
    p_action: "invite",
    p_changes: { email, role_id: roleId || null },
  })

  revalidatePath("/administration")
  return { status: "success", message: `Invitation sent to ${email}.` }
}

export async function setRolePermissions(
  roleId: string,
  permissionIds: string[],
  scopes: Record<string, string>,
) {
  const session = await requireOrganization()
  if (!session.can("administration", "update")) {
    return { ok: false, error: "You can't change role permissions." }
  }

  const { data: role } = await session.supabase
    .from("roles")
    .select("id")
    .eq("id", roleId)
    .eq("org_id", session.profile.org_id ?? "")
    .maybeSingle()

  if (!role) return { ok: false, error: "That role doesn't belong to your organization." }

  const { error: deleteError } = await session.supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId)

  if (deleteError) return { ok: false, error: deleteError.message }

  if (permissionIds.length) {
    const { error } = await session.supabase.from("role_permissions").insert(
      permissionIds.map((permissionId) => ({
        role_id: roleId,
        permission_id: permissionId,
        data_scope: scopes[permissionId] ?? "org",
      })),
    )
    if (error) return { ok: false, error: error.message }
  }

  await session.supabase.rpc("log_audit", {
    p_module: "administration",
    p_entity: "roles",
    p_entity_id: roleId,
    p_action: "update",
    p_changes: { permissions: permissionIds.length },
  })

  revalidatePath("/administration/roles")
  return { ok: true }
}

export async function updateOrgSettings(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireOrganization()
  if (!session.can("administration", "update")) {
    return { status: "error", message: "You can't change organization settings." }
  }

  const name = String(formData.get("name") ?? "").trim()
  const timezone = String(formData.get("timezone") ?? "").trim()
  const currencyCode = String(formData.get("currency_code") ?? "").trim().toUpperCase()

  if (name.length < 2) return { status: "error", message: "Enter the organization name." }
  if (!timezone || !currencyCode) {
    return { status: "error", message: "Choose a timezone and currency." }
  }

  const { error } = await session.supabase
    .from("organizations")
    .update({ name, timezone, currency_code: currencyCode, updated_at: new Date().toISOString() })
    .eq("id", session.profile.org_id ?? "")

  if (error) return { status: "error", message: error.message }

  await session.supabase.rpc("log_audit", {
    p_module: "administration",
    p_entity: "organizations",
    p_entity_id: session.profile.org_id ?? "",
    p_action: "update",
    p_changes: { name, timezone, currency_code: currencyCode },
  })

  revalidatePath("/", "layout")
  return { status: "success", message: "Organization settings saved." }
}
