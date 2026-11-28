import type * as React from "react"

import { cn } from "@/lib/utils"

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn("border bg-card", className)}>
      <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="panel-heading min-w-0">
          <h2 className="panel-title text-xs font-medium">{title}</h2>
          {description ? (
            <p className="panel-description mt-0.5 text-[11px] text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-lg font-medium tracking-[-0.02em]">{title}</h1>
        {description ? (
          <p className="max-w-[65ch] text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
