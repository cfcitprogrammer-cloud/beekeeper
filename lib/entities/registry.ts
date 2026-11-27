import { generatedEntities, moduleEntities } from "./generated"
import type { EntityConfig, FieldDef } from "./types"

const hiddenFields: Record<string, string[]> = {
  users: ["is_super_admin"],
  _all: ["client_uuid", "synced_at"],
  organizations: ["settings"],
  approvals: ["remarks"],
  // Superseded by the employment-type master and per-address location fields.
  employees: [
    "employment_type",
    "province",
    "city_municipality",
    "barangay",
    "zip_code",
    // Education is now a repeatable child list.
    "highest_education",
    "school_name",
    "course",
    "year_graduated",
  ],
}

/**
 * The employees page shows only the Employees list. Departments and positions
 * have their own pages, and documents belong to the employee detail view, so
 * none of them should appear as tabs on /employees. Applied here (not in
 * generated.ts) so regeneration keeps this behaviour.
 */
const moduleViewEntities: Record<string, string[]> = {
  employees: ["employees"],
}

/**
 * Columns added with `alter table` aren't fully understood by the entity
 * generator, so relations and fixed option lists are curated here.
 */
const activeStatusField: Partial<FieldDef> = {
  type: "select",
  notNull: true,
  hasDefault: true,
  options: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
}

const fieldOverrides: Record<string, Record<string, Partial<FieldDef>>> = {
  departments: {
    manager_id: {
      label: "Manager",
      type: "relation",
      relation: { table: "employees", field: "id", labelField: "email" },
    },
    status: activeStatusField,
  },
  positions: {
    status: activeStatusField,
  },
  employees: {
    name_suffix: { label: "Suffix" },
    present_address: { wide: true },
    permanent_address: { wide: true },
    sex: {
      type: "select",
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
      ],
    },
    civil_status: {
      type: "select",
      options: [
        { value: "Single", label: "Single" },
        { value: "Married", label: "Married" },
        { value: "Widowed", label: "Widowed" },
        { value: "Separated", label: "Separated" },
        { value: "Annulled", label: "Annulled" },
      ],
    },
    nationality: {
      type: "select",
      options: [
        { value: "Filipino", label: "Filipino" },
        { value: "Other", label: "Other" },
      ],
    },
    employment_type_id: {
      label: "Employment Type",
      type: "relation",
      relation: { table: "employment_types", field: "id", labelField: "type" },
    },
  },
}

/** Columns computed from other fields rather than read from the database. */
const virtualColumns: Record<string, string[]> = {
  employees: ["full_name"],
}

const displayColumns: Record<string, string[]> = {
  users: ["full_name", "email", "status", "last_login_at"],
  roles: ["name", "description"],
  organizations: ["name", "code", "timezone", "currency_code"],
  audit_logs: ["created_at", "user_id", "module", "entity_type", "action"],
  employees: [
    "employee_no",
    "full_name",
    "department_id",
    "manager_id",
    "status",
    "is_field_staff",
  ],
  departments: ["name", "code", "description", "manager_id", "status"],
  positions: [
    "title",
    "grade",
    "job_level",
    "min_salary",
    "max_salary",
    "status",
    "description",
  ],
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

/**
 * Master data created after the generator tables. Kept here so regeneration
 * of generated.ts doesn't drop it.
 */
const manualEntities: Record<string, EntityConfig> = {
  employment_types: {
    key: "employment_types",
    module: "employees",
    title: "Employment Types",
    singular: "Employment Type",
    table: "employment_types",
    fields: [
      { name: "code", label: "Code", type: "text", required: true, notNull: true },
      { name: "type", label: "Type", type: "text", required: true, notNull: true },
      { name: "description", label: "Description", type: "textarea", required: false },
    ],
    columns: ["code", "type", "description"],
    searchColumns: ["code", "type"],
    defaultOrder: "created_at",
    readOnly: false,
    tenantScoped: true,
  },
  employee_education: {
    key: "employee_education",
    module: "employees",
    title: "Education History",
    singular: "Education",
    table: "employee_education",
    fields: [
      { name: "employee_id", label: "Employee", type: "relation", required: true, notNull: true, relation: { table: "employees", field: "id", labelField: "email" } },
      { name: "school_name", label: "School", type: "text", required: true, notNull: true },
      { name: "education_level", label: "Education Level", type: "text", required: false },
      { name: "course", label: "Course", type: "text", required: false },
      { name: "year_graduated", label: "Year Graduated", type: "number", required: false },
      { name: "description", label: "Description", type: "textarea", required: false },
    ],
    columns: ["school_name", "education_level", "course", "year_graduated"],
    searchColumns: ["school_name", "course"],
    defaultOrder: "created_at",
    readOnly: false,
    tenantScoped: false,
    child: true,
    primaryKeys: ["id"],
    parent: { field: "employee_id", table: "employees" },
  },
}

export const entities: Record<string, EntityConfig> = Object.fromEntries(
  [...Object.entries(generatedEntities), ...Object.entries(manualEntities)].map(
    ([key, config]) => {
    const hidden = [...(hiddenFields._all ?? []), ...(hiddenFields[key] ?? [])]
    const fields = config.fields
      .filter((field) => !hidden.includes(field.name))
      .map((field) => ({ ...field, ...(fieldOverrides[key]?.[field.name] ?? {}) }))

    const preferred = displayColumns[key]
    const columns = preferred
      ? preferred.filter(
          (name) =>
            fields.some((field) => field.name === name) ||
            (virtualColumns[key] ?? []).includes(name)
        )
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
  const keys = moduleViewEntities[module] ?? moduleEntities[module] ?? []
  return keys
    .map((key) => entities[key])
    .filter((config): config is EntityConfig => Boolean(config) && !config.child)
}

/** Child tables that belong to a parent entity, keyed by parent entity key. */
export function childEntitiesFor(parentKey: string): EntityConfig[] {
  return Object.values(entities).filter(
    (config) => config.child && config.parent?.table === parentKey,
  )
}

export function moduleForEntity(key: string) {
  return entities[key]?.module ?? null
}

export function fieldByName(config: EntityConfig, name: string): FieldDef | undefined {
  return config.fields.find((field) => field.name === name)
}
