import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { LockIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { EntityManager } from "@/components/entity-manager"
import { FieldPanel } from "@/components/field-panel"
import { PageHeader } from "@/components/panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { entitiesForModule } from "@/lib/entities/registry"
import { listEntities } from "@/lib/entities/server"
import { getModule } from "@/lib/modules"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>
}): Promise<Metadata> {
  const { module: slug } = await params
  const definition = getModule(slug)
  return { title: definition?.name ?? "Module" }
}

export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>
  searchParams: Promise<{ entity?: string }>
}) {
  const session = await requireOrganization()
  const { module: slug } = await params
  const definition = getModule(slug)

  if (!definition) notFound()

  if (!session.can(definition.permission, "view")) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <PageHeader title={definition.name} description={definition.description} />
        <div className="mt-6 border bg-card">
          <EmptyState
            icon={LockIcon}
            title="This module isn't in your role"
            description={`Your role doesn't include view access to ${definition.name.toLowerCase()}. An Administrator can grant it from Administration → Roles.`}
          />
        </div>
      </div>
    )
  }

  const configs = entitiesForModule(definition.permission)
  const { entity } = await searchParams
  const config = configs.find((item) => item.key === entity) ?? configs[0]

  if (!config) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <PageHeader title={definition.name} description={definition.description} />
        <div className="mt-6 border bg-card">
          <EmptyState
            title="No data views yet"
            description="This module has permissions and schema in place, but no data views have been configured."
          />
        </div>
      </div>
    )
  }

  const { rows, total, error } = await listEntities(session, config.key, {
    page: 1,
    search: "",
    status: "all",
  })

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title={definition.name}
        description={definition.description}
        action={
          <div className="flex flex-wrap justify-end gap-2">
            {slug === "administration" ? (
              <>
                <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/administration/roles" />}>
                  Role permissions
                </Button>
                <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/administration/invite" />}>
                  Invite user
                </Button>
                <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/administration/settings" />}>
                  Settings
                </Button>
              </>
            ) : null}
            {slug === "employees" ? (
              <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/employees/chart" />}>
                Org chart
              </Button>
            ) : null}
            {slug === "forms" && session.can("forms", "create") ? (
              <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/forms/builder" />}>
                New form
              </Button>
            ) : null}
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/dashboard" />}>
              Dashboard
            </Button>
          </div>
        }
      />

      {configs.length > 1 ? (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b">
          {configs.map((item) => {
            const active = item.key === config.key
            return (
              <Link
                key={item.key}
                href={`/${slug}?entity=${item.key}`}
                className={
                  active
                    ? "-mb-px border-b-2 border-primary pb-2 text-xs font-medium text-foreground"
                    : "pb-2 text-xs text-muted-foreground hover:text-foreground"
                }
              >
                {item.title}
              </Link>
            )
          })}
        </div>
      ) : null}

      {["visits", "attendance", "orders", "billing"].includes(slug) ? (
        <div className="mt-5">
          <FieldPanel session={session} slug={slug} />
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium">{config.title}</h2>
        {config.readOnly ? <Badge variant="outline">Read only</Badge> : null}
      </div>

      <div className="mt-2">
        {error ? (
          <EmptyState
            title="This view couldn't load"
            description={error}
          />
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
