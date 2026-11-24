"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DASHBOARD_WIDGETS } from "@/lib/dashboard-widgets-shared"
import { saveDashboardWidgets } from "./actions"

export function WidgetSettings({ initial }: { initial: string[] }) {
  const router = useRouter()
  const [selected, setSelected] = React.useState<Set<string>>(new Set(initial))
  const [pending, startTransition] = React.useTransition()

  function toggle(key: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function save() {
    startTransition(async () => {
      const result = await saveDashboardWidgets(Array.from(selected))
      if (!result.ok) {
        toast.error(result.error ?? "Could not save dashboard widgets.")
        return
      }
      toast.success("Dashboard layout saved.")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {DASHBOARD_WIDGETS.map((widget) => (
          <label
            key={widget.key}
            className="flex items-center gap-2 border px-3 py-2 text-xs hover:bg-muted/40"
          >
            <input
              type="checkbox"
              checked={selected.has(widget.key)}
              onChange={() => toggle(widget.key)}
              className="size-3.5 accent-[var(--primary)]"
            />
            {widget.label}
          </label>
        ))}
      </div>

      <Button size="sm" onClick={save} disabled={pending}>
        {pending ? "Saving…" : "Save layout"}
      </Button>
    </div>
  )
}
