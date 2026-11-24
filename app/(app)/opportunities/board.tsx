"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { moveOpportunity } from "./actions"

type Stage = { id: string; name: string; probability: number | null; is_won: boolean; is_lost: boolean }
type Opportunity = {
  id: string
  name: string
  amount: number
  stage_id: string
  expected_close: string | null
}

export function OpportunityBoard({
  stages,
  opportunities,
  canUpdate,
  currencyCode,
}: {
  stages: Stage[]
  opportunities: Opportunity[]
  canUpdate: boolean
  currencyCode: string
}) {
  const router = useRouter()
  const currency = new Intl.NumberFormat("en", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  })
  const [pending, startTransition] = React.useTransition()

  function move(id: string, stageId: string) {
    startTransition(async () => {
      const result = await moveOpportunity(id, stageId)
      if (!result.ok) {
        toast.error(result.error ?? "Could not move the opportunity.")
        return
      }
      toast.success("Opportunity moved.")
      router.refresh()
    })
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {stages.map((stage) => {
        const items = opportunities.filter((item) => item.stage_id === stage.id)
        const total = items.reduce((sum, item) => sum + Number(item.amount), 0)

        return (
          <section key={stage.id} className="flex w-64 shrink-0 flex-col border bg-card">
            <header className="border-b px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-medium">{stage.name}</h3>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {stage.probability ?? 0}%
                </span>
              </div>
              <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                {items.length} · {currency.format(total)}
              </p>
            </header>

            <div className="flex flex-col gap-2 p-2">
              {items.length === 0 ? (
                <p className="px-1 py-3 text-[11px] leading-relaxed text-muted-foreground">
                  No opportunities in this stage.
                </p>
              ) : null}
              {items.map((item) => (
                <article key={item.id} className="border bg-background p-2.5">
                  <p className="text-xs font-medium leading-snug">{item.name}</p>
                  <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                    {currency.format(Number(item.amount))}
                    {item.expected_close ? ` · ${item.expected_close}` : ""}
                  </p>
                  {canUpdate ? (
                    <select
                      value={stage.id}
                      onChange={(event) => move(item.id, event.target.value)}
                      disabled={pending}
                      className="mt-2 h-6 w-full rounded-none border border-input bg-transparent px-1 text-[11px] outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-input/30"
                      aria-label={`Move ${item.name} to stage`}
                    >
                      {stages.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
