import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"

export const metadata: Metadata = { title: "Employee Dashboard" }

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

export default async function EmployeeDashboardPage() {
  const session = await requireOrganization()
  if (!session.can("employees", "view")) {
    return null
  }

  const orgId = session.profile.org_id ?? ""
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = session.supabase as any

  const [activeEmployees, fieldStaff, departments, positions] = await Promise.all([
    countTable(supabase, "employees", orgId, { status: "active" }),
    countTable(supabase, "employees", orgId, { status: "active", is_field_staff: true }),
    countTable(supabase, "departments", orgId),
    countTable(supabase, "positions", orgId),
  ])

  const metrics = [
    { label: "Active employees", value: activeEmployees, href: "/employees" },
    { label: "Field staff", value: fieldStaff, href: "/employees" },
    { label: "Departments", value: departments, href: "/employees/departments" },
    { label: "Positions", value: positions, href: "/employees/positions" },
  ]

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Employee Dashboard"
        description="Employee records, structure, and 201 files."
        action={
          session.can("employees", "create") ? (
            <Button size="sm" nativeButton={false} render={<Link href="/employees/new" />}>
              New employee
            </Button>
          ) : null
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className="border bg-card p-4 transition-colors hover:bg-muted/40"
          >
            <p className="text-[11px] font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-3 text-2xl font-medium tracking-tight tabular-nums">
              {metric.value ?? "—"}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/employees" />}>
          Employees
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/employees/chart" />}>
          Org chart
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/employees/departments" />}>
          Departments
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/employees/positions" />}>
          Positions
        </Button>
      </div>
    </div>
  )
}