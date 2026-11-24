"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { MODULE_GROUPS, MODULES } from "@/lib/modules"
import { cn } from "@/lib/utils"

export function AppNav({
  allowedSlugs,
  onNavigate,
}: {
  allowedSlugs: string[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const allowed = new Set(allowedSlugs)

  return (
    <nav aria-label="Modules" className="flex flex-col gap-5 px-3 pb-6">
      {MODULE_GROUPS.map((group) => {
        const modules = MODULES.filter(
          (module) => module.group === group.id && allowed.has(module.slug),
        )
        if (modules.length === 0) return null

        return (
          <div key={group.id}>
            <p className="px-2 pb-1.5 text-[10px] font-medium tracking-[0.14em] text-muted-foreground/75 uppercase">
              {group.label}
            </p>
            <ul className="space-y-px">
              {modules.map((module) => {
                const active =
                  pathname === `/${module.slug}` || pathname.startsWith(`/${module.slug}/`)
                const Icon = module.icon

                return (
                  <li key={module.slug}>
                    <Link
                      href={`/${module.slug}`}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex h-7 items-center gap-2 px-2 text-xs transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      )}
                    >
                      <Icon
                        strokeWidth={1.75}
                        className={cn(
                          "size-3.5 shrink-0",
                          active
                            ? "text-primary"
                            : "text-muted-foreground/80 group-hover:text-foreground",
                        )}
                      />
                      <span className="truncate">{module.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
