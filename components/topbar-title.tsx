"use client"

import { usePathname } from "next/navigation"

import { getModule } from "@/lib/modules"

export function TopbarTitle({ organizationCode }: { organizationCode: string }) {
  const pathname = usePathname()
  const slug = pathname.split("/").filter(Boolean)[0] ?? "dashboard"
  const definition = getModule(slug)

  if (!definition) return null

  return (
    <div className="flex min-w-0 items-center gap-2 text-xs">
      <span className="hidden text-muted-foreground sm:inline">{organizationCode}</span>
      <span aria-hidden="true" className="hidden text-border sm:inline">
        /
      </span>
      <span className="truncate font-medium">{definition.name}</span>
    </div>
  )
}
