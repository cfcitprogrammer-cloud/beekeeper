"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MapPinIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type GeoActionResult = { ok: boolean; error?: string; action?: string }

export function GeoActionButton({
  action,
  label,
  variant = "outline",
  className,
}: {
  action: (
    position: { latitude: number; longitude: number },
    clientUuid?: string,
  ) => Promise<GeoActionResult>
  label: string
  variant?: "default" | "outline" | "secondary"
  className?: string
}) {
  const router = useRouter()
  const [locating, setLocating] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  function run() {
    if (!navigator.geolocation) {
      toast.error("This browser can't provide a location.")
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        startTransition(async () => {
          const result = await action(
            { latitude: position.coords.latitude, longitude: position.coords.longitude },
            crypto.randomUUID?.(),
          )
          if (!result.ok) {
            toast.error(result.error ?? "Could not record the action.")
            return
          }
          toast.success(result.action ? `You ${result.action}.` : `${label} recorded.`)
          router.refresh()
        })
      },
      () => {
        setLocating(false)
        toast.error("Location permission is required. Allow location access and try again.")
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  return (
    <Button
      size="xs"
      variant={variant}
      onClick={run}
      disabled={locating || pending}
      className={cn(className)}
    >
      <MapPinIcon />
      {locating ? "Locating…" : pending ? "Saving…" : label}
    </Button>
  )
}
