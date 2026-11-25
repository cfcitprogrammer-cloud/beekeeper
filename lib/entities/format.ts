import type { FieldDef } from "./types"

/**
 * Relation fields are generated from foreign keys (employee_id, outlet_id, …).
 * Showing the trailing "Id" in the UI is noise, so relation labels drop it.
 */
export function fieldDisplayLabel(field?: Pick<FieldDef, "label" | "type"> | null) {
  if (!field) return ""
  return field.type === "relation" ? field.label.replace(/\s+Id$/i, "") : field.label
}
