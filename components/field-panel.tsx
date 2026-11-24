import { AllocationForm } from "@/app/(app)/billing/allocation-form"
import { InvoiceButton } from "@/app/(app)/orders/invoice-button"
import { AttendanceClockButton } from "@/app/(app)/attendance/geo-button"
import { VisitGeoButton } from "@/app/(app)/visits/geo-button"
import { EmptyState } from "@/components/empty-state"
import { Panel } from "@/components/panel"
import { Badge } from "@/components/ui/badge"
import type { Session } from "@/lib/auth"
import { dateInTimeZone } from "@/lib/dashboard"

export async function FieldPanel({ session, slug }: { session: Session; slug: string }) {
  const timezone = session.organization?.timezone ?? "UTC"
  const today = dateInTimeZone(new Date(), timezone)
  const orgId = session.organization?.id ?? ""

  if (slug === "visits" && session.can("visits", "view")) {
    const [{ data: visits }, { data: outlets }] = await Promise.all([
      session.supabase
        .from("visits")
        .select("id, outlet_id, status, planned_date, check_in_at, check_out_at")
        .eq("org_id", orgId)
        .eq("planned_date", today)
        .order("created_at", { ascending: false })
        .limit(20),
      session.supabase.from("outlets").select("id, name").eq("org_id", orgId),
    ])

    const outletNames = new Map((outlets ?? []).map((outlet) => [outlet.id, outlet.name]))

    return (
      <Panel title="Today's field actions" description={`${today} · geofence-validated check-in`}>
        {visits?.length ? (
          <ul className="divide-y">
            {visits.map((visit) => (
              <li key={visit.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {outletNames.get(visit.outlet_id) ?? "Outlet"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{visit.status.replace(/_/g, " ")}</p>
                </div>
                <Badge variant={visit.status === "completed" ? "secondary" : "outline"}>
                  {visit.status.replace(/_/g, " ")}
                </Badge>
                {session.can("visits", "update") ? (
                  !visit.check_in_at ? (
                    <VisitGeoButton visitId={visit.id} phase="in" />
                  ) : !visit.check_out_at ? (
                    <VisitGeoButton visitId={visit.id} phase="out" />
                  ) : null
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No visits planned today"
            description="Create a visit from the Visits table to start recording check-ins and time on site."
          />
        )}
      </Panel>
    )
  }

  if (slug === "orders" && session.can("orders", "view") && session.can("billing", "create")) {
    const [{ data: orders }, { data: invoices }] = await Promise.all([
      session.supabase
        .from("orders")
        .select("id, order_no, status, grand_total")
        .eq("org_id", orgId)
        .in("status", ["approved", "fulfilled", "partially_fulfilled"])
        .order("order_date", { ascending: false })
        .limit(20),
      session.supabase.from("invoices").select("order_id").eq("org_id", orgId),
    ])

    const invoiced = new Set((invoices ?? []).map((invoice) => invoice.order_id))
    const available = (orders ?? []).filter((order) => !invoiced.has(order.id))

    return (
      <Panel title="Ready to invoice" description="Approved and fulfilled orders without an invoice">
        {available.length ? (
          <ul className="divide-y">
            {available.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-xs">
                  {order.order_no} · {order.status.replace(/_/g, " ")}
                </span>
                <InvoiceButton orderId={order.id} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nothing to invoice"
            description="Orders become available here once they're approved or fulfilled."
          />
        )}
      </Panel>
    )
  }

  if (slug === "billing" && session.can("billing", "view") && session.can("billing", "update")) {
    const [{ data: payments }, { data: invoices }] = await Promise.all([
      session.supabase
        .from("payments")
        .select("id, payment_no, amount")
        .eq("org_id", orgId)
        .order("received_at", { ascending: false })
        .limit(50),
      session.supabase
        .from("invoices")
        .select("id, invoice_no, total, amount_paid")
        .eq("org_id", orgId)
        .limit(50),
    ])

    const openInvoices = (invoices ?? []).filter(
      (invoice) => Number(invoice.total) > Number(invoice.amount_paid),
    )

    return (
      <Panel title="Allocate a payment" description="Receipts are applied to invoices through the ledger">
        {payments?.length && openInvoices.length ? (
          <AllocationForm
            payments={(payments ?? []).map((payment) => ({
              id: payment.id,
              label: `${payment.payment_no} · ${Number(payment.amount).toFixed(2)}`,
            }))}
            invoices={openInvoices.map((invoice) => ({
              id: invoice.id,
              label: `${invoice.invoice_no} · ${(Number(invoice.total) - Number(invoice.amount_paid)).toFixed(2)} due`,
            }))}
          />
        ) : (
          <EmptyState
            title="Nothing to allocate"
            description="Record a payment and an open invoice before allocating funds."
          />
        )}
      </Panel>
    )
  }

  if (slug === "attendance" && session.can("attendance", "view")) {
    const { data: employee } = await session.supabase
      .from("employees")
      .select("id, first_name, last_name")
      .eq("org_id", orgId)
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (!employee) {
      return (
        <Panel title="Clock in" description={today}>
          <EmptyState
            title="No employee record linked"
            description="An Administrator must link your account to an employee record before you can clock in."
          />
        </Panel>
      )
    }

    const { data: record } = await session.supabase
      .from("attendances")
      .select("clock_in_at, clock_out_at, status")
      .eq("org_id", orgId)
      .eq("employee_id", employee.id)
      .eq("work_date", today)
      .maybeSingle()

    return (
      <Panel title="Clock in" description={`${employee.first_name} ${employee.last_name} · ${today}`}>
        <div className="flex flex-wrap items-center gap-4 px-4 py-4">
          <div className="text-[11px] text-muted-foreground">
            <p>
              In: <span className="text-foreground">{record?.clock_in_at ? new Date(record.clock_in_at).toLocaleTimeString() : "—"}</span>
            </p>
            <p className="mt-1">
              Out: <span className="text-foreground">{record?.clock_out_at ? new Date(record.clock_out_at).toLocaleTimeString() : "—"}</span>
            </p>
          </div>
          {!record?.clock_out_at && (session.can("attendance", "create") || session.can("attendance", "update")) ? (
            <AttendanceClockButton />
          ) : null}
          {record?.clock_out_at ? <Badge variant="secondary">Day complete</Badge> : null}
        </div>
      </Panel>
    )
  }

  return null
}
