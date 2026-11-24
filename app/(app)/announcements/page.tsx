import type { Metadata } from "next"
import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { PageHeader, Panel } from "@/components/panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"
import { ReadReceiptButton } from "./read-receipt-button"

export const metadata: Metadata = { title: "Announcements" }

export default async function AnnouncementsPage() {
  const session = await requireOrganization()
  if (!session.can("announcements", "view")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Panel title="No access">
          <p className="px-4 py-6 text-xs text-muted-foreground">
            Your role can&apos;t view announcements.
          </p>
        </Panel>
      </div>
    )
  }

  const [{ data: announcements }, { data: reads }] = await Promise.all([
    session.supabase
      .from("announcements")
      .select("id, title, body, is_pinned, requires_ack, publish_at, expires_at")
      .eq("org_id", session.organization?.id ?? "")
      .lte("publish_at", new Date().toISOString())
      .order("is_pinned", { ascending: false })
      .order("publish_at", { ascending: false })
      .limit(50),
    session.supabase
      .from("announcement_reads")
      .select("announcement_id, acknowledged_at")
      .eq("user_id", session.user.id),
  ])

  const acknowledged = new Set(
    (reads ?? []).filter((read) => read.acknowledged_at).map((read) => read.announcement_id),
  )

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Announcements"
        description="Broadcasts from your administrators. Acknowledgements are recorded per member."
        action={
          session.can("announcements", "create") ? (
            <Button size="sm" render={<Link href="/announcements?entity=announcements" />}>
              Manage announcements
            </Button>
          ) : null
        }
      />

      <div className="mt-6">
        <Panel title="Published" description={`${announcements?.length ?? 0} announcements`}>
          {announcements?.length ? (
            <ul className="divide-y">
              {announcements.map((announcement) => (
                <li key={announcement.id} className="px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-medium">{announcement.title}</h3>
                        {announcement.is_pinned ? <Badge variant="outline">Pinned</Badge> : null}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {new Date(announcement.publish_at).toLocaleString()}
                        {announcement.expires_at
                          ? ` · expires ${new Date(announcement.expires_at).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                    {announcement.requires_ack ? (
                      <ReadReceiptButton
                        id={announcement.id}
                        acknowledged={acknowledged.has(announcement.id)}
                      />
                    ) : null}
                  </div>
                  <p className="mt-3 max-w-[70ch] text-xs leading-relaxed whitespace-pre-wrap">
                    {announcement.body}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No announcements yet"
              description="Broadcasts published by your administrators will appear here."
            />
          )}
        </Panel>
      </div>
    </div>
  )
}
