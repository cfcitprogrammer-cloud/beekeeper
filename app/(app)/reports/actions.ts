"use server"

import { revalidatePath } from "next/cache"

import { requireOrganization } from "@/lib/auth"
import { isReportView, reportColumns } from "@/lib/reports"

export type ReportFormState = { status: "idle" | "error" | "success"; message?: string }

export async function saveReportDefinition(
  _previous: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const session = await requireOrganization()
  if (!session.can("reports", "create")) {
    return { status: "error", message: "You can't create reports." }
  }

  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const dataSource = String(formData.get("data_source") ?? "")
  const columns = formData.getAll("columns").map(String)
  const chart = String(formData.get("chart") ?? "table")

  if (name.length < 2) return { status: "error", message: "Enter a report name." }
  if (!isReportView(dataSource)) {
    return { status: "error", message: "Choose an approved data source." }
  }
  if (!columns.length) {
    return { status: "error", message: "Choose at least one column." }
  }
  if (columns.some((column) => !reportColumns(dataSource).includes(column))) {
    return { status: "error", message: "A column isn't available in that data source." }
  }

  const { error } = await session.supabase.from("report_definitions").insert({
    org_id: session.organization?.id ?? null,
    name,
    description: description || null,
    data_source: dataSource,
    config: { columns, chart },
    is_system: false,
    owner_id: session.user.id,
    visibility: "org",
  })

  if (error) return { status: "error", message: error.message }

  await session.supabase.rpc("log_audit", {
    p_module: "reports",
    p_entity: "report_definitions",
    p_entity_id: null,
    p_action: "create",
    p_changes: { name, data_source: dataSource },
  })

  revalidatePath("/reports")
  return { status: "success", message: `Report “${name}” saved.` }
}
