import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader, Panel } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { OpportunityBoard } from "./board"

export const metadata: Metadata = { title: "Opportunities" }

export default async function OpportunitiesPage() {
  const session = await requireOrganization()
  if (!session.can("opportunities", "view")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Panel title="No access">
          <p className="px-4 py-6 text-xs text-muted-foreground">
            Your role can&apos;t view opportunities.
          </p>
        </Panel>
      </div>
    )
  }

  const [{ data: stages }, { data: opportunities }] = await Promise.all([
    session.supabase
      .from("pipeline_stages")
      .select("id, name, probability, is_won, is_lost")
      .eq("org_id", session.profile.org_id ?? "")
      .order("sort_order"),
    session.supabase
      .from("opportunities")
      .select("id, name, amount, stage_id, expected_close")
      .eq("org_id", session.profile.org_id ?? "")
      .order("created_at", { ascending: false })
      .limit(300),
  ])

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Opportunities"
        description="Pipeline by stage. Move a card to update its stage; totals are the current expected value."
        action={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/opportunities?entity=opportunities" />}>
            Table view
          </Button>
        }
      />

      <div className="mt-6">
        <OpportunityBoard
          stages={(stages ?? []).map((stage) => ({
            id: stage.id,
            name: stage.name,
            probability: stage.probability,
            is_won: stage.is_won,
            is_lost: stage.is_lost,
          }))}
          opportunities={(opportunities ?? []).map((opportunity) => ({
            id: opportunity.id,
            name: opportunity.name,
            amount: opportunity.amount,
            stage_id: opportunity.stage_id,
            expected_close: opportunity.expected_close,
          }))}
          canUpdate={session.can("opportunities", "update")}
          currencyCode={session.organization?.currency_code ?? "USD"}
        />
      </div>
    </div>
  )
}
