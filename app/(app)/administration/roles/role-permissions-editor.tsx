"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { setRolePermissions } from "../actions"

type Permission = { id: string; module: string; action: string }
type RoleGrants = Record<string, { ids: string[]; scope: string }>

const ACTIONS = ["view", "create", "update", "delete", "approve", "export"]

export function RolePermissionsEditor({
  roles,
  permissions,
  initialGrants,
  canUpdate,
}: {
  roles: { id: string; name: string }[]
  permissions: Permission[]
  initialGrants: RoleGrants
  canUpdate: boolean
}) {
  const [roleId, setRoleId] = React.useState(roles[0]?.id ?? "")
  const [selected, setSelected] = React.useState<Set<string>>(
    new Set(initialGrants[roles[0]?.id ?? ""]?.ids ?? []),
  )
  const [scope, setScope] = React.useState(
    initialGrants[roles[0]?.id ?? ""]?.scope ?? "org",
  )
  const [pending, startTransition] = React.useTransition()

  const modules = Array.from(new Set(permissions.map((permission) => permission.module))).sort()

  function changeRole(nextId: string) {
    setRoleId(nextId)
    setSelected(new Set(initialGrants[nextId]?.ids ?? []))
    setScope(initialGrants[nextId]?.scope ?? "org")
  }

  function toggle(permissionId: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(permissionId)) next.delete(permissionId)
      else next.add(permissionId)
      return next
    })
  }

  function save() {
    if (!roleId) return
    startTransition(async () => {
      const result = await setRolePermissions(
        roleId,
        Array.from(selected),
        Object.fromEntries(Array.from(selected).map((id) => [id, scope])),
      )
      if (!result.ok) {
        toast.error(result.error ?? "Could not save permissions.")
        return
      }
      toast.success("Role permissions saved.")
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="role" className="text-xs">
            Role
          </label>
          <select
            id="role"
            value={roleId}
            onChange={(event) => changeRole(event.target.value)}
            className="h-8 min-w-48 rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="scope" className="text-xs">
            Default data scope
          </label>
          <select
            id="scope"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            className="h-8 rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
          >
            {["own", "team", "territory", "org"].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <Button size="sm" onClick={save} disabled={!canUpdate || pending}>
          {pending ? "Saving…" : "Save permissions"}
        </Button>
        <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
          {selected.size} of {permissions.length} granted
        </span>
      </div>

      <div className="overflow-x-auto border">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b bg-muted/30 text-left">
              <th className="px-3 py-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                Module
              </th>
              {ACTIONS.map((action) => (
                <th
                  key={action}
                  className="px-3 py-2 text-center text-[10px] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {modules.map((moduleName) => (
              <tr key={moduleName}>
                <td className="px-3 py-2 font-mono text-[11px] whitespace-nowrap">
                  {moduleName}
                </td>
                {ACTIONS.map((action) => {
                  const permission = permissions.find(
                    (item) => item.module === moduleName && item.action === action,
                  )
                  if (!permission) return <td key={action} className="px-3 py-2 text-center text-muted-foreground">—</td>
                  return (
                    <td key={action} className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selected.has(permission.id)}
                        onChange={() => toggle(permission.id)}
                        disabled={!canUpdate}
                        aria-label={`${moduleName} ${action}`}
                        className="size-3.5 accent-[var(--primary)]"
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
