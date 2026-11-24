import type { Metadata } from "next"
import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { PageHeader, Panel } from "@/components/panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { isReportView, reportColumns } from "@/lib/reports"

export const metadata: Metadata = { title: "Reports" }

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ report?: string }>
}) {
  const session = await requireOrganization()
  if (!session.can("reports", "view")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Panel title="No access">
          <p className="px-4 py-6 text-xs text-muted-foreground">Your role can&apos;t view reports.</p>
        </Panel>
      </div>
    )
  }

  const { report: selectedId } = await searchParams
  const orgId = session.organization?.id ?? ""

  const [{ data: definitions }, { data: schedules }] = await Promise.all([
    session.supabase
      .from("report_definitions")
      .select("id, name, description, data_source, config, is_system, visibility")
      .or(`org_id.is.null,org_id.eq.${orgId}`)
      .order("is_system", { ascending: false })
      .order("name"),
    session.supabase
      .from("report_schedules")
      .select("id, report_id, cron, format, is_active")
      .eq("org_id", orgId),
  ])

  const selected = definitions?.find((definition) => definition.id === selectedId)
  let rows: Record<string, unknown>[] = []
  let columns: string[] = []
  let previewError: string | null = null

  if (selected) {
    if (!isReportView(selected.data_source)) {
      previewError = "This report points at a view that is not available."
    } else {
      columns = reportColumns(selected.data_source) as string[]
      const config = selected.config
      const configured =
        typeof config === "object" && config !== null && !Array.isArray(config) && Array.isArray(config.columns)
          ? config.columns.map(String)
          : []
      if (configured.length) columns = columns.filter((column) => configured.includes(column))

      // Dynamic view name comes from the whitelist above, never from raw input.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (session.supabase as any)
        .from(selected.data_source)
        .select("*")
        .limit(50)
      if (error) previewError = error.message
      else rows = (data ?? []) as Record<string, unknown>[]
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Reports"
        description="Prebuilt operational reports and custom reports over the curated views."
        action={
          <div className="flex gap-2">
            {session.can("reports", "create") ? (
              <Button size="sm" nativeButton={false} render={<Link href="/reports/builder" />}>
                New report
              </Button>
            ) : null}
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/reports?entity=report_definitions" />}>
              Manage definitions
            </Button>
          </div>
        }
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Panel title="Saved reports" description={`${definitions?.length ?? 0} available`}>
          <ul className="divide-y">
            {(definitions ?? []).map((definition) => (
              <li key={definition.id}>
                <Link
                  href={`/reports?report=${definition.id}`}
                  className="block px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium">{definition.name}</span>
                    {definition.is_system ? <Badge variant="outline">System</Badge> : null}
                  </span>
                  {definition.description ? (
                    <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                      {definition.description}
                    </span>
                  ) : null}
                  <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                    {definition.data_source}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={selected?.name ?? "Report preview"}
          description={selected ? `Up to 50 rows from ${selected.data_source}` : "Choose a report to preview its data"}
          action={
            selected && !previewError ? (
              <Button
                variant="outline"
                size="xs"
                nativeButton={false} render={<a href={`/reports/export?report=${selected.id}`} download />}
              >
                Export CSV
              </Button>
            ) : null
          }
        >
          {previewError ? (
            <EmptyState title="Preview unavailable" description={previewError} />
          ) : !selected ? (
            <EmptyState
              title="No report selected"
              description="Pick a report from the list to see its current data. Empty results mean your organization has no matching records yet."
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No rows yet"
              description="This view is live, but your organization has no matching records."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b bg-muted/30 text-left">
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="px-3 py-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase whitespace-nowrap"
                      >
                        {column.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row, index) => (
                    <tr key={index}>
                      {columns.map((column) => (
                        <td key={column} className="px-3 py-2 tabular-nums whitespace-nowrap">
                          {row[column] === null || row[column] === undefined
                            ? "—"
                            : String(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {schedules?.length ? (
        <Panel title="Schedules" description="Configured exports for this organization" className="mt-4">
          <ul className="divide-y">
            {schedules.map((schedule) => (
              <li key={schedule.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs">
                <span className="font-mono text-[11px]">{schedule.cron}</span>
                <span className="text-muted-foreground">
                  {schedule.format} · {schedule.is_active ? "active" : "paused"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  )
}
