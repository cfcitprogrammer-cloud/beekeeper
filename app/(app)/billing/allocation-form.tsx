"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { allocatePayment } from "@/app/(app)/billing/actions"

export function AllocationForm({
  payments,
  invoices,
}: {
  payments: { id: string; label: string }[]
  invoices: { id: string; label: string }[]
}) {
  const router = useRouter()
  const [paymentId, setPaymentId] = React.useState("")
  const [invoiceId, setInvoiceId] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [pending, startTransition] = React.useTransition()

  const selectClass =
    "h-7 w-full rounded-none border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"

  return (
    <div className="flex flex-wrap items-end gap-2 px-4 py-3">
      <select
        value={paymentId}
        onChange={(event) => setPaymentId(event.target.value)}
        className={selectClass}
        aria-label="Payment"
      >
        <option value="">Choose payment…</option>
        {payments.map((payment) => (
          <option key={payment.id} value={payment.id}>
            {payment.label}
          </option>
        ))}
      </select>
      <select
        value={invoiceId}
        onChange={(event) => setInvoiceId(event.target.value)}
        className={selectClass}
        aria-label="Invoice"
      >
        <option value="">Choose invoice…</option>
        {invoices.map((invoice) => (
          <option key={invoice.id} value={invoice.id}>
            {invoice.label}
          </option>
        ))}
      </select>
      <Input
        type="number"
        step="any"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        placeholder="Amount"
        className="h-7 w-28 text-xs"
        aria-label="Amount to allocate"
      />
      <Button
        size="xs"
        disabled={pending || !paymentId || !invoiceId || !amount}
        onClick={() =>
          startTransition(async () => {
            const result = await allocatePayment(paymentId, invoiceId, Number(amount))
            if (!result.ok) {
              toast.error(result.error ?? "Could not allocate the payment.")
              return
            }
            toast.success("Payment allocated.")
            setAmount("")
            router.refresh()
          })
        }
      >
        {pending ? "Allocating…" : "Allocate"}
      </Button>
    </div>
  )
}
