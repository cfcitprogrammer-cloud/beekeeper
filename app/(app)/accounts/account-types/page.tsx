import type { Metadata } from "next"
import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { EntityManager } from "@/components/entity-manager"
import { PageHeader } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"
import { listEntities } from "@/lib/entities/server"

export const metadata: Metadata = { title: "Account Types" }

export default async function AccountTypesPage() {
  const session = await requireOrganization()
  if (!session.can("accounts", "view")) {
    return null
  }

  const config = getEntity("account_types")
  if (!config) {
    return null
  }

  const { rows, total, error } = await listEntities(session, "account_types", {
    page: 1,
    search: "",
    status: "all",
  })

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Account Types"
        description="Manage the account types available on customer accounts."
        action={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/accounts" />}>
            Back to accounts
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
