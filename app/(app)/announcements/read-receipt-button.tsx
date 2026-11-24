"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { markAnnouncementRead } from "./actions"

export function ReadReceiptButton({ id, acknowledged }: { id: string; acknowledged: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  if (acknowledged) return <span className="text-[11px] text-muted-foreground">Acknowledged</span>

  return (
    <Button
      size="xs"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await markAnnouncementRead(id, true)
          if (!result.ok) {
            toast.error(result.error ?? "Could not record acknowledgement.")
            return
          }
          toast.success("Acknowledgement recorded.")
          router.refresh()
        })
      }
    >
      {pending ? "Saving…" : "Acknowledge"}
    </Button>
  )
}
