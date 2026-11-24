"use server"

import { requireSession } from "@/lib/auth"
import type { Database } from "@/lib/supabase/database.types"

type Notification = Database["public"]["Tables"]["notifications"]["Row"]

export async function fetchNotifications(): Promise<Notification[]> {
  const session = await requireSession()
  const { data } = await session.supabase
    .from("notifications")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(8)
  return data ?? []
}

export async function markNotificationsRead(ids: string[]) {
  if (!ids.length) return
  const session = await requireSession()
  await session.supabase.rpc("mark_notifications_read", { p_ids: ids })
}
