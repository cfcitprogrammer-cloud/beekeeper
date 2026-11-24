"use server"

import { revalidatePath } from "next/cache"

import { requireOrganization } from "@/lib/auth"

export async function saveDashboardWidgets(widgets: string[]) {
  const session = await requireOrganization()
  if (!session.can("dashboard", "update")) {
    return { ok: false, error: "You can't configure the dashboard." }
  }

  const { data: existing } = await session.supabase
    .from("dashboard_layouts")
    .select("id")
    .eq("org_id", session.organization?.id ?? "")
    .eq("user_id", session.user.id)
    .maybeSingle()

  const payload = {
    widgets: widgets as never,
    updated_at: new Date().toISOString(),
  }

  const { error } = existing
    ? await session.supabase.from("dashboard_layouts").update(payload).eq("id", existing.id)
    : await session.supabase.from("dashboard_layouts").insert({
        org_id: session.organization?.id ?? "",
        user_id: session.user.id,
        widgets: widgets as never,
      })

  if (error) return { ok: false, error: error.message }

  revalidatePath("/dashboard")
  return { ok: true }
}
