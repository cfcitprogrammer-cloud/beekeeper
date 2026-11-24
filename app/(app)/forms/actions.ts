"use server"

import { revalidatePath } from "next/cache"

import { requireOrganization } from "@/lib/auth"

export type FormBuilderState = { status: "idle" | "error" | "success"; message?: string }

type FieldInput = {
  key: string
  label: string
  field_type: string
  is_required: boolean
  options?: string[]
}

export async function createFormDefinition(
  _previous: FormBuilderState,
  formData: FormData,
): Promise<FormBuilderState> {
  const session = await requireOrganization()
  if (!session.can("forms", "create")) {
    return { status: "error", message: "You can't create forms." }
  }

  const name = String(formData.get("name") ?? "").trim()
  const formType = String(formData.get("form_type") ?? "").trim()
  let fields: FieldInput[]

  try {
    fields = JSON.parse(String(formData.get("fields") ?? "[]"))
  } catch {
    return { status: "error", message: "The field definition is invalid." }
  }

  if (name.length < 2) return { status: "error", message: "Enter a form name." }
  if (!Array.isArray(fields) || fields.length === 0) {
    return { status: "error", message: "Add at least one field." }
  }

  const keys = fields.map((field) => String(field.key ?? "").trim())
  if (keys.some((key) => !/^[a-z0-9_]+$/.test(key)) || new Set(keys).size !== keys.length) {
    return { status: "error", message: "Field keys must be unique lowercase letters, numbers and underscores." }
  }

  const { data: form, error } = await session.supabase
    .from("forms")
    .insert({
      org_id: session.organization?.id ?? "",
      name,
      form_type: formType || null,
      version: 1,
      status: "draft",
      schema: { fields: fields.map((field) => ({ key: field.key, label: field.label })) },
    })
    .select("id")
    .single()

  if (error) return { status: "error", message: error.message }

  const { error: fieldsError } = await session.supabase.from("form_fields").insert(
    fields.map((field, index) => ({
      form_id: form.id,
      key: String(field.key).trim(),
      label: String(field.label).trim(),
      field_type: String(field.field_type),
      is_required: Boolean(field.is_required),
      options: Array.isArray(field.options) ? (field.options as never) : null,
      sort_order: index,
    })),
  )

  if (fieldsError) {
    await session.supabase.from("forms").delete().eq("id", form.id)
    return { status: "error", message: fieldsError.message }
  }

  await session.supabase.rpc("log_audit", {
    p_module: "forms",
    p_entity: "forms",
    p_entity_id: form.id,
    p_action: "create",
    p_changes: { name, fields: fields.length },
  })

  revalidatePath("/forms")
  return { status: "success", message: `Form “${name}” saved as a draft.` }
}
