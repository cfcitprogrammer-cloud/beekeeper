import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader, Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { RolePermissionsEditor } from "./role-permissions-editor"

export const metadata: Metadata = { title: "Role permissions" }

export default async function RolesPage() {
  const session = await requireOrganization()
  const canUpdate = session.can("administration", "update")

  if (!session.can("administration", "view")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Panel title="No access">
          <p className="px-4 py-6 text-xs text-muted-foreground">
            Your role can&apos;t view Administration.
          </p>
        </Panel>
      </div>
    )
  }

  const [{ data: roles }, { data: permissions }, { data: grants }] = await Promise.all([
    session.supabase.from("roles").select("id, name").eq("org_id", session.profile.org_id ?? "").order("name"),
    session.supabase.from("permissions").select("id, module, action").order("module").order("action"),
    session.supabase.from("role_permissions").select("role_id, permission_id, data_scope"),
  ])

  const initialGrants: Record<string, { ids: string[]; scope: string }> = {}
  for (const grant of grants ?? []) {
    const entry = (initialGrants[grant.role_id] ??= { ids: [], scope: "org" })
    entry.ids.push(grant.permission_id)
    if (entry.ids.length === 1) entry.scope = grant.data_scope ?? "org"
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Role permissions"
        description="Module and action access applies to every member with the role. Data scope is stored for application-layer filtering."
        action={
          <Button variant="outline" size="sm" render={<Link href="/administration" />}>
            Back to Administration
          </Button>
        }
      />

      <div className="mt-6">
        <Panel title="Permission matrix" description="180 catalogue permissions across all modules">
          <div className="px-4 py-4">
            <RolePermissionsEditor
              roles={(roles ?? []).map((role) => ({ id: role.id, name: role.name }))}
              permissions={(permissions ?? []).map((permission) => ({
                id: permission.id,
                module: permission.module,
                action: permission.action,
              }))}
              initialGrants={initialGrants}
              canUpdate={canUpdate}
            />
          </div>
        </Panel>
      </div>
    </div>
  )
}
