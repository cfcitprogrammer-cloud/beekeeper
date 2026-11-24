import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader, Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { FormBuilder } from "../builder-form"

export const metadata: Metadata = { title: "Forms builder" }

export default async function FormsBuilderPage() {
  const session = await requireOrganization()
  if (!session.can("forms", "create")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Panel title="No access">
          <p className="px-4 py-6 text-xs text-muted-foreground">Your role can&apos;t create forms.</p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Forms builder"
        description="Define fields for offline-capable surveys, audits and checklists. New forms start as drafts."
        action={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/forms" />}>
            Back to Forms
          </Button>
        }
      />

      <div className="mt-6">
        <Panel title="New form" description="Submissions use the field keys defined here">
          <div className="px-4 py-4">
            <FormBuilder />
          </div>
        </Panel>
      </div>
    </div>
  )
}
