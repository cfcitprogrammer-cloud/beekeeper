import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { EmptyState } from "@/components/empty-state"
import { EntityManager } from "@/components/entity-manager"
import { PageHeader } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"
import { listEntities } from "@/lib/entities/server"

const VIEWS: Record<string, { key: string; title: string; description: string }> = {
  "cash-advances": {
    key: "cash_advances",
    title: "Cash Advances",
    description: "Employee cash advances and their settlement status.",
  },
  "cash-advance-purposes": {
    key: "cash_advance_purposes",
    title: "Cash Advance Purposes",
    description: "Manage the purpose options available on cash advances.",
  },
  "business-development-funds": {
    key: "business_development_funds",
    title: "Business Development Funds",
    description: "Funds issued for business development activities.",
  },
  "field-expenses": {
    key: "field_expenses",
    title: "Field Expenses",
    description: "Expenses incurred by field staff during visits.",
  },
  "expense-items": {
    key: "expenses",
    title: "Expense Items",
    description: "Individual expense lines, linked to reports and categories.",
  },
  "expense-reports": {
    key: "expense_reports",
    title: "Expense Reports",
    description: "Employee expense reports and reimbursement status.",
  },
}

type PageProps = { params: Promise<{ entity: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { entity } = await params
  return { title: VIEWS[entity]?.title ?? "Expenses" }
}

export default async function ExpenseEntityPage({ params }: PageProps) {
  const session = await requireOrganization()
  if (!session.can("expenses", "view")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState title="No access" description="Your role can't view expenses." />
      </div>
    )
  }

  const { entity } = await params
  const view = VIEWS[entity]
  if (!view) notFound()

  const config = getEntity(view.key)
  if (!config) notFound()

  const { rows, total, error } = await listEntities(session, view.key, {
    page: 1,
    search: "",
    status: "all",
  })

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title={view.title}
        description={view.description}
        action={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/expenses" />}>
            All expenses
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
