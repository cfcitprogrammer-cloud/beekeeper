import { AppSidebar } from "@/components/app-sidebar"
import { Topbar } from "@/components/topbar"
import { displayName, initials, requireOrganization } from "@/lib/auth"
import { visibleModules } from "@/lib/modules"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireOrganization()
  const organization = session.organization
  const allowedSlugs = visibleModules(session.can).map((module) => module.slug)
  const name = displayName(session.profile)

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <AppSidebar
          organizationName={organization?.name ?? "Your organization"}
          organizationCode={organization?.code ?? "—"}
          organizationTimezone={organization?.timezone ?? "UTC"}
          allowedSlugs={allowedSlugs}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          organizationName={organization?.name ?? "Your organization"}
          organizationCode={organization?.code ?? "—"}
          allowedSlugs={allowedSlugs}
          userName={name}
          userEmail={session.profile.email}
          userInitials={initials(session.profile)}
          canManageOrganization={session.can("administration", "update")}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
