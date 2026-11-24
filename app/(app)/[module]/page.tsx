import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, CircleCheckIcon, LockIcon } from "lucide-react"

import { PageHeader, Panel } from "@/components/panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { getModule, MODULES } from "@/lib/modules"

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
}: {
  params: Promise<{ module: string }>
}) {
  const session = await requireOrganization()
  const { module: slug } = await params
  const definition = getModule(slug)

  if (!definition) {
    notFound()
  }

  const permitted = session.can(definition.permission, "view")
  const phaseLabel = `Phase ${definition.phase}`

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title={definition.name}
        description={definition.description}
        action={
          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            <ArrowLeftIcon />
            Dashboard
          </Button>
        }
      />

      {!permitted ? (
        <div className="mt-6 border bg-card">
          <div className="flex flex-col items-start gap-3 px-4 py-8">
            <span className="flex size-8 items-center justify-center border bg-muted/40 text-muted-foreground">
              <LockIcon className="size-4" />
            </span>
            <h2 className="text-sm font-medium">This module isn&apos;t in your role</h2>
            <p className="max-w-[52ch] text-xs leading-relaxed text-muted-foreground">
              Your role doesn&apos;t include <span className="text-foreground">view</span>{" "}
              access to {definition.name.toLowerCase()}. An Administrator can grant it from
              Administration → Roles.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <Panel
            title="What this module will do"
            description="Schema, RLS and permissions are already in place."
          >
            <div className="px-4 py-4">
              <ul className="divide-y">
                {definition.capabilities.map((capability) => (
                  <li key={capability} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                    <CircleCheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="text-xs leading-relaxed">{capability}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t px-4 py-4">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                The workspace screens for this module are scheduled for {phaseLabel} in{" "}
                <span className="text-foreground">Progress.md</span>. The database tables,
                row-level security and permission checks already exist, so no data will be
                lost when the screens arrive.
              </p>
            </div>
          </Panel>

          <aside className="space-y-4">
            <div className="border bg-card p-4">
              <p className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground/75 uppercase">
                Status
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Schema live</Badge>
                <Badge variant="outline">{phaseLabel}</Badge>
              </div>
              <dl className="mt-4 space-y-2 text-[11px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Permission</dt>
                  <dd className="font-mono text-[10px] text-foreground">
                    {definition.permission}.view
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Tenant scoped</dt>
                  <dd className="text-foreground">Yes</dd>
                </div>
              </dl>
            </div>

            <div className="border bg-card p-4">
              <p className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground/75 uppercase">
                Other modules
              </p>
              <ul className="mt-2 space-y-1.5">
                {MODULES.filter(
                  (item) =>
                    item.slug !== definition.slug &&
                    item.group === definition.group &&
                    session.can(item.permission, "view"),
                )
                  .slice(0, 4)
                  .map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/${item.slug}`}
                        className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
