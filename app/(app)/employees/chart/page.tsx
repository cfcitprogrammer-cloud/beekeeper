import type { Metadata } from "next"
import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { PageHeader, Panel } from "@/components/panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"

export const metadata: Metadata = { title: "Organization chart" }

type EmployeeNode = {
  id: string
  name: string
  position: string | null
  status: string
  children: EmployeeNode[]
}

function TreeNode({ node, depth = 0 }: { node: EmployeeNode; depth?: number }) {
  return (
    <li>
      <div
        className="flex items-center gap-3 border-b py-2.5 last:border-b-0"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">{node.name}</p>
          {node.position ? (
            <p className="text-[11px] text-muted-foreground">{node.position}</p>
          ) : null}
        </div>
        {node.status !== "active" ? (
          <Badge variant="outline" className="ml-auto">
            {node.status.replace("_", " ")}
          </Badge>
        ) : null}
      </div>
      {node.children.length ? (
        <ul>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

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

  const [{ data: employees }, { data: positions }] = await Promise.all([
    session.supabase
      .from("employees")
      .select("id, first_name, last_name, manager_id, position_id, status")
      .eq("org_id", session.profile.org_id ?? "")
      .order("first_name"),
    session.supabase.from("positions").select("id, title").eq("org_id", session.profile.org_id ?? ""),
  ])

  const positionNames = new Map((positions ?? []).map((position) => [position.id, position.title]))
  const nodes = new Map<string, EmployeeNode>(
    (employees ?? []).map((employee) => [
      employee.id,
      {
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`.trim(),
        position: employee.position_id ? (positionNames.get(employee.position_id) ?? null) : null,
        status: employee.status,
        children: [],
      },
    ]),
  )

  const roots: EmployeeNode[] = []
  for (const employee of employees ?? []) {
    const node = nodes.get(employee.id)
    if (!node) continue
    const parent = employee.manager_id ? nodes.get(employee.manager_id) : null
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Organization chart"
        description="Reporting lines from the employee master. Assign managers from Employees to build the tree."
        action={
          <Button variant="outline" size="sm" render={<Link href="/employees" />}>
            Back to Employees
          </Button>
        }
      />

      <div className="mt-6">
        <Panel title="Reporting lines" description={`${employees?.length ?? 0} employees`}>
          {roots.length ? (
            <ul className="px-4 py-2">
              {roots.map((node) => (
                <TreeNode key={node.id} node={node} />
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No employees yet"
              description="Add employees and assign their managers to see the reporting structure here."
            />
          )}
        </Panel>
      </div>
    </div>
  )
}
