import type { LucideIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-start gap-2 px-4 py-6", className)}>
      {Icon ? (
        <span className="flex size-7 items-center justify-center border bg-muted/40 text-muted-foreground">
          <Icon className="size-3.5" />
        </span>
      ) : null}
      <p className="text-xs font-medium">{title}</p>
      <p className="max-w-[48ch] text-[11px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action}
    </div>
  )
}
