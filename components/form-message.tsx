import { CircleAlertIcon, CircleCheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function FormError({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 border border-destructive/30 bg-destructive/5 px-3 py-2 text-[11px] leading-relaxed text-destructive",
        className,
      )}
    >
      <CircleAlertIcon className="mt-px size-3.5 shrink-0" />
      <p>{message}</p>
    </div>
  )
}

export function FormSuccess({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 border border-primary/30 bg-primary/5 px-3 py-2 text-[11px] leading-relaxed text-foreground",
        className,
      )}
    >
      <CircleCheckIcon className="mt-px size-3.5 shrink-0 text-primary" />
      <p>{message}</p>
    </div>
  )
}
