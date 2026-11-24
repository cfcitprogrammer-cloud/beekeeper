"use server"

import { revalidatePath } from "next/cache"

import { requireOrganization } from "@/lib/auth"

export async function markAnnouncementRead(id: string, acknowledge: boolean) {
  const session = await requireOrganization()
  if (!session.can("announcements", "view")) {
    return { ok: false, error: "You can't view announcements." }
  }

  const { error } = await session.supabase.from("announcement_reads").upsert({
    announcement_id: id,
    user_id: session.user.id,
    read_at: new Date().toISOString(),
    acknowledged_at: acknowledge ? new Date().toISOString() : null,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath("/announcements")
  return { ok: true }
}
