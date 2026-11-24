import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader, Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { entities } from "@/lib/entities/registry"
import { ImportForm } from "./import-form"

export const metadata: Metadata = { title: "Import & export" }

export default async function ImportExportPage() {
  const session = await requireOrganization()
  const writable = Object.values(entities)
    .filter((config) => !config.readOnly && session.can(config.module, "create"))
    .map((config) => ({ value: config.key, label: `${config.title} · ${config.module}` }))

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Import & export"
        description="Paste CSV rows into a permitted entity. Every imported row uses the same validation, tenant checks and audit trail as manual entry."
        action={
          <Button variant="outline" size="sm" render={<Link href="/reports" />}>
            Export reports
          </Button>
        }
      />

      <div className="mt-6">
        <Panel title="CSV import" description="First row must contain field names">
          <div className="px-4 py-4">
            {writable.length ? (
              <ImportForm entities={writable} />
            ) : (
              <p className="text-xs text-muted-foreground">
                Your role can&apos;t create records in any module.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}
