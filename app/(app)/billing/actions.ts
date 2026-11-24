"use server"

import { revalidatePath } from "next/cache"

import { requireOrganization } from "@/lib/auth"

export async function createInvoiceFromOrder(orderId: string) {
  const session = await requireOrganization()
  if (!session.can("billing", "create")) {
    return { ok: false, error: "You can't create invoices." }
  }

  const { data: order } = await session.supabase
    .from("orders")
    .select("id, order_no, account_id, order_date, grand_total, subtotal, tax_total, discount_total, currency_code, status")
    .eq("id", orderId)
    .eq("org_id", session.organization?.id ?? "")
    .maybeSingle()

  if (!order) return { ok: false, error: "That order isn't in your organization." }
  if (!["approved", "fulfilled", "partially_fulfilled", "invoiced"].includes(order.status)) {
    return { ok: false, error: "Only approved or fulfilled orders can be invoiced." }
  }

  const { data: existing } = await session.supabase
    .from("invoices")
    .select("id")
    .eq("org_id", session.organization?.id ?? "")
    .eq("order_id", orderId)
    .maybeSingle()

  if (existing) return { ok: false, error: "This order already has an invoice." }

  const dueDate = new Date(`${order.order_date}T00:00:00Z`)
  dueDate.setUTCDate(dueDate.getUTCDate() + 30)

  const { data: invoice, error } = await session.supabase
    .from("invoices")
    .insert({
      org_id: session.organization?.id ?? "",
      invoice_no: `INV-${order.order_no}`,
      account_id: order.account_id,
      order_id: order.id,
      invoice_date: order.order_date,
      due_date: dueDate.toISOString().slice(0, 10),
      subtotal: order.subtotal,
      tax_total: order.tax_total,
      total: order.grand_total,
      amount_paid: 0,
      status: "open",
    })
    .select("id")
    .single()

  if (error) return { ok: false, error: error.message }

  await session.supabase
    .from("orders")
    .update({ status: "invoiced", updated_at: new Date().toISOString() })
    .eq("id", orderId)

  await session.supabase.rpc("log_audit", {
    p_module: "billing",
    p_entity: "invoices",
    p_entity_id: invoice.id,
    p_action: "create",
    p_changes: { order_id: orderId, total: order.grand_total },
  })

  revalidatePath("/billing")
  revalidatePath("/orders")
  return { ok: true, id: invoice.id }
}

export async function allocatePayment(paymentId: string, invoiceId: string, amount: number) {
  const session = await requireOrganization()
  if (!session.can("billing", "update")) {
    return { ok: false, error: "You can't allocate payments." }
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter a positive amount." }
  }

  const orgId = session.organization?.id ?? ""

  const [{ data: payment }, { data: invoice }] = await Promise.all([
    session.supabase.from("payments").select("id, amount").eq("id", paymentId).eq("org_id", orgId).maybeSingle(),
    session.supabase.from("invoices").select("id, total, amount_paid").eq("id", invoiceId).eq("org_id", orgId).maybeSingle(),
  ])

  if (!payment || !invoice) return { ok: false, error: "Payment or invoice not found." }

  const outstanding = Number(invoice.total) - Number(invoice.amount_paid)
  if (amount > outstanding) {
    return { ok: false, error: `Only ${outstanding.toFixed(2)} is outstanding on this invoice.` }
  }

  const { error } = await session.supabase.from("payment_allocations").insert({
    payment_id: paymentId,
    invoice_id: invoiceId,
    amount,
  })

  if (error) return { ok: false, error: error.message }

  await session.supabase.rpc("log_audit", {
    p_module: "billing",
    p_entity: "payment_allocations",
    p_entity_id: "",
    p_action: "create",
    p_changes: { payment_id: paymentId, invoice_id: invoiceId, amount },
  })

  revalidatePath("/billing")
  return { ok: true }
}
