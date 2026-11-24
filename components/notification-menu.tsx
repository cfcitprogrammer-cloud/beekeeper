"use client"

import * as React from "react"
import Link from "next/link"
import { BellIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  fetchNotifications,
  markNotificationsRead,
} from "@/app/(app)/notifications/actions"
import type { Database } from "@/lib/supabase/database.types"

type Notification = Database["public"]["Tables"]["notifications"]["Row"]

export function NotificationMenu({ initial }: { initial: Notification[] }) {
  const [notifications, setNotifications] = React.useState(initial)
  const unread = notifications.filter((item) => !item.read_at).length

  async function load() {
    const rows = await fetchNotifications()
    setNotifications(rows)
  }

  function markAll() {
    const ids = notifications.filter((item) => !item.read_at).map((item) => item.id)
    if (!ids.length) return
    startTransition(async () => {
      await markNotificationsRead(ids)
      setNotifications((rows) =>
        rows.map((row) => (ids.includes(row.id) ? { ...row, read_at: new Date().toISOString() } : row)),
      )
    })
  }

  const [pending, startTransition] = React.useTransition()

  return (
    <DropdownMenu onOpenChange={(open) => open && void load()}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" className="relative" />}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
      >
        <BellIcon />
        {unread > 0 ? (
          <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-primary ring-2 ring-background" />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between gap-3">
          <span>Notifications</span>
          {unread > 0 ? (
            <button
              type="button"
              onClick={markAll}
              disabled={pending}
              className="text-[11px] font-normal text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-4 text-[11px] leading-relaxed text-muted-foreground">
            You&apos;re all caught up. New approvals and system messages will appear here.
          </p>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              render={notification.link ? <Link href={notification.link} /> : undefined}
              className="flex-col items-start gap-0.5 py-2"
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="truncate text-xs font-medium">{notification.title}</span>
                {!notification.read_at ? (
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                ) : null}
              </span>
              {notification.body ? (
                <span className="line-clamp-2 text-[11px] font-normal text-muted-foreground">
                  {notification.body}
                </span>
              ) : null}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
