import type { Metadata } from "next"
import Link from "next/link"
import {
  ActivityIcon,
  CircleCheckIcon,
  ClipboardListIcon,
  LifeBuoyIcon,
  MapPinIcon,
  MegaphoneIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { PageHeader, Panel } from "@/components/panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { firstName, requireOrganization } from "@/lib/auth"
import {
  formatLongDate,
  formatRelativeTime,
  getDashboardWidgets,
  greeting,
  loadDashboardData,
} from "@/lib/dashboard"

export const metadata: Metadata = { title: "Dashboard" }

type Metric = {
  key: string
  label: string
  value: number
  detail: string
  href: string
  icon: LucideIcon
}

type AttentionItem = {
  label: string
  detail: string
  count: number
  href: string
  icon: LucideIcon
}

function MetricTile({ metric }: { metric: Metric }) {
  const Icon = metric.icon
  return (
    <Link
      href={metric.href}
      className="group bg-card p-4 transition-colors hover:bg-muted/40 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-muted-foreground">{metric.label}</p>
        <Icon className="size-3.5 text-muted-foreground/70 group-hover:text-foreground" />
      </div>
      <p className="mt-3 text-2xl font-medium tracking-tight tabular-nums">{metric.value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{metric.detail}</p>
    </Link>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium tabular-nums">{value}</dd>
    </div>
  )
}

export default async function DashboardPage() {
  const session = await requireOrganization()
  const { can, profile } = session
  const organization = session.organization
  const timezone = organization?.timezone ?? "UTC"
  const [data, enabled] = await Promise.all([
    loadDashboardData(session, timezone),
    getDashboardWidgets(session),
  ])
  const now = new Date()

  const metrics = [
    data.employeeCount !== null
      ? {
          key: "team",
          label: "Team",
          value: data.employeeCount,
          detail:
            data.fieldStaffCount && data.fieldStaffCount > 0
              ? `${data.fieldStaffCount} field staff`
              : "Active employees",
          href: "/employees",
          icon: UsersIcon,
        }
      : null,
    data.outletCount !== null
      ? {
          key: "outlets",
          label: "Outlets",
          value: data.outletCount,
          detail: "Active locations",
          href: "/outlets",
          icon: StoreIcon,
        }
      : null,
    data.visits !== null
      ? {
          key: "visits",
          label: "Visits today",
          value: data.visits.planned,
          detail:
            data.visits.planned > 0
              ? `${data.visits.completed} completed`
              : "No visits planned",
          href: "/visits",
          icon: MapPinIcon,
        }
      : null,
    data.orderCount !== null
      ? {
          key: "orders",
          label: "Open orders",
          value: data.orderCount,
          detail: "Submitted or in fulfilment",
          href: "/orders",
          icon: ShoppingCartIcon,
        }
      : null,
    data.overdueInvoiceCount !== null
      ? {
          key: "overdue",
          label: "Overdue invoices",
          value: data.overdueInvoiceCount,
          detail: "Past their due date",
          href: "/billing",
          icon: ReceiptIcon,
        }
      : null,
    data.pendingApprovalCount !== null
      ? {
          key: "approvals",
          label: "Pending approvals",
          value: data.pendingApprovalCount,
          detail: "Waiting on a decision",
          href: "/approvals",
          icon: ClipboardListIcon,
        }
      : null,
  ]
    .filter((metric): metric is Metric => metric !== null)
    .filter((metric) => enabled.has(metric.key))

  const attention = [
    data.pendingApprovalCount !== null
      ? {
          label: "Pending approvals",
          detail: "Across leave, expenses, orders and corrections",
          count: data.pendingApprovalCount,
          href: "/approvals",
          icon: ClipboardListIcon,
        }
      : null,
    data.overdueInvoiceCount !== null
      ? {
          label: "Overdue invoices",
          detail: "Open balances past their due date",
          count: data.overdueInvoiceCount,
          href: "/billing",
          icon: ReceiptIcon,
        }
      : null,
    data.openTicketCount !== null
      ? {
          label: "Open service tickets",
          detail: "Open, assigned or in progress",
          count: data.openTicketCount,
          href: "/tickets",
          icon: LifeBuoyIcon,
        }
      : null,
  ].filter((item): item is AttentionItem => item !== null)

  const hasAttention = attention.length > 0 && enabled.has("attention")
  const attentionTotal = attention.reduce((total, item) => total + item.count, 0)
  const showActivity = can("activity") && data.activity !== null && enabled.has("activity")
  const showAnnouncements =
    can("announcements") && data.announcements !== null && enabled.has("announcements")

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title={`${greeting(now, timezone)}, ${firstName(profile)}`}
        description={`${formatLongDate(now, timezone)} · ${organization?.name ?? "Your organization"}`}
        action={
          <Button variant="outline" size="sm" render={<Link href="/dashboard/settings" />}>
            Configure widgets
          </Button>
        }
      />

      {metrics.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-px border bg-border sm:grid-cols-3 xl:grid-cols-6">
          {metrics.map((metric) => (
            <MetricTile key={metric.key} metric={metric} />
          ))}
        </div>
      ) : (
        <div className="mt-6 border bg-card">
          <EmptyState
            icon={ClipboardListIcon}
            title="No dashboard permissions yet"
            description="Your role doesn't include access to any dashboard modules. Ask an Administrator to review your role permissions."
          />
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel title="Today" description={formatLongDate(now, timezone)}>
          <div className="divide-y">
            {data.visits !== null && enabled.has("today") ? (
              <section className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[11px] font-medium">Visits</h3>
                  <Link
                    href="/visits"
                    className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Open visits
                  </Link>
                </div>
                {data.visits.planned > 0 ? (
                  <dl className="mt-2 grid grid-cols-3 gap-3">
                    <MiniStat label="Planned" value={data.visits.planned} />
                    <MiniStat label="Completed" value={data.visits.completed} />
                    <MiniStat label="Missed" value={data.visits.missed} />
                  </dl>
                ) : (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    No visits are planned for today. Scheduled outlet visits will appear
                    here.
                  </p>
                )}
              </section>
            ) : null}

            {data.attendance !== null && enabled.has("today") ? (
              <section className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[11px] font-medium">Attendance</h3>
                  <Link
                    href="/attendance"
                    className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Open attendance
                  </Link>
                </div>
                {data.attendance.present +
                  data.attendance.late +
                  data.attendance.absent +
                  data.attendance.onLeave >
                0 ? (
                  <dl className="mt-2 grid grid-cols-4 gap-3">
                    <MiniStat label="Present" value={data.attendance.present} />
                    <MiniStat label="Late" value={data.attendance.late} />
                    <MiniStat label="Absent" value={data.attendance.absent} />
                    <MiniStat label="On leave" value={data.attendance.onLeave} />
                  </dl>
                ) : (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    No clock-ins recorded today. Attendance appears here as your team
                    starts their day.
                  </p>
                )}
              </section>
            ) : null}

            {!enabled.has("today") ? null : data.visits === null && data.attendance === null ? (
              <EmptyState
                icon={ActivityIcon}
                title="Today has no permitted modules"
                description="Your role doesn't include visits or attendance. An Administrator can grant read access in Administration."
              />
            ) : null}
          </div>
        </Panel>

        {hasAttention ? (
          <Panel
            title="Needs attention"
            description="Items that usually need a decision or a follow-up"
          >
            {attentionTotal > 0 ? (
              <div className="divide-y">
                {attention.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                    >
                      <span className="flex min-w-0 items-start gap-2.5">
                        <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0">
                          <span className="block text-xs font-medium">{item.label}</span>
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">
                            {item.detail}
                          </span>
                        </span>
                      </span>
                      <Badge variant={item.count > 0 ? "secondary" : "outline"}>
                        {item.count}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={CircleCheckIcon}
                title="Nothing is waiting"
                description="Pending approvals, overdue invoices and open tickets will surface here as they appear."
              />
            )}
          </Panel>
        ) : null}
      </div>

      {showActivity || showAnnouncements ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {showActivity ? (
            <Panel
              title="Recent activity"
              action={
                <Link
                  href="/activity"
                  className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  View all
                </Link>
              }
            >
              {data.activity && data.activity.length > 0 ? (
                <ul className="divide-y">
                  {data.activity.map((entry) => (
                    <li key={entry.id} className="flex items-start justify-between gap-4 px-4 py-3">
                      <p className="text-xs leading-relaxed">{entry.summary}</p>
                      <span className="shrink-0 text-[11px] whitespace-nowrap text-muted-foreground">
                        {formatRelativeTime(entry.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={ActivityIcon}
                  title="No activity yet"
                  description="Check-ins, orders, approvals and collections will appear here as your team works."
                />
              )}
            </Panel>
          ) : null}

          {showAnnouncements ? (
            <Panel
              title="Announcements"
              action={
                <Link
                  href="/announcements"
                  className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  View all
                </Link>
              }
            >
              {data.announcements && data.announcements.length > 0 ? (
                <ul className="divide-y">
                  {data.announcements.map((announcement) => (
                    <li key={announcement.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs leading-relaxed">{announcement.title}</p>
                        {announcement.is_pinned ? (
                          <Badge variant="outline">Pinned</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatRelativeTime(announcement.publish_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={MegaphoneIcon}
                  title="No announcements yet"
                  description="Broadcasts from your administrators will appear here with their publish date."
                />
              )}
            </Panel>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
