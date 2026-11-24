/**
 * Generates a broad Database type from the migration SQL. This is a development
 * convenience until `npm run db:types` is run against the linked project, which
 * produces the authoritative generated file.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const migrationsDir = join(process.cwd(), "supabase", "migrations")
const sql = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(join(migrationsDir, file), "utf8"))
  .join("\n")

function mapType(rawType) {
  let type = rawType.trim().toLowerCase()
  const isArray = type.endsWith("[]")
  if (isArray) type = type.slice(0, -2).trim()
  type = type.replace(/\(.*\)$/, "").trim()

  const mapped = {
    uuid: "string",
    text: "string",
    varchar: "string",
    citext: "string",
    char: "string",
    name: "string",
    timestamptz: "string",
    timestamp: "string",
    date: "string",
    time: "string",
    interval: "string",
    inet: "string",
    json: "Json",
    jsonb: "Json",
    bytea: "string",
    geography: "unknown",
    geometry: "unknown",
    numeric: "number",
    decimal: "number",
    real: "number",
    double: "number",
    int: "number",
    int4: "number",
    integer: "number",
    bigint: "number",
    int8: "number",
    smallint: "number",
    int2: "number",
    serial: "number",
    bigserial: "number",
    boolean: "boolean",
    bool: "boolean",
  }[type] ?? "unknown"

  return isArray ? `${mapped}[]` : mapped
}

function rowsFromBody(body) {
  const rows = []
  for (const line of body.split("\n")) {
    const trimmed = line.trim().replace(/,$/, "")
    if (!trimmed || trimmed.startsWith("--")) continue
    if (/^(constraint|primary\s+key|unique|foreign\s+key|check|exclude|like)\b/i.test(trimmed)) {
      continue
    }

    const match = trimmed.match(/^(\w+)\s+([\w.]+(?:\([^)]*\))?(?:\[\])?)\b(.*)$/)
    if (!match) continue

    const [, name, rawType, rest] = match
    const required = /\bnot\s+null\b|\bprimary\s+key\b/i.test(rest)
    rows.push({ name, type: `${mapType(rawType)}${required ? "" : " | null"}` })
  }
  return rows
}

function renderRow(name, rows) {
  const fields = rows.length
    ? rows.map((row) => `      ${row.name}: ${row.type}`).join("\n")
    : "      [key: string]: unknown"
  return `    ${name}: Table<{\n${fields}\n    }>`
}

const tablePattern =
  /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.(\w+)\s*\(([\s\S]*?)\)\s*(?:partition\s+by\s+[^;]+)?;/gi

const tableRows = new Map()
for (const match of sql.matchAll(tablePattern)) {
  const rows = rowsFromBody(match[2])
  if (rows.length) tableRows.set(match[1], rows)
}

for (const match of sql.matchAll(
  /alter\s+table\s+public\.(\w+)\s+add\s+column\s+(?:if\s+not\s+exists\s+)?(\w+)\s+([\w.]+(?:\[\])?)/gi,
)) {
  const rows = tableRows.get(match[1])
  if (rows && !rows.some((row) => row.name === match[2])) {
    rows.push({ name: match[2], type: `${mapType(match[3])} | null` })
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
  const rows = tableRows.get(name)
  if (!rows) continue
  for (const column of ["client_uuid", "synced_at"]) {
    if (!rows.some((row) => row.name === column)) {
      rows.push({ name: column, type: "string | null" })
    }
  }
}

const tables = Array.from(tableRows, ([name, rows]) => renderRow(name, rows))

const viewPattern =
  /create\s+or\s+replace\s+view\s+public\.(\w+)[\s\S]*?\s+as\s+([\s\S]*?);\s*(?=\n\s*(?:create|grant|--|$))/gi

const views = []
for (const match of sql.matchAll(viewPattern)) {
  const aliases = Array.from(match[2].matchAll(/\bas\s+(\w+)/gi)).map((alias) => alias[1])
  const unique = Array.from(new Set(["org_id", ...aliases]))
  const rows = unique.map((alias) => ({
    name: alias,
    type: alias === "org_id" ? "string" : "string | number | null",
  }))
  views.push(renderRow(match[1], rows))
}

const output = `/**
 * Generated from supabase/migrations by scripts/generate-db-types.mjs.
 * Run \`npm run db:types\` against the linked project for authoritative types.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type Table<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
${tables.join("\n")}
    }
    Views: {
${views.join("\n")}
    }
    Functions: {
      bootstrap_organization: {
        Args: {
          p_name: string
          p_code: string
          p_timezone?: string
          p_currency_code?: string
        }
        Returns: string
      }
      current_permissions: {
        Args: Record<string, never>
        Returns: { module: string; action: string; data_scope: string }[]
      }
      log_audit: {
        Args: {
          p_module: string
          p_entity: string
          p_entity_id: string | null
          p_action: string
          p_changes?: Json
        }
        Returns: undefined
      }
      parent_belongs_to_org: {
        Args: { p_table: string; p_field: string; p_id: string; p_org: string }
        Returns: boolean
      }
      seed_standard_roles: {
        Args: { p_org: string }
        Returns: undefined
      }
      distance_to_outlet: {
        Args: { p_outlet: string; p_lat: number; p_lng: number }
        Returns: number
      }
      mark_notifications_read: {
        Args: { p_ids: string[] }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
`

writeFileSync(join(process.cwd(), "lib", "supabase", "database.types.ts"), output)
console.log(`Wrote ${tables.length} tables and ${views.length} views.`)
