import type { Session } from "@/lib/auth"

type CountQuery = PromiseLike<{
  count: number | null
  error: { message: string } | null
}>

export const DASHBOARD_WIDGETS = [
  { key: "team", label: "Team" },
  { key: "outlets", label: "Outlets" },
  { key: "visits", label: "Visits today" },
  { key: "orders", label: "Open orders" },
  { key: "overdue", label: "Overdue invoices" },
  { key: "approvals", label: "Pending approvals" },
  { key: "today", label: "Today panel" },
  { key: "attention", label: "Needs attention" },
  { key: "activity", label: "Recent activity" },
  { key: "announcements", label: "Announcements" },
] as const

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

export type DashboardData = {
  employeeCount: number | null
  fieldStaffCount: number | null
  outletCount: number | null
  orderCount: number | null
  overdueInvoiceCount: number | null
  pendingApprovalCount: number | null
  openTicketCount: number | null
  visits: { planned: number; completed: number; inProgress: number; missed: number } | null
  attendance: { present: number; late: number; absent: number; onLeave: number } | null
  activity:
    | { id: number; summary: string; verb: string; created_at: string }[]
    | null
  announcements:
    | { id: string; title: string; publish_at: string; is_pinned: boolean }[]
    | null
}

async function safeCount(query: CountQuery): Promise<number | null> {
  try {
    const { count, error } = await query
    return error ? null : (count ?? 0)
  } catch {
    return null
  }
}

async function safeRows<T>(query: PromiseLike<{ data: T[] | null; error: unknown }>) {
  try {
    const { data, error } = await query
    return error ? null : (data ?? [])
  } catch {
    return null
  }
}

export function dateInTimeZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function formatLongDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function greeting(date: Date, timeZone: string) {
  const hour = Number(
    new Intl.DateTimeFormat("en", {
      timeZone,
      hour: "numeric",
      hour12: false,
    }).format(date),
  )
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function formatRelativeTime(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  const absolute = Math.abs(diff)
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ]

  for (const [unit, size] of units) {
    if (absolute >= size) {
      return formatter.format(Math.round(diff / size), unit)
    }
  }

  return "just now"
}

export async function loadDashboardData(
  session: Session,
  timezone: string,
): Promise<DashboardData> {
  const { supabase, can } = session
  const today = dateInTimeZone(new Date(), timezone)
  const now = new Date().toISOString()

  const [employeeCount, fieldStaffCount, outletCount, orderCount, overdueInvoiceCount, pendingApprovalCount, openTicketCount, visitRows, attendanceRows, activityRows, announcementRows] =
    await Promise.all([
      can("employees")
        ? safeCount(
            supabase
              .from("employees")
              .select("id", { count: "exact", head: true })
              .eq("status", "active"),
          )
        : Promise.resolve(null),
      can("employees")
        ? safeCount(
            supabase
              .from("employees")
              .select("id", { count: "exact", head: true })
              .eq("status", "active")
              .eq("is_field_staff", true),
          )
        : Promise.resolve(null),
      can("outlets")
        ? safeCount(
            supabase
              .from("outlets")
              .select("id", { count: "exact", head: true })
              .eq("status", "active"),
          )
        : Promise.resolve(null),
      can("orders")
        ? safeCount(
            supabase
              .from("orders")
              .select("id", { count: "exact", head: true })
              .in("status", ["submitted", "approved", "partially_fulfilled"]),
          )
        : Promise.resolve(null),
      can("billing") && can("accounts")
        ? safeCount(
            supabase
              .from("rpt_receivables_aging")
              .select("invoice_id", { count: "exact", head: true })
              .lt("due_date", today),
          )
        : Promise.resolve(null),
      can("approvals")
        ? safeCount(
            supabase
              .from("approvals")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending"),
          )
        : Promise.resolve(null),
      can("tickets")
        ? safeCount(
            supabase
              .from("service_tickets")
              .select("id", { count: "exact", head: true })
              .in("status", ["open", "assigned", "in_progress", "on_hold"]),
          )
        : Promise.resolve(null),
      can("visits")
        ? safeRows<{ status: string }>(
            supabase.from("visits").select("status").eq("planned_date", today),
          )
        : Promise.resolve(null),
      can("attendance")
        ? safeRows<{ status: string }>(
            supabase.from("attendances").select("status").eq("work_date", today),
          )
        : Promise.resolve(null),
      can("activity")
        ? safeRows<{ id: number; summary: string; verb: string; created_at: string }>(
            supabase
              .from("activity_feed")
              .select("id, summary, verb, created_at")
              .order("created_at", { ascending: false })
              .limit(5),
          )
        : Promise.resolve(null),
      can("announcements")
        ? safeRows<{
            id: string
            title: string
            publish_at: string
            is_pinned: boolean
            expires_at: string | null
          }>(
            supabase
              .from("announcements")
              .select("id, title, publish_at, is_pinned, expires_at")
              .lte("publish_at", now)
              .order("publish_at", { ascending: false })
              .limit(5),
          )
        : Promise.resolve(null),
    ])

  const visits = visitRows
    ? visitRows.reduce(
        (totals, row) => {
          totals.planned += 1
          if (row.status === "completed") totals.completed += 1
          if (row.status === "in_progress") totals.inProgress += 1
          if (row.status === "missed" || row.status === "skipped") totals.missed += 1
          return totals
        },
        { planned: 0, completed: 0, inProgress: 0, missed: 0 },
      )
    : null

  const attendance = attendanceRows
    ? attendanceRows.reduce(
        (totals, row) => {
          if (row.status === "present" || row.status === "half_day") totals.present += 1
          if (row.status === "late") totals.late += 1
          if (row.status === "absent") totals.absent += 1
          if (row.status === "on_leave") totals.onLeave += 1
          return totals
        },
        { present: 0, late: 0, absent: 0, onLeave: 0 },
      )
    : null

  return {
    employeeCount,
    fieldStaffCount,
    outletCount,
    orderCount,
    overdueInvoiceCount,
    pendingApprovalCount,
    openTicketCount,
    visits,
    attendance,
    activity: activityRows,
    announcements: announcementRows
      ? announcementRows.filter(
          (row) => !row.expires_at || new Date(row.expires_at) > new Date(),
        )
      : null,
  }
}
