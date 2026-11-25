import type { Metadata } from "next"
import Link from "next/link"

import { PageHeader } from "@/components/panel"
import { Button } from "@/components/ui/button"
import { requireOrganization } from "@/lib/auth"

export const metadata: Metadata = { title: "Product Dashboard" }

async function countTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  table: string,
  orgId: string,
) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
  if (error) return null
  return count ?? 0
}

export default async function ProductDashboardPage() {
  const session = await requireOrganization()
  if (!session.can("products", "view")) {
    return null
  }

  const orgId = session.profile.org_id ?? ""
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = session.supabase as any

  const [products, batches, priceLists, categories] = await Promise.all([
    countTable(supabase, "products", orgId),
    countTable(supabase, "batches", orgId),
    countTable(supabase, "price_lists", orgId),
    countTable(supabase, "product_categories", orgId),
  ])

  const metrics = [
    { label: "Products", value: products, href: "/products" },
    { label: "Batches", value: batches, href: "/products/batches" },
    { label: "Price lists", value: priceLists, href: "/products/price-lists" },
    { label: "Categories", value: categories, href: "/products/categories" },
  ]

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        title="Product Dashboard"
        description="Product catalogue, batches, pricing, and categories."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className="border bg-card p-4 transition-colors hover:bg-muted/40"
          >
            <p className="text-[11px] font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-3 text-2xl font-medium tracking-tight tabular-nums">
              {metric.value ?? "—"}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/products" />}>
          Products
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/products/batches" />}>
          Batches
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/products/price-lists" />}>
          Price lists
        </Button>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/products/categories" />}>
          Categories
        </Button>
      </div>
    </div>
  )
}