"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { decideApproval } from "./actions"

type ApprovalItem = {
  id: string
  entity_type: string
  entity_id: string
  level: number
  created_at: string
}

export function ApprovalQueue({ items, canDecide }: { items: ApprovalItem[]; canDecide: boolean }) {
  const router = useRouter()
  const [remarks, setRemarks] = React.useState<Record<string, string>>({})
  const [pending, startTransition] = React.useTransition()

  function decide(id: string, decision: "approved" | "rejected") {
    startTransition(async () => {
      const result = await decideApproval(id, decision, remarks[id] ?? "")
      if (!result.ok) {
        toast.error(result.error ?? "Could not record the decision.")
        return
      }
      toast.success(`Approval ${decision}.`)
      router.refresh()
    })
  }

  return (
    <div className="divide-y">
      {items.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium">{item.entity_type.replace(/_/g, " ")}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Level {item.level} · {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
          {canDecide ? (
            <>
              <Input
                value={remarks[item.id] ?? ""}
                onChange={(event) =>
                  setRemarks((current) => ({ ...current, [item.id]: event.target.value }))
                }
                placeholder="Remarks (optional)"
                className="h-7 w-48 text-xs"
                aria-label="Approval remarks"
              />
              <Button
                size="xs"
                variant="outline"
                disabled={pending}
                onClick={() => decide(item.id, "rejected")}
              >
                Reject
              </Button>
              <Button size="xs" disabled={pending} onClick={() => decide(item.id, "approved")}>
                Approve
              </Button>
            </>
          ) : null}
        </div>
      ))}
    </div>
  )
}
