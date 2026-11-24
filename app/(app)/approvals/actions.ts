"use server"

import { revalidatePath } from "next/cache"

import { requireOrganization } from "@/lib/auth"

export async function decideApproval(
  id: string,
  decision: "approved" | "rejected",
  remarks: string,
) {
  const session = await requireOrganization()
  if (!session.can("approvals", "approve") && !session.can("approvals", "update")) {
    return { ok: false, error: "You can't decide on approvals." }
  }

  const { data: approval } = await session.supabase
    .from("approvals")
    .select("id, org_id, entity_type, entity_id, level")
    .eq("id", id)
    .eq("org_id", session.profile.org_id ?? "")
    .maybeSingle()

  if (!approval) return { ok: false, error: "That approval isn't in your organization." }

  const { error } = await session.supabase
    .from("approvals")
    .update({
      status: decision,
      remarks: remarks.trim() || null,
      acted_at: new Date().toISOString(),
      approver_id: session.user.id,
    })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }

  await session.supabase.rpc("log_audit", {
    p_module: "approvals",
    p_entity: approval.entity_type,
    p_entity_id: approval.entity_id,
    p_action: decision,
    p_changes: { level: approval.level, remarks: remarks.trim() || null },
  })

  await session.supabase.from("activity_feed").insert({
    org_id: session.organization?.id ?? "",
    actor_id: session.user.id,
    verb: decision,
    entity_type: approval.entity_type,
    entity_id: approval.entity_id,
    summary: `${decision === "approved" ? "Approved" : "Rejected"} ${approval.entity_type.replace(/_/g, " ")} at level ${approval.level}`,
  })

  revalidatePath("/approvals")
  return { ok: true }
}
