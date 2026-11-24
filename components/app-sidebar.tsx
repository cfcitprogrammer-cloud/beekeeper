import { Brand } from "@/components/brand"
import { AppNav } from "@/components/app-nav"

export function AppSidebar({
  organizationName,
  organizationCode,
  organizationTimezone,
  allowedSlugs,
}: {
  organizationName: string
  organizationCode: string
  organizationTimezone: string
  allowedSlugs: string[]
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center border-b px-4">
        <Brand />
      </div>

      <div className="shrink-0 border-b px-3 py-3">
        <p className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground/75 uppercase">
          Organization
        </p>
        <p className="mt-1 truncate text-xs font-medium">{organizationName}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {organizationCode} · {organizationTimezone.replace(/_/g, " ")}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-3">
        <AppNav allowedSlugs={allowedSlugs} />
      </div>
    </div>
  )
}
