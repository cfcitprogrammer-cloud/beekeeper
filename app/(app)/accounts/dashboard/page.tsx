import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"

export const metadata: Metadata = { title: "Accounts Dashboard" }

async function countTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  table: string,
  orgId: string,
  filters: Record<string, unknown> = {},
) {
  let query = supabase.from(table).select("id", { count: "exact", head: true }).eq("org_id", orgId)
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value)
  }
  const { count, error } = await query
  if (error) return null
  return count ?? 0
}

export default async function AccountsDashboardPage() {
  const session = await requireOrganization()
  if (!session.can("accounts", "view")) {
    return null
  }

  const orgId = session.profile.org_id ?? ""
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = session.supabase as any

  const [accounts, activeAccounts, accountTypes, contacts] = await Promise.all([
    countTable(supabase, "accounts", orgId),
    countTable(supabase, "accounts", orgId, { status: "active" }),
    countTable(supabase, "account_types", orgId),
    countTable(supabase, "contacts", orgId),
  ])

  const metrics = [
    { label: "Accounts", value: accounts, href: "/accounts" },
    { label: "Active accounts", value: activeAccounts, href: "/accounts" },
    { label: "Account types", value: accountTypes, href: "/accounts/account-types" },
    { label: "Contacts", value: contacts, href: "/accounts" },
  ]

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Accounts Dashboard"
        description="Customer accounts, types and linked contacts."
        action={
          session.can("accounts", "create") ? (
            <Button size="sm" nativeButton={false} render={<Link href="/accounts" />}>
              New account
            </Button>
          ) : null
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className="border bg-card p-4 transition-colors hover:bg-muted/40"
          >
            <p className="text-[11px] font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-3 text-2xl font-medium tracking-tight tabular-nums">
              {metric.value ?? "—"}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/accounts" />}>
          Accounts
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/accounts/account-types" />}
        >
          Account types
        </Button>
      </div>
    </div>
  )
}
