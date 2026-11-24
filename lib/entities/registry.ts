import { generatedEntities, moduleEntities } from "./generated"
import type { EntityConfig, FieldDef } from "./types"

const hiddenFields: Record<string, string[]> = {
  users: ["is_super_admin"],
  _all: ["client_uuid", "synced_at"],
  organizations: ["settings"],
  approvals: ["remarks"],
}

const displayColumns: Record<string, string[]> = {
  users: ["full_name", "email", "status", "last_login_at"],
  roles: ["name", "description"],
  organizations: ["name", "code", "timezone", "currency_code"],
  audit_logs: ["created_at", "user_id", "module", "entity_type", "action"],
  employees: ["employee_no", "first_name", "last_name", "status", "is_field_staff"],
  departments: ["name", "code", "is_active"],
  positions: ["title", "code", "level"],
  attendances: ["work_date", "employee_id", "status", "late_minutes", "overtime_minutes"],
  leaves: ["employee_id", "leave_type_id", "start_date", "end_date", "days", "status"],
  accounts: ["name", "code", "account_type", "credit_limit", "status"],
  contacts: ["first_name", "last_name", "email", "phone"],
  leads: ["name", "source", "status", "score", "owner_id"],
  opportunities: ["name", "stage_id", "expected_value", "probability", "close_date"],
  outlets: ["outlet_code", "name", "outlet_type", "tier", "status"],
  visits: ["planned_date", "employee_id", "outlet_id", "status", "check_in_at"],
  products: ["sku", "name", "product_type", "tax_class", "is_active"],
  orders: ["order_no", "order_date", "account_id", "status", "grand_total", "currency_code"],
  invoices: ["invoice_no", "invoice_date", "due_date", "total", "amount_paid", "status"],
  expenses: ["expense_date", "employee_id", "category_id", "amount", "status"],
  service_tickets: ["ticket_no", "title", "priority", "status", "sla_due_at"],
  announcements: ["title", "is_pinned", "publish_at", "expires_at"],
  approval_workflows: ["name", "module", "is_active"],
  approvals: ["entity_type", "entity_id", "level", "approver_id", "status"],
}

export const entities: Record<string, EntityConfig> = Object.fromEntries(
  Object.entries(generatedEntities).map(([key, config]) => {
    const hidden = [...(hiddenFields._all ?? []), ...(hiddenFields[key] ?? [])]
    const fields = config.fields.filter((field) => !hidden.includes(field.name))

    const preferred = displayColumns[key]
    const columns = preferred
      ? preferred.filter((name) => fields.some((field) => field.name === name))
      : config.columns

    return [
      key,
      {
        ...config,
        fields,
        columns: columns.length ? columns : config.columns,
        searchColumns: config.searchColumns.filter((name) =>
          fields.some((field) => field.name === name),
        ),
      } satisfies EntityConfig,
    ]
  }),
)

export function getEntity(key: string) {
  return entities[key] ?? null
}

export function entitiesForModule(module: string): EntityConfig[] {
  return (moduleEntities[module] ?? [])
    .map((key) => entities[key])
    .filter((config): config is EntityConfig => Boolean(config))
}

export function moduleForEntity(key: string) {
  return entities[key]?.module ?? null
}

export function fieldByName(config: EntityConfig, name: string): FieldDef | undefined {
  return config.fields.find((field) => field.name === name)
}
