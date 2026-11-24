"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createInvoiceFromOrder } from "@/app/(app)/billing/actions"

export function InvoiceButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  return (
    <Button
      size="xs"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await createInvoiceFromOrder(orderId)
          if (!result.ok) {
            toast.error(result.error ?? "Could not create the invoice.")
            return
          }
          toast.success("Invoice created from the order.")
          router.refresh()
        })
      }
    >
      {pending ? "Creating…" : "Invoice"}
    </Button>
  )
}
