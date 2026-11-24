import { MobileNav } from "@/components/mobile-nav"
import { NotificationMenu } from "@/components/notification-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { TopbarTitle } from "@/components/topbar-title"
import { UserMenu } from "@/components/user-menu"
import type { Database } from "@/lib/supabase/database.types"

type Notification = Database["public"]["Tables"]["notifications"]["Row"]

export function Topbar({
  organizationName,
  organizationCode,
  allowedSlugs,
  userName,
  userEmail,
  userInitials,
  canManageOrganization,
  notifications,
}: {
  organizationName: string
  organizationCode: string
  allowedSlugs: string[]
  userName: string
  userEmail: string
  userInitials: string
  canManageOrganization: boolean
  notifications: Notification[]
}) {
  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between gap-3 border-b bg-background px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNav
          organizationName={organizationName}
          organizationCode={organizationCode}
          allowedSlugs={allowedSlugs}
        />
        <TopbarTitle organizationCode={organizationCode} />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <NotificationMenu initial={notifications} />
        <ThemeToggle />
        <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
        <UserMenu
          name={userName}
          email={userEmail}
          initials={userInitials}
          canManageOrganization={canManageOrganization}
        />
      </div>
    </header>
  )
}
