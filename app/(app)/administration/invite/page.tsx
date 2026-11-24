import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader, Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { InviteUserForm } from "./invite-user-form"

export const metadata: Metadata = { title: "Invite a user" }

export default async function InviteUserPage() {
  const session = await requireOrganization()
  if (!session.can("administration", "create")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Panel title="No access">
          <p className="px-4 py-6 text-xs text-muted-foreground">
            Your role can&apos;t add users to this organization.
          </p>
        </Panel>
      </div>
    )
  }

  const { data: roles } = await session.supabase
    .from("roles")
    .select("id, name")
    .eq("org_id", session.profile.org_id ?? "")
    .order("name")

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Invite a user"
        description="The invitee joins your organization and inherits the role you choose."
        action={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/administration" />}>
            Back to Administration
          </Button>
        }
      />

      <div className="mt-6">
        <Panel title="Invitation details" description="Sent from your configured Supabase email sender.">
          <div className="px-4 py-4">
            <InviteUserForm
              roles={(roles ?? []).map((role) => ({ value: role.id, label: role.name }))}
            />
          </div>
        </Panel>
      </div>
    </div>
  )
}
