"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { MODULE_GROUPS, MODULES } from "@/lib/modules"
import { cn } from "@/lib/utils"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PackageIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react"

export function AppNav({
  allowedSlugs,
  onNavigate,
}: {
  allowedSlugs: string[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const allowed = new Set(allowedSlugs)

  const [employeeOpen, setEmployeeOpen] = React.useState(true)
  const [employeeConfigOpen, setEmployeeConfigOpen] = React.useState(true)
  const [outletOpen, setOutletOpen] = React.useState(true)
  const [outletConfigOpen, setOutletConfigOpen] = React.useState(true)
  const [productOpen, setProductOpen] = React.useState(true)
  const [productConfigOpen, setProductConfigOpen] = React.useState(true)

  const showEmployee = allowed.has("employees")
  const showOutlets = allowed.has("outlets")
  const showProduct = allowed.has("products")

  const subItemClass = (active: boolean) =>
    cn(
      "group flex h-7 items-center gap-2 rounded-none px-2 pl-7 text-xs transition-colors",
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
    )

  const nestedItemClass = (active: boolean) =>
    cn(
      "group flex h-7 items-center gap-2 rounded-none px-2 pl-10 text-xs transition-colors",
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
    )

  return (
    <nav aria-label="Modules" className="flex flex-col gap-5 px-3 pb-6">
      {MODULE_GROUPS.map((group) => {
        const modules = MODULES.filter((module) => {
          if (!allowed.has(module.slug)) return false
          if (module.group !== group.id) return false
          // Render employees/outlets as nested sections instead of flat module links.
          if (group.id === "people" && module.slug === "employees") return false
          if (group.id === "operations" && module.slug === "outlets") return false
          if (group.id === "inventory" && module.slug === "products") return false
          return true
        })

        const renderEmployeeSection = group.id === "people" && showEmployee
        const renderOutletSection = group.id === "operations" && showOutlets
        const renderProductSection = group.id === "inventory" && showProduct

        if (
          modules.length === 0 &&
          !renderEmployeeSection &&
          !renderOutletSection &&
          !renderProductSection
        ) {
          return null
        }

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

              {renderEmployeeSection ? (
                <li>
                  <button
                    type="button"
                    onClick={() => setEmployeeOpen((value) => !value)}
                    className="group flex h-7 w-full items-center gap-2 px-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
                  >
                    <UsersIcon className="size-3.5 shrink-0" />
                    <span className="truncate">Employee</span>
                    <span className="ml-auto" />
                    {employeeOpen ? (
                      <ChevronDownIcon className="size-3.5 shrink-0" />
                    ) : (
                      <ChevronRightIcon className="size-3.5 shrink-0" />
                    )}
                  </button>
                  {employeeOpen ? (
                    <ul className="space-y-px">
                      <li>
                        <Link
                          href="/employees/dashboard"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/employees/dashboard")}
                        >
                          <span className="truncate">Dashboard</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/employees"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/employees")}
                        >
                          <span className="truncate">Employees</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/employees/chart"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/employees/chart")}
                        >
                          <span className="truncate">Org Chart</span>
                        </Link>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => setEmployeeConfigOpen((value) => !value)}
                          className="group flex h-7 w-full items-center gap-2 px-2 pl-7 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
                        >
                          <span className="truncate">Configuration</span>
                          <span className="ml-auto" />
                          {employeeConfigOpen ? (
                            <ChevronDownIcon className="size-3.5 shrink-0" />
                          ) : (
                            <ChevronRightIcon className="size-3.5 shrink-0" />
                          )}
                        </button>
                        {employeeConfigOpen ? (
                          <ul className="space-y-px">
                            <li>
                              <Link
                                href="/employees/departments"
                                onClick={onNavigate}
                                className={nestedItemClass(pathname === "/employees/departments")}
                              >
                                <span className="truncate">Departments</span>
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/employees/positions"
                                onClick={onNavigate}
                                className={nestedItemClass(pathname === "/employees/positions")}
                              >
                                <span className="truncate">Positions</span>
                              </Link>
                            </li>
                          </ul>
                        ) : null}
                      </li>
                    </ul>
                  ) : null}
                </li>
              ) : null}

              {renderOutletSection ? (
                <li>
                  <button
                    type="button"
                    onClick={() => setOutletOpen((value) => !value)}
                    className="group flex h-7 w-full items-center gap-2 px-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
                  >
                    <StoreIcon className="size-3.5 shrink-0" />
                    <span className="truncate">Outlets</span>
                    <span className="ml-auto" />
                    {outletOpen ? (
                      <ChevronDownIcon className="size-3.5 shrink-0" />
                    ) : (
                      <ChevronRightIcon className="size-3.5 shrink-0" />
                    )}
                  </button>
                  {outletOpen ? (
                    <ul className="space-y-px">
                      <li>
                        <Link
                          href="/outlets/dashboard"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/outlets/dashboard")}
                        >
                          <span className="truncate">Dashboard</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/outlets"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/outlets")}
                        >
                          <span className="truncate">Outlets</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/outlets/assignment"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/outlets/assignment")}
                        >
                          <span className="truncate">Outlets Assignment</span>
                        </Link>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => setOutletConfigOpen((value) => !value)}
                          className="group flex h-7 w-full items-center gap-2 px-2 pl-7 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
                        >
                          <span className="truncate">Configuration</span>
                          <span className="ml-auto" />
                          {outletConfigOpen ? (
                            <ChevronDownIcon className="size-3.5 shrink-0" />
                          ) : (
                            <ChevronRightIcon className="size-3.5 shrink-0" />
                          )}
                        </button>
                        {outletConfigOpen ? (
                          <ul className="space-y-px">
                            <li>
                              <Link
                                href="/outlets/types"
                                onClick={onNavigate}
                                className={nestedItemClass(pathname === "/outlets/types")}
                              >
                                <span className="truncate">Outlets Type</span>
                              </Link>
                            </li>
                          </ul>
                        ) : null}
                      </li>
                    </ul>
                  ) : null}
                </li>
              ) : null}

              {renderProductSection ? (
                <li>
                  <button
                    type="button"
                    onClick={() => setProductOpen((value) => !value)}
                    className="group flex h-7 w-full items-center gap-2 px-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
                  >
                    <PackageIcon className="size-3.5 shrink-0" />
                    <span className="truncate">Product</span>
                    <span className="ml-auto" />
                    {productOpen ? (
                      <ChevronDownIcon className="size-3.5 shrink-0" />
                    ) : (
                      <ChevronRightIcon className="size-3.5 shrink-0" />
                    )}
                  </button>
                  {productOpen ? (
                    <ul className="space-y-px">
                      <li>
                        <Link
                          href="/products/dashboard"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/products/dashboard")}
                        >
                          <span className="truncate">Dashboard</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/products"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/products")}
                        >
                          <span className="truncate">Products</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/products/batches"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/products/batches")}
                        >
                          <span className="truncate">Batches</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/products/price-lists"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/products/price-lists")}
                        >
                          <span className="truncate">Price Lists</span>
                        </Link>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => setProductConfigOpen((value) => !value)}
                          className="group flex h-7 w-full items-center gap-2 px-2 pl-7 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
                        >
                          <span className="truncate">Configuration</span>
                          <span className="ml-auto" />
                          {productConfigOpen ? (
                            <ChevronDownIcon className="size-3.5 shrink-0" />
                          ) : (
                            <ChevronRightIcon className="size-3.5 shrink-0" />
                          )}
                        </button>
                        {productConfigOpen ? (
                          <ul className="space-y-px">
                            <li>
                              <Link
                                href="/products/categories"
                                onClick={onNavigate}
                                className={nestedItemClass(pathname === "/products/categories")}
                              >
                                <span className="truncate">Product Categories</span>
                              </Link>
                            </li>
                          </ul>
                        ) : null}
                      </li>
                    </ul>
                  ) : null}
                </li>
              ) : null}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}