/** Generates declarative entity configs from the migration SQL. */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const migrationsDir = join(root, "supabase", "migrations")
const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort()
const sql = files.map((f) => readFileSync(join(migrationsDir, f), "utf8")).join("\n")
const rls = readFileSync(join(migrationsDir, "20261124091500_rls.sql"), "utf8")

const tablePattern =
  /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.(\w+)\s*\(([\s\S]*?)\)\s*(?:partition\s+by\s+[^;]+)?;/gi

const tables = new Map()
for (const match of sql.matchAll(tablePattern)) {
  const name = match[1]
  if (/^location_pings_\d{6}$/.test(name)) continue
  const body = match[2]
  const columns = []
  const relations = {}
  const options = {}
  const primaryKeyMatch = body.match(/primary\s+key\s*\(([^)]+)\)/i)
  const primaryKeys = primaryKeyMatch
    ? primaryKeyMatch[1].split(",").map((value) => value.trim().replace(/"/g, ""))
    : []

  for (const line of body.split("\n")) {
    const trimmed = line.trim().replace(/,$/, "")
    if (!trimmed || trimmed.startsWith("--")) continue

    const optionMatch = trimmed.match(
      /check\s*\(\s*(\w+)\s+in\s*\(([^)]*)\)\s*\)/i,
    )
    if (optionMatch) {
      options[optionMatch[1]] = Array.from(optionMatch[2].matchAll(/'([^']+)'/g)).map(
        (value) => value[1],
      )
      continue
    }

    const columnMatch = trimmed.match(/^(\w+)\s+([\w.]+(?:\([^)]*\))?(?:\[\])?)\b(.*)$/)
    if (!columnMatch) continue
    const [, column, rawType, rest] = columnMatch

    const relation = rest.match(/references\s+public\.(\w+)\s*\((\w+)\)/i)
    if (relation) {
      relations[column] = { table: relation[1], field: relation[2] }
    }

    const notNull = /\bnot\s+null\b/i.test(rest)
    const hasDefault = /\bdefault\b/i.test(rest)

    columns.push({
      name: column,
      type: rawType.toLowerCase().replace(/\(.*\)$/, ""),
      required: notNull && !hasDefault,
      notNull,
      hasDefault,
    })
  }

  tables.set(name, { columns, relations, options, primaryKeys })
}

for (const match of sql.matchAll(
  /alter\s+table\s+public\.(\w+)\s+add\s+column\s+(?:if\s+not\s+exists\s+)?(\w+)\s+([\w.]+(?:\[\])?)/gi,
)) {
  const meta = tables.get(match[1])
  if (meta && !meta.columns.some((column) => column.name === match[2])) {
    meta.columns.push({ name: match[2], type: match[3].toLowerCase(), required: false })
  }
}

for (const name of [
  "visits",
  "form_submissions",
  "expenses",
  "orders",
  "sales_transactions",
  "service_tickets",
  "attendances",
]) {
  const meta = tables.get(name)
  if (!meta) continue
  for (const column of ["client_uuid", "synced_at"]) {
    if (!meta.columns.some((item) => item.name === column)) {
      meta.columns.push({ name: column, type: "uuid", required: false })
    }
  }
}

const moduleMap = {
  organizations: "administration",
  users: "administration",
  permissions: "administration",
  notifications: "administration",
  dashboard_layouts: "dashboard",
  report_definitions: "reports",
  announcement_reads: "announcements",
}

for (const match of rls.matchAll(/\('([a-z_]+)',\s*'([a-z_]+)'(?:,\s*'([a-z_]+)',\s*'([a-z_]+)')?\)/g)) {
  if (match[4]) moduleMap[match[1]] = match[4]
  else moduleMap[match[2]] = match[1]
}

function titleCase(value) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function labelFor(table) {
  const candidates = ["name", "title", "full_name", "label", "code", "email"]
  for (const candidate of candidates) {
    if (tables.get(table)?.columns.some((column) => column.name === candidate)) {
      return candidate
    }
  }
  return "id"
}

function fieldFor(column, relation, options) {
  const name = column.name
  const field = {
    name,
    label: titleCase(name),
    type: "text",
    required: column.required,
  }

  if (column.notNull) field.notNull = true
  if (column.hasDefault) field.hasDefault = true

  if (relation) {
    field.type = "relation"
    field.relation = { table: relation.table, field: relation.field, labelField: labelFor(relation.table) }
  } else if (options[name]) {
    field.type = "select"
    field.options = options[name].map((value) => ({ value, label: titleCase(value) }))
  } else if (column.type === "boolean" || column.type === "bool") {
    field.type = "checkbox"
  } else if (column.type === "date") {
    field.type = "date"
  } else if (column.type === "timestamptz" || column.type === "timestamp") {
    field.type = "datetime"
  } else if (["numeric", "decimal", "int", "integer", "bigint", "smallint", "real", "double"].includes(column.type)) {
    field.type = "number"
  } else if (column.type === "jsonb" || column.type === "json") {
    field.type = "json"
  } else if (name === "email") {
    field.type = "email"
  } else if (["body", "description", "notes", "remarks", "address", "resolution", "config", "steps", "summary"].includes(name)) {
    field.type = "textarea"
  }

  if (name === "settings" || name === "audience" || name === "attachments" || name === "photos" || name === "mentions") {
    field.type = "json"
  }

  if (["subtotal", "discount_total", "tax_total", "grand_total", "amount_paid", "budget_used", "total"].includes(name)) {
    field.readOnly = true
  }

  return field
}

const entityEntries = []
const moduleEntities = {}

for (const [table, meta] of tables) {
  const hasId = meta.columns.some((column) => column.name === "id")
  if (!hasId && !meta.primaryKeys.length) continue
  if (!moduleMap[table]) continue

  const fields = meta.columns
    .filter((column) => !["id", "org_id", "created_at", "updated_at"].includes(column.name))
    .map((column) => fieldFor(column, meta.relations[column.name], meta.options))

  if (fields.length === 0) continue

  const parentRelation = Object.entries(meta.relations).find(
    ([field, relation]) => field !== "org_id" && Boolean(moduleMap[relation.table]),
  )
  const readOnly = [
    "activity_feed",
    "audit_logs",
    "location_pings",
    "stock_levels",
    "permissions",
  ].includes(table)

  const config = {
    key: table,
    module: moduleMap[table],
    title: titleCase(table),
    singular: titleCase(table.replace(/s$/, "")),
    table,
    fields,
    columns: fields.slice(0, 6).map((field) => field.name),
    searchColumns: fields.filter((field) => ["text", "email", "textarea"].includes(field.type)).slice(0, 3).map((field) => field.name),
    defaultOrder: meta.columns.some((column) => column.name === "created_at") ? "created_at" : fields[0].name,
    readOnly,
    tenantScoped: meta.columns.some((column) => column.name === "org_id"),
  }

  if (parentRelation) {
    config.parent = { field: parentRelation[0], table: parentRelation[1].table }
  }

  if (!hasId) {
    config.child = true
    config.primaryKeys = meta.primaryKeys
  }

  entityEntries.push(`  ${table}: ${JSON.stringify(config, null, 2).replace(/\n/g, "\n  ")},`)
  const permissionModule = config.module
  moduleEntities[permissionModule] = moduleEntities[permissionModule] ?? []
  moduleEntities[permissionModule].push(table)
}

const output = `/**
 * Generated from supabase/migrations by scripts/generate-entities.mjs.
 * Curated overrides live in lib/entities/registry.ts.
 */
import type { EntityConfig } from "./types"

export const generatedEntities: Record<string, EntityConfig> = {
${entityEntries.join("\n")}
}

export const moduleEntities: Record<string, string[]> = ${JSON.stringify(moduleEntities, null, 2)}
`

writeFileSync(join(root, "lib", "entities", "generated.ts"), output)
console.log(`Wrote ${entityEntries.length} entity configs across ${Object.keys(moduleEntities).length} modules.`)
