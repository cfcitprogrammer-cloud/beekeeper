export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "date"
  | "datetime"
  | "checkbox"
  | "select"
  | "relation"
  | "json"

export type FieldOption = { value: string; label: string }

export type FieldDef = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: FieldOption[]
  relation?: { table: string; field: string; labelField: string }
  placeholder?: string
  hint?: string
  readOnly?: boolean
}

export type EntityConfig = {
  key: string
  module: string
  title: string
  singular: string
  table: string
  fields: FieldDef[]
  columns: string[]
  searchColumns: string[]
  defaultOrder: string
  readOnly?: boolean
  tenantScoped?: boolean
  parent?: { field: string; table: string }
}

export type EntityRow = Record<string, unknown> & { id?: string }
