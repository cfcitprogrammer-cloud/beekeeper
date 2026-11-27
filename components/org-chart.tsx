"use client"

import * as React from "react"
import type { NestedNode, TreeOptions } from "apextree"

type OrgDepartment = {
  id: string
  name: string
  parentId: string | null
}

type OrgEmployee = {
  id: string
  name: string
  departmentId: string | null
  position: string | null
  status: string
}

type NodeData = {
  name: string
  title: string
  subtitle?: string
  initials: string
  accentColor: string
}

const COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#f97316",
  "#10b981",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f59e0b",
]

function colorFor(id: string) {
  let hash = 0
  for (const char of id) hash = (hash + char.charCodeAt(0)) % COLORS.length
  return COLORS[hash]
}

function initialsFor(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  )
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function buildTree(
  organizationName: string,
  departments: OrgDepartment[],
  employees: OrgEmployee[]
): NestedNode<NodeData> {
  const departmentById = new Map(departments.map((item) => [item.id, item]))
  const childrenByParent = new Map<string, OrgDepartment[]>()
  for (const department of departments) {
    const key = department.parentId ?? "root"
    const existing = childrenByParent.get(key) ?? []
    existing.push(department)
    childrenByParent.set(key, existing)
  }

  const employeesByDepartment = new Map<string, OrgEmployee[]>()
  for (const employee of employees) {
    const key = employee.departmentId ?? "unassigned"
    const existing = employeesByDepartment.get(key) ?? []
    existing.push(employee)
    employeesByDepartment.set(key, existing)
  }

  const employeeNode = (employee: OrgEmployee): NestedNode<NodeData> => ({
    id: `emp-${employee.id}`,
    name: employee.name,
    data: {
      name: employee.name,
      title: employee.position ?? "Employee",
      subtitle: employee.status.replace(/_/g, " "),
      initials: initialsFor(employee.name),
      accentColor: colorFor(employee.id),
    },
    children: [],
  })

  const departmentNode = (department: OrgDepartment): NestedNode<NodeData> => {
    const people = employeesByDepartment.get(department.id) ?? []
    const childDepartments = childrenByParent.get(department.id) ?? []
    return {
      id: `dept-${department.id}`,
      name: department.name,
      data: {
        name: department.name,
        title: "Department",
        subtitle: `${people.length} ${people.length === 1 ? "employee" : "employees"}`,
        initials: initialsFor(department.name),
        accentColor: colorFor(department.id),
      },
      children: [
        ...people.map(employeeNode),
        ...childDepartments.map(departmentNode),
      ],
    }
  }

  const unassigned = employeesByDepartment.get("unassigned") ?? []
  const rootDepartments = departments.filter(
    (department) => !department.parentId || !departmentById.has(department.parentId)
  )

  const rootInitials = initialsFor(organizationName)
  return {
    id: "org-root",
    name: organizationName,
    data: {
      name: organizationName,
      title: "Organization",
      subtitle: `${employees.length} employees`,
      initials: rootInitials,
      accentColor: "#334155",
    },
    children: [
      ...rootDepartments.map(departmentNode),
      ...(unassigned.length
        ? [
            {
              id: "unassigned",
              name: "Unassigned",
              data: {
                name: "Unassigned",
                title: "No department",
                subtitle: `${unassigned.length} ${unassigned.length === 1 ? "employee" : "employees"}`,
                initials: "—",
                accentColor: "#64748b",
              },
              children: unassigned.map(employeeNode),
            } satisfies NestedNode<NodeData>,
          ]
        : []),
    ],
  }
}

export function OrgChart({
  organizationName,
  departments,
  employees,
}: {
  organizationName: string
  departments: OrgDepartment[]
  employees: OrgEmployee[]
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const data = React.useMemo(
    () => buildTree(organizationName, departments, employees),
    [organizationName, departments, employees]
  )

  React.useEffect(() => {
    let disposed = false
    let tree: InstanceType<typeof import("apextree")["ApexTree"]> | null = null

    const options: Partial<TreeOptions> = {
      direction: "top",
      contentKey: "data",
      viewPortWidth: 1600,
      viewPortHeight: 1000,
      maxZoomNodeSpan: 14,
      nodeWidth: 180,
      nodeHeight: 84,
      childrenSpacing: 50,
      siblingSpacing: 16,
      paddingX: 40,
      paddingY: 40,
      edgeStyle: "curved",
      edgeColor: "#cbd5e1",
      nodeBGColor: "#ffffff",
      borderRadius: "8px",
      borderColor: "#e2e8f0",
      enableToolbar: true,
      enableSearch: true,
      enableZoomPan: true,
      nodeTemplate: (content) => {
        const node = content as NodeData
        const subtitle = node.subtitle
          ? `<span style="font-size:9px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(node.subtitle)}</span>`
          : ""
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px;box-sizing:border-box;height:100%;font-family:inherit;">
          <span style="display:flex;width:32px;height:32px;flex:0 0 32px;align-items:center;justify-content:center;border-radius:50%;background:${escapeHtml(node.accentColor)};color:#ffffff;font-size:11px;font-weight:600;">${escapeHtml(node.initials)}</span>
          <span style="display:flex;flex-direction:column;min-width:0;text-align:left;">
            <span style="font-size:12px;font-weight:600;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(node.name)}</span>
            <span style="font-size:10px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(node.title)}</span>
            ${subtitle}
          </span>
        </div>`
      },
    }

    void (async () => {
      const { ApexTree } = await import("apextree")
      if (disposed || !containerRef.current) return
      const license = process.env.NEXT_PUBLIC_APEXTREE_LICENSE
      if (license) ApexTree.setLicense(license)
      tree = new ApexTree(containerRef.current, options)
      tree.render(data as unknown as NestedNode)
      tree.graph.fitScreen()
    })()

    return () => {
      disposed = true
      tree?.destroy()
    }
  }, [data])

  return <div ref={containerRef} className="min-h-[420px] w-full" />
}
