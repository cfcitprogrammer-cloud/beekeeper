"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import * as React from "react"

import { MODULE_GROUPS, MODULES } from "@/lib/modules"
import { cn } from "@/lib/utils"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  SettingsIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react"

function isActivePath(pathname: string, searchParams: URLSearchParams, href: string) {
  const [path, query] = href.split("?")
  if (pathname !== path) return false
  if (!query) return true
  const params = new URLSearchParams(query)
  for (const [key, value] of params.entries()) {
    if (searchParams.get(key) !== value) return false
  }
  return true
}

export function AppNav({
  allowedSlugs,
  onNavigate,
}: {
  allowedSlugs: string[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const allowed = new Set(allowedSlugs)

  const [employeeOpen, setEmployeeOpen] = React.useState(true)
  const [employeeConfigOpen, setEmployeeConfigOpen] = React.useState(true)
  const [outletOpen, setOutletOpen] = React.useState(true)
  const [outletConfigOpen, setOutletConfigOpen] = React.useState(true)

  const showEmployee = allowed.has("employees")
  const showOutlets = allowed.has("outlets")

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
          return true
        })

        const renderEmployeeSection = group.id === "people" && showEmployee
        const renderOutletSection = group.id === "operations" && showOutlets

        if (modules.length === 0 && !renderEmployeeSection && !renderOutletSection) {
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
                          href="/dashboard"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/dashboard")}
                        >
                          <span className="truncate">Dashboard</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/employees?entity=employees"
                          onClick={onNavigate}
                          className={subItemClass(
                            isActivePath(pathname, searchParams, "/employees?entity=employees") ||
                              (pathname === "/employees" && !searchParams.get("entity")),
                          )}
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
                                href="/employees?entity=departments"
                                onClick={onNavigate}
                                className={nestedItemClass(
                                  isActivePath(pathname, searchParams, "/employees?entity=departments"),
                                )}
                              >
                                <span className="truncate">Departments</span>
                              </Link>
                            </li>
                            <li>
                              <Link
                                href="/employees?entity=positions"
                                onClick={onNavigate}
                                className={nestedItemClass(
                                  isActivePath(pathname, searchParams, "/employees?entity=positions"),
                                )}
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
                          href="/dashboard"
                          onClick={onNavigate}
                          className={subItemClass(pathname === "/dashboard")}
                        >
                          <span className="truncate">Dashboard</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/outlets?entity=outlets"
                          onClick={onNavigate}
                          className={subItemClass(
                            isActivePath(pathname, searchParams, "/outlets?entity=outlets") ||
                              (pathname === "/outlets" && !searchParams.get("entity")),
                          )}
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
            </ul>
          </div>
        )
      })}
    </nav>
  )
}