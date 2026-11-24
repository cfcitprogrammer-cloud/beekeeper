import type * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function Field({
  id,
  label,
  error,
  hint,
  action,
  className,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[11px] leading-relaxed text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[11px] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
