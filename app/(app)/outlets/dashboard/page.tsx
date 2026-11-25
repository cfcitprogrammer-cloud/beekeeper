import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"

export const metadata: Metadata = { title: "Outlets Dashboard" }

async function countTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  table: string,
  orgId: string,
  filters: Record<string, unknown> = {},
) {
  let query = supabase.from(table).select("id", { count: "exact", head: true }).eq("org_id", orgId)
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value)
  }
  const { count, error } = await query
  if (error) return null
  return count ?? 0
}

export default async function OutletsDashboardPage() {
  const session = await requireOrganization()
  if (!session.can("outlets", "view")) {
    return null
  }

  const orgId = session.profile.org_id ?? ""
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = session.supabase as any

  const activeOutlets = await countTable(supabase, "outlets", orgId, { status: "active" })

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Outlets Dashboard"
        description="Outlet locations, assignments, and configuration."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/outlets"
          className="border bg-card p-4 transition-colors hover:bg-muted/40"
        >
          <p className="text-[11px] font-medium text-muted-foreground">Active outlets</p>
          <p className="mt-3 text-2xl font-medium tracking-tight tabular-nums">
            {activeOutlets ?? "—"}
          </p>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/outlets" />}>
          Outlets
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/outlets/assignment" />}>
          Outlets assignment
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/outlets/types" />}>
          Outlets type
        </Button>
      </div>
    </div>
  )
}