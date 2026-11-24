"use server"

import { revalidatePath } from "next/cache"

import { requireOrganization } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"
import { saveEntity } from "@/lib/entities/server"

export type ImportState = {
  status: "idle" | "error" | "success"
  message?: string
  errors?: string[]
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        cell += character
      }
      continue
    }

    if (character === '"') {
      quoted = true
    } else if (character === ",") {
      row.push(cell)
      cell = ""
    } else if (character === "\n") {
      row.push(cell.replace(/\r$/, ""))
      rows.push(row)
      row = []
      cell = ""
    } else {
      cell += character
    }
  }

  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""))
    rows.push(row)
  }

  return rows.filter((entry) => entry.some((value) => value.trim() !== ""))
}

export async function importCsv(
  _previous: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const session = await requireOrganization()
  const key = String(formData.get("entity") ?? "")
  const text = String(formData.get("csv") ?? "")
  const config = getEntity(key)

  if (!config) return { status: "error", message: "Choose a valid entity." }
  if (config.readOnly) return { status: "error", message: "That entity is read-only." }
  if (!session.can(config.module, "create")) {
    return { status: "error", message: "You can't create records in that module." }
  }

  const rows = parseCsv(text)
  if (rows.length < 2) {
    return { status: "error", message: "Provide a header row and at least one data row." }
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase())
  const allowed = new Map(config.fields.map((field) => [field.name.toLowerCase(), field.name]))
  const mapped = headers.map((header) => allowed.get(header) ?? null)

  if (!mapped.some(Boolean)) {
    return { status: "error", message: "None of the CSV headers match this entity's fields." }
  }

  const errors: string[] = []
  let imported = 0

  for (const [index, values] of rows.slice(1, 201).entries()) {
    const record: Record<string, unknown> = {}
    mapped.forEach((fieldName, position) => {
      if (fieldName) record[fieldName] = values[position] ?? ""
    })

    const result = await saveEntity(session, key, null, record)
    if (result.ok) imported += 1
    else errors.push(`Row ${index + 2}: ${result.error ?? "could not import"}`)
  }

  revalidatePath(`/${config.module.replace("_", "-")}`)

  return {
    status: "success",
    message: `Imported ${imported} ${imported === 1 ? "record" : "records"}.`,
    errors: errors.slice(0, 20),
  }
}
