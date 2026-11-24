import "server-only"

import type { Session } from "@/lib/auth"
import { DASHBOARD_WIDGETS } from "@/lib/dashboard-widgets-shared"

/** The widget keys stored in dashboard_layouts.widgets for the current user. */
export async function getDashboardWidgets(session: Session) {
  const { data } = await session.supabase
    .from("dashboard_layouts")
    .select("widgets")
    .eq("org_id", session.organization?.id ?? "")
    .or(`user_id.eq.${session.user.id},user_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const stored = data?.widgets
  if (Array.isArray(stored) && stored.length) {
    return new Set(stored.map(String))
  }

  return new Set(DASHBOARD_WIDGETS.map((widget) => widget.key))
}
