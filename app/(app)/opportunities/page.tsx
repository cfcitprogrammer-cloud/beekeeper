import type { Metadata } from "next"
import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { EntityManager } from "@/components/entity-manager"
import { PageHeader } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"
import { listEntities } from "@/lib/entities/server"

export const metadata: Metadata = { title: "Opportunities" }

export default async function OpportunitiesPage() {
  const session = await requireOrganization()
  if (!session.can("opportunities", "view")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          title="No access"
          description="Your role can't view opportunities."
        />
      </div>
    )
  }

  const config = getEntity("opportunities")
  if (!config) return null

  const { rows, total, error } = await listEntities(session, "opportunities", {
    page: 1,
    search: "",
    status: "all",
  })

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Opportunities"
        description="All pipeline records in a sortable, filterable table."
        action={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/opportunities/dashboard" />}>
            Pipeline dashboard
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
