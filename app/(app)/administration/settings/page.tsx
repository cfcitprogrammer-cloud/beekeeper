import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader, Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { OrganizationSettingsForm } from "./organization-settings-form"

export const metadata: Metadata = { title: "Organization settings" }

function supportedTimezones() {
  const fn = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
    .supportedValuesOf
  return fn?.("timeZone") ?? ["UTC"]
}

export default async function OrganizationSettingsPage() {
  const session = await requireOrganization()
  if (!session.can("administration", "update")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Panel title="No access">
          <p className="px-4 py-6 text-xs text-muted-foreground">
            Your role can&apos;t change organization settings.
          </p>
        </Panel>
      </div>
    )
  }

  const organization = session.organization
  if (!organization) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Panel title="No organization">
          <p className="px-4 py-6 text-xs text-muted-foreground">
            Complete onboarding before changing settings.
          </p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Organization settings"
        description="Identity, timezone and currency used across every module."
        action={
          <Button variant="outline" size="sm" render={<Link href="/administration" />}>
            Back to Administration
          </Button>
        }
      />

      <div className="mt-6">
        <Panel title="Workspace identity" description="Applies to all members of this tenant">
          <div className="px-4 py-4">
            <OrganizationSettingsForm
              name={organization.name}
              code={organization.code}
              timezone={organization.timezone}
              currencyCode={organization.currency_code}
              timezones={supportedTimezones()}
            />
          </div>
        </Panel>
      </div>
    </div>
  )
}
