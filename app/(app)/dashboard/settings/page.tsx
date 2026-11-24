import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader, Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization, type Session } from "@/lib/auth"
import { getDashboardWidgets } from "@/lib/dashboard"
import { WidgetSettings } from "./widget-settings"

export const metadata: Metadata = { title: "Dashboard settings" }

async function currentWidgets(session: Session) {
  const { data } = await session.supabase
    .from("dashboard_layouts")
    .select("widgets")
    .eq("org_id", session.organization?.id ?? "")
    .eq("user_id", session.user.id)
    .maybeSingle()
  return Array.isArray(data?.widgets) ? data.widgets.map(String) : []
}

export default async function DashboardSettingsPage() {
  const session = await requireOrganization()
  const [initial] = await Promise.all([currentWidgets(session), getDashboardWidgets(session)])

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Dashboard settings"
        description="Choose the widgets on your dashboard. Permissions still hide anything your role can't view."
        action={
          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            Back to Dashboard
          </Button>
        }
      />

      <div className="mt-6">
        <Panel title="Visible widgets" description="Saved for your account">
          <div className="px-4 py-4">
            <WidgetSettings initial={initial} />
          </div>
        </Panel>
      </div>
    </div>
  )
}
