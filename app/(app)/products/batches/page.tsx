import type { Metadata } from "next"
import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { EntityManager } from "@/components/entity-manager"
import { PageHeader } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"
import { listEntities } from "@/lib/entities/server"

export const metadata: Metadata = { title: "Batches" }

export default async function BatchesPage() {
  const session = await requireOrganization()
  if (!session.can("products", "view")) return null

  const config = getEntity("batches")
  if (!config) return null

  const { rows, total, error } = await listEntities(session, "batches", {
    page: 1,
    search: "",
    status: "all",
  })

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Batches"
        description="Manage product batches."
        action={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/products" />}>
            Back to products
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