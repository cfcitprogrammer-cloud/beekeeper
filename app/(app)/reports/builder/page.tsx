import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader, Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { ReportBuilderForm } from "../builder-form"

export const metadata: Metadata = { title: "Reports builder" }

export default async function ReportsBuilderPage() {
  const session = await requireOrganization()
  if (!session.can("reports", "create")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Panel title="No access">
          <p className="px-4 py-6 text-xs text-muted-foreground">
            Your role can&apos;t create reports.
          </p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Reports builder"
        description="Choose an approved view, the columns you need and a chart. Saved reports stay tenant-scoped."
        action={
          <Button variant="outline" size="sm" render={<Link href="/reports" />}>
            Back to Reports
          </Button>
        }
      />

      <div className="mt-6">
        <Panel title="New report" description="Only curated reporting views can be used as sources">
          <div className="px-4 py-4">
            <ReportBuilderForm />
          </div>
        </Panel>
      </div>
    </div>
  )
}
