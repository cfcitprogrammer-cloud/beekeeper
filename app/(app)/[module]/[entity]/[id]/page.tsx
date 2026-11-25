import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

import { ChildTable } from "@/components/child-table"
import { PageHeader } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { getEntity, childEntitiesFor } from "@/lib/entities/registry"
import { getEntityRow } from "@/lib/entities/server"

export const metadata: Metadata = { title: "Record details" }

export default async function EntityDetailPage({
  params,
}: {
  params: Promise<{ module: string; entity: string; id: string }>
}) {
  const session = await requireOrganization()
  const { module, entity, id } = await params

  const config = getEntity(entity)
  if (!config || config.module !== module) notFound()
  if (!session.can(config.module, "view")) redirect("/")

  const { row, error } = await getEntityRow(session, entity, id)
  if (error || !row) notFound()

  const children = childEntitiesFor(entity)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title={`${config.singular} details`}
        description="Manage this record and its related child records."
        action={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/${module}`} />}>
            Back to {module.replace(/-/g, " ")}
          </Button>
        }
      />

      <dl className="mt-6 grid gap-3 border bg-card p-4 sm:grid-cols-2">
        {config.columns.map((column) => (
          <div key={column} className="grid grid-cols-[130px_1fr] gap-2 text-xs">
            <dt className="text-muted-foreground">{column.replace(/_/g, " ")}</dt>
            <dd className="font-medium">{String(row[column] ?? "—")}</dd>
          </div>
        ))}
      </dl>

      {children.map((child) => (
        <ChildTable
          key={child.key}
          config={child}
          parentField={child.parent?.field ?? ""}
          parentId={id}
        />
      ))}

      {children.length === 0 ? (
        <p className="mt-6 text-xs text-muted-foreground">
          This record has no child records configured.
        </p>
      ) : null}
    </div>
  )
}