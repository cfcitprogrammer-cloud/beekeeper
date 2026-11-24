"use server"

import { revalidatePath } from "next/cache"

import { requireOrganization } from "@/lib/auth"

export async function moveOpportunity(id: string, stageId: string) {
  const session = await requireOrganization()
  if (!session.can("opportunities", "update")) {
    return { ok: false, error: "You can't update opportunities." }
  }

  const [{ data: opportunity }, { data: stage }] = await Promise.all([
    session.supabase
      .from("opportunities")
      .select("id")
      .eq("id", id)
      .eq("org_id", session.profile.org_id ?? "")
      .maybeSingle(),
    session.supabase
      .from("pipeline_stages")
      .select("id")
      .eq("id", stageId)
      .eq("org_id", session.profile.org_id ?? "")
      .maybeSingle(),
  ])

  if (!opportunity || !stage) return { ok: false, error: "Opportunity or stage not found." }

  const { error } = await session.supabase
    .from("opportunities")
    .update({ stage_id: stageId, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }

  await session.supabase.rpc("log_audit", {
    p_module: "opportunities",
    p_entity: "opportunities",
    p_entity_id: id,
    p_action: "update",
    p_changes: { stage_id: stageId },
  })

  revalidatePath("/opportunities")
  return { ok: true }
}
