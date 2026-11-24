import { NextResponse, type NextRequest } from "next/server"

import { requireOrganization } from "@/lib/auth"
import { isReportView, reportColumns } from "@/lib/reports"

function csvCell(value: unknown) {
  if (value === null || value === undefined) return ""
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export async function GET(request: NextRequest) {
  const session = await requireOrganization()
  if (!session.can("reports", "export")) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const id = request.nextUrl.searchParams.get("report")
  if (!id) return new NextResponse("Missing report", { status: 400 })

  const { data: definition } = await session.supabase
    .from("report_definitions")
    .select("id, name, data_source, config, org_id")
    .eq("id", id)
    .maybeSingle()

  if (!definition || !isReportView(definition.data_source)) {
    return new NextResponse("Unknown report", { status: 404 })
  }
  if (definition.org_id && definition.org_id !== session.organization?.id) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (session.supabase as any)
    .from(definition.data_source)
    .select("*")
    .limit(5000)

  if (error) return new NextResponse(error.message, { status: 500 })

  const columns = reportColumns(definition.data_source) as string[]
  const header = columns.join(",")
  const body = (data ?? [])
    .map((row: Record<string, unknown>) => columns.map((column) => csvCell(row[column])).join(","))
    .join("\n")

  return new NextResponse(`${header}\n${body}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${definition.name.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}.csv"`,
    },
  })
}
