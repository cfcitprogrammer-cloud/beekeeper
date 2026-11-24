"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronsUpDownIcon, LogOutIcon, SettingsIcon } from "lucide-react"

import { signOut } from "@/app/(auth)/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu({
  name,
  email,
  initials,
  canManageOrganization,
}: {
  name: string
  email: string
  initials: string
  canManageOrganization: boolean
}) {
  const [pending, startTransition] = React.useTransition()

  function onSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 items-center gap-2 px-1.5 text-xs outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring data-popup-open:bg-muted">
        <Avatar size="sm">
          <AvatarFallback className="text-[10px] font-medium">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-28 truncate sm:inline">{name}</span>
        <ChevronsUpDownIcon className="hidden size-3 text-muted-foreground sm:inline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="py-2">
          <span className="block truncate text-xs font-medium text-foreground">{name}</span>
          <span className="mt-0.5 block truncate text-[11px] font-normal text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canManageOrganization ? (
          <DropdownMenuItem nativeButton={false} render={<Link href="/administration" />}>
            <SettingsIcon />
            Organization settings
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onClick={onSignOut}
        >
          <LogOutIcon />
          {pending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
