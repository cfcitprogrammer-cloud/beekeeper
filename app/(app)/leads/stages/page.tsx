import type { Metadata } from "next"
import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { EntityManager } from "@/components/entity-manager"
import { PageHeader } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"
import { listEntities } from "@/lib/entities/server"

export const metadata: Metadata = { title: "Lead Stages" }

export default async function LeadStagesPage() {
  const session = await requireOrganization()
  if (!session.can("leads", "view")) {
    return null
  }

  const config = getEntity("lead_stages")
  if (!config) {
    return null
  }

  const { rows, total, error } = await listEntities(session, "lead_stages", {
    page: 1,
    search: "",
    status: "all",
  })

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Lead Stages"
        description="Manage the stages available on leads."
        action={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/leads" />}>
            Back to leads
          </Button>
        }
      />
      <div className="mt-4">
        {error ? (
          <EmptyState title="This view couldn't load" description={error} />
        ) : (
          <EntityManager
            key={config.key}
            config={config}
            initialRows={rows}
            initialTotal={total}
            canCreate={!config.readOnly && session.can(config.module, "create")}
            canUpdate={!config.readOnly && session.can(config.module, "update")}
            canDelete={!config.readOnly && session.can(config.module, "delete")}
          />
        )}
      </div>
    </div>
  )
}
