"use client"

import { GeoActionButton } from "@/components/geo-action-button"
import { recordVisitCheckIn, recordVisitCheckOut } from "@/app/(app)/field/actions"

export function VisitGeoButton({
  visitId,
  phase,
}: {
  visitId: string
  phase: "in" | "out"
}) {
  return (
    <GeoActionButton
      label={phase === "in" ? "Check in" : "Check out"}
      action={(position, clientUuid) =>
        phase === "in"
          ? recordVisitCheckIn(visitId, position, clientUuid)
          : recordVisitCheckOut(visitId, position)
      }
    />
  )
}
