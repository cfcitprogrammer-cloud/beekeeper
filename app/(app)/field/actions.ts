"use server"

import { revalidatePath } from "next/cache"

import { requireOrganization } from "@/lib/auth"
import { dateInTimeZone } from "@/lib/dashboard"

type Coordinates = { latitude: number; longitude: number }

function validCoordinates(position: Coordinates) {
  return (
    Number.isFinite(position.latitude) &&
    Number.isFinite(position.longitude) &&
    Math.abs(position.latitude) <= 90 &&
    Math.abs(position.longitude) <= 180
  )
}

export async function recordVisitCheckIn(
  visitId: string,
  position: Coordinates,
  clientUuid?: string,
) {
  const session = await requireOrganization()
  if (!session.can("visits", "update")) {
    return { ok: false, error: "You can't check in to visits." }
  }
  if (!validCoordinates(position)) {
    return { ok: false, error: "A valid location is required." }
  }

  const { data: visit } = await session.supabase
    .from("visits")
    .select("id, outlet_id, status")
    .eq("id", visitId)
    .eq("org_id", session.profile.org_id ?? "")
    .maybeSingle()

  if (!visit) return { ok: false, error: "That visit isn't in your organization." }

  const { data: outlet } = await session.supabase
    .from("outlets")
    .select("geofence_radius_m")
    .eq("id", visit.outlet_id)
    .maybeSingle()

  const { data: distance } = await session.supabase.rpc("distance_to_outlet", {
    p_outlet: visit.outlet_id,
    p_lat: position.latitude,
    p_lng: position.longitude,
  })

  const radius = outlet?.geofence_radius_m ?? 100
  if (distance !== null && Number(distance) > radius) {
    return {
      ok: false,
      error: `You are ${Math.round(Number(distance))} m from the outlet. The geofence is ${radius} m.`,
    }
  }

  const { error } = await session.supabase
    .from("visits")
    .update({
      status: "in_progress",
      check_in_at: new Date().toISOString(),
      distance_from_outlet_m: distance ?? null,
      client_uuid: clientUuid ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", visitId)

  if (error) return { ok: false, error: error.message }

  await session.supabase.rpc("log_audit", {
    p_module: "visits",
    p_entity: "visits",
    p_entity_id: visitId,
    p_action: "check_in",
    p_changes: { distance_from_outlet_m: distance ?? null },
  })

  revalidatePath("/visits")
  return { ok: true }
}

export async function recordVisitCheckOut(visitId: string, position: Coordinates) {
  const session = await requireOrganization()
  if (!session.can("visits", "update")) {
    return { ok: false, error: "You can't check out of visits." }
  }
  if (!validCoordinates(position)) {
    return { ok: false, error: "A valid location is required." }
  }

  const { error } = await session.supabase
    .from("visits")
    .update({
      status: "completed",
      check_out_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", visitId)
    .eq("org_id", session.profile.org_id ?? "")

  if (error) return { ok: false, error: error.message }

  await session.supabase.rpc("log_audit", {
    p_module: "visits",
    p_entity: "visits",
    p_entity_id: visitId,
    p_action: "check_out",
    p_changes: {},
  })

  revalidatePath("/visits")
  return { ok: true }
}

export async function recordAttendanceClock(position: Coordinates, clientUuid?: string) {
  const session = await requireOrganization()
  if (!session.can("attendance", "create") && !session.can("attendance", "update")) {
    return { ok: false, error: "You can't record attendance." }
  }
  if (!validCoordinates(position)) {
    return { ok: false, error: "A valid location is required." }
  }

  const { data: employee } = await session.supabase
    .from("employees")
    .select("id")
    .eq("org_id", session.profile.org_id ?? "")
    .eq("user_id", session.user.id)
    .maybeSingle()

  if (!employee) {
    return { ok: false, error: "No employee record is linked to your account." }
  }

  const workDate = dateInTimeZone(new Date(), session.organization?.timezone ?? "UTC")
  const { data: existing } = await session.supabase
    .from("attendances")
    .select("id, clock_in_at, clock_out_at")
    .eq("org_id", session.profile.org_id ?? "")
    .eq("employee_id", employee.id)
    .eq("work_date", workDate)
    .maybeSingle()

  const now = new Date().toISOString()

  if (existing?.clock_in_at && !existing.clock_out_at) {
    const { error } = await session.supabase
      .from("attendances")
      .update({ clock_out_at: now })
      .eq("id", existing.id)
    if (error) return { ok: false, error: error.message }

    await session.supabase.rpc("log_audit", {
      p_module: "attendance",
      p_entity: "attendances",
      p_entity_id: existing.id,
      p_action: "clock_out",
      p_changes: {},
    })

    revalidatePath("/attendance")
    return { ok: true, action: "clocked out" as const }
  }

  if (existing) {
    return { ok: false, error: "Today's attendance is already complete." }
  }

  const { data: created, error } = await session.supabase
    .from("attendances")
    .insert({
      org_id: session.organization?.id ?? "",
      employee_id: employee.id,
      work_date: workDate,
      clock_in_at: now,
      status: "present",
      client_uuid: clientUuid ?? null,
    })
    .select("id")
    .single()

  if (error) return { ok: false, error: error.message }

  await session.supabase.rpc("log_audit", {
    p_module: "attendance",
    p_entity: "attendances",
    p_entity_id: created.id,
    p_action: "clock_in",
    p_changes: { work_date: workDate },
  })

  revalidatePath("/attendance")
  return { ok: true, action: "clocked in" as const }
}
