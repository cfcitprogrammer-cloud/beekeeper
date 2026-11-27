export const PAGE_SIZE_OPTIONS = [50, 100, 500, 1000] as const
export const DEFAULT_PAGE_SIZE = 50

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
  /** Column is NOT NULL (whether or not it has a database default). */
  notNull?: boolean
  /** Column has a database default, so empty values can be omitted on insert. */
  hasDefault?: boolean
  options?: FieldOption[]
  relation?: { table: string; field: string; labelField: string }
  placeholder?: string
  hint?: string
  readOnly?: boolean
  /** Span both columns of the form grid. */
  wide?: boolean
  /** Use a searchable combobox that queries the server for more options. */
  searchable?: boolean
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
  /** Child/junction table without a single `id` primary key. */
  child?: boolean
  /** Columns that uniquely identify a child row. */
  primaryKeys?: string[]
}

export type EntityRow = Record<string, unknown> & {
  id?: string
  /** Human-readable labels for relation columns, keyed by field name. */
  __labels?: Record<string, string>
}
