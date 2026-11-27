import type { Metadata } from "next"
import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { OrgChart } from "@/components/org-chart"
import { PageHeader, Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"

export const metadata: Metadata = { title: "Organization chart" }

export default async function OrgChartPage() {
  const session = await requireOrganization()
  if (!session.can("employees", "view")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Panel title="No access">
          <p className="px-4 py-6 text-xs text-muted-foreground">
            Your role can&apos;t view employees.
          </p>
        </Panel>
      </div>
    )
  }

  const orgId = session.profile.org_id ?? ""

  const [{ data: employees }, { data: departments }, { data: positions }] =
    await Promise.all([
      session.supabase
        .from("employees")
        .select(
          "id, first_name, middle_name, last_name, name_suffix, department_id, position_id, status"
        )
        .eq("org_id", orgId)
        .order("first_name"),
      session.supabase
        .from("departments")
        .select("id, name, parent_id")
        .eq("org_id", orgId)
        .order("name"),
      session.supabase.from("positions").select("id, title").eq("org_id", orgId),
    ])

  const positionNames = new Map(
    (positions ?? []).map((position) => [position.id, position.title])
  )

  const orgEmployees = (employees ?? []).map((employee) => ({
    id: employee.id,
    name: [employee.first_name, employee.middle_name, employee.last_name, employee.name_suffix]
      .filter(Boolean)
      .join(" "),
    departmentId: employee.department_id,
    position: employee.position_id ? positionNames.get(employee.position_id) ?? null : null,
    status: employee.status,
  }))

  const orgDepartments = (departments ?? []).map((department) => ({
    id: department.id,
    name: department.name,
    parentId: department.parent_id,
  }))

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Organization chart"
        description="Employees grouped by department. Assign departments from Employees to build the chart."
        action={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/employees" />}>
            Back to Employees
          </Button>
        }
      />

      <div className="mt-6">
        <Panel
          title="Departments & people"
          description={`${orgEmployees.length} employees across ${orgDepartments.length} departments`}
        >
          {orgEmployees.length ? (
            <div className="p-3">
              <OrgChart
                organizationName={session.organization?.name ?? "Organization"}
                departments={orgDepartments}
                employees={orgEmployees}
              />
            </div>
          ) : (
            <EmptyState
              title="No employees yet"
              description="Add employees and assign their departments to see them here."
            />
          )}
        </Panel>
      </div>
    </div>
  )
}
