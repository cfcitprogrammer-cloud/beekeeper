"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"

import { AppNav } from "@/components/app-nav"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export function MobileNav({
  organizationName,
  organizationCode,
  allowedSlugs,
}: {
  organizationName: string
  organizationCode: string
  allowedSlugs: string[]
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="left">
      <DrawerTrigger
        render={<Button variant="ghost" size="icon-sm" className="lg:hidden" />}
      >
        <MenuIcon />
        <span className="sr-only">Open navigation</span>
      </DrawerTrigger>
      <DrawerContent className="w-72 p-0">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Modules available to your organization.</DrawerDescription>
        </DrawerHeader>
        <div className="flex h-12 items-center border-b px-4">
          <Brand />
        </div>
        <div className="border-b px-4 py-3">
          <p className="truncate text-xs font-medium">{organizationName}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{organizationCode}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-3">
          <AppNav allowedSlugs={allowedSlugs} onNavigate={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
