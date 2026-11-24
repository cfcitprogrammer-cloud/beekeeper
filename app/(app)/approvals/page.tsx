import type { Metadata } from "next"

import { EmptyState } from "@/components/empty-state"
import { PageHeader, Panel } from "@/components/panel"
import { requireOrganization } from "@/lib/auth"
import { ApprovalQueue } from "./queue"

export const metadata: Metadata = { title: "Approvals" }

export default async function ApprovalsPage() {
  const session = await requireOrganization()
  if (!session.can("approvals", "view")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Panel title="No access">
          <p className="px-4 py-6 text-xs text-muted-foreground">
            Your role can&apos;t view approvals.
          </p>
        </Panel>
      </div>
    )
  }

  const [{ data: pending }, { data: recent }] = await Promise.all([
    session.supabase
      .from("approvals")
      .select("id, entity_type, entity_id, level, created_at")
      .eq("org_id", session.profile.org_id ?? "")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50),
    session.supabase
      .from("approvals")
      .select("id, status, entity_type, level, acted_at")
      .eq("org_id", session.profile.org_id ?? "")
      .in("status", ["approved", "rejected"])
      .order("acted_at", { ascending: false })
      .limit(10),
  ])

  const canDecide = session.can("approvals", "approve") || session.can("approvals", "update")

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Approvals"
        description="One queue for leave, expenses, orders and attendance corrections."
      />

      <div className="mt-6 space-y-4">
        <Panel title="Waiting on a decision" description={`${pending?.length ?? 0} pending`}>
          {pending?.length ? (
            <ApprovalQueue items={pending} canDecide={canDecide} />
          ) : (
            <EmptyState
              title="Nothing is waiting"
              description="New approval requests will appear here as your team submits leave, expenses or orders."
            />
          )}
        </Panel>

        <Panel title="Recent decisions" description="Last 10 approvals">
          {recent?.length ? (
            <ul className="divide-y">
              {recent.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="text-xs">
                    {item.entity_type.replace(/_/g, " ")} · level {item.level}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.status} · {item.acted_at ? new Date(item.acted_at).toLocaleString() : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No decisions yet" description="Approved and rejected requests will be listed here." />
          )}
        </Panel>
      </div>
    </div>
  )
}
