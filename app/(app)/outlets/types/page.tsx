import { PageHeader } from "@/components/panel"
import { requireOrganization } from "@/lib/auth"

export default async function OutletsTypesPage() {
  const session = await requireOrganization()
  if (!session.can("outlets", "view")) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Outlets Type Configuration"
        description="Manage outlet types and channels."
      />
      <div className="mt-6 border bg-card p-6 text-sm text-muted-foreground">
        Outlet type configuration will be available here.
      </div>
    </div>
  )
}