"use client"

import { GeoActionButton } from "@/components/geo-action-button"
import { recordAttendanceClock } from "@/app/(app)/field/actions"

export function AttendanceClockButton() {
  return (
    <GeoActionButton
      label="Clock in / out"
      variant="default"
      action={(position, clientUuid) => recordAttendanceClock(position, clientUuid)}
    />
  )
}
