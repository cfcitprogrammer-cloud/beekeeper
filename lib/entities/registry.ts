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
  leads: ["converted_account_id", "converted_at"],
  // Hidden temporarily; contacts are created from the account form for now.
  contacts: ["account_id"],
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
  outlets: {
    account_id: { searchable: true },
  },
  accounts: {
    account_no: { label: "Account Number" },
    account_type_id: {
      label: "Account Type",
      type: "relation",
      relation: { table: "account_types", field: "id", labelField: "type" },
    },
    owner_id: { label: "Owner", searchable: true },
    source_id: {
      label: "Source",
      type: "relation",
      relation: { table: "account_sources", field: "id", labelField: "name" },
    },
    parent_account_id: {
      label: "Parent Account",
      type: "relation",
      relation: { table: "accounts", field: "id", labelField: "name" },
    },
    rating: {
      type: "select",
      options: [
        { value: "Hot", label: "Hot" },
        { value: "Warm", label: "Warm" },
        { value: "Cold", label: "Cold" },
      ],
    },
    industry: { autocomplete: "industry" },
    ownership: {
      type: "select",
      options: [
        { value: "Privately Held", label: "Privately Held" },
        { value: "Public Company", label: "Public Company" },
        { value: "Partnership", label: "Partnership" },
        { value: "Sole Proprietorship", label: "Sole Proprietorship" },
        { value: "Non-profit", label: "Non-profit" },
        { value: "Government", label: "Government" },
      ],
    },
    description: { wide: true },
    billing_country: { autocomplete: "country" },
    billing_city: { autocomplete: "city" },
    billing_region: { autocomplete: "region" },
    billing_zip: { label: "Billing Zip Code" },
    shipping_country: { autocomplete: "country" },
    shipping_city: { autocomplete: "city" },
    shipping_region: { autocomplete: "region" },
    shipping_zip: { label: "Shipping Zip Code" },
  },
  contacts: {
    is_primary: { label: "Primary" },
    owner_id: {
      label: "Owner",
      type: "relation",
      relation: { table: "employees", field: "id", labelField: "email" },
    },
    phone: { label: "Contact Number" },
    phone2: { label: "Secondary Contact Number" },
    date_of_birth: { label: "Birth Date" },
    source_id: {
      label: "Source",
      type: "relation",
      relation: { table: "contact_sources", field: "id", labelField: "name" },
    },
    parent_contact_id: {
      label: "Parent Contact",
      type: "relation",
      relation: { table: "contacts", field: "id", labelField: "first_name" },
    },
    country: { autocomplete: "country" },
    state: { autocomplete: "region" },
    city: { autocomplete: "city" },
  },
  leads: {
    source_id: {
      label: "Source",
      type: "relation",
      relation: { table: "lead_sources", field: "id", labelField: "name" },
    },
    first_name: { required: true, notNull: true },
    phone: { label: "Contact Number" },
    stage_id: {
      label: "Stage",
      type: "relation",
      relation: { table: "lead_stages", field: "id", labelField: "name" },
    },
    postal_code: { label: "Zip Code" },
    industry: { autocomplete: "industry" },
    country: { autocomplete: "country" },
    region: { autocomplete: "region" },
    city: { autocomplete: "city" },
  },
  opportunities: {
    account_id: { label: "Account", searchable: true },
    stage_id: {
      label: "Stage",
      type: "relation",
      relation: { table: "opportunity_stages", field: "id", labelField: "name" },
    },
    owner_id: { label: "Owner", searchable: true },
    source_id: {
      label: "Lead Source",
      type: "relation",
      relation: { table: "lead_sources", field: "id", labelField: "name" },
    },
    description: { wide: true },
  },
}

/** Columns computed from other fields rather than read from the database. */
const virtualColumns: Record<string, string[]> = {
  employees: ["full_name"],
  accounts: ["contact_number"],
  cash_advances: ["department", "position"],
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
  accounts: [
    "name",
    "account_no",
    "account_type_id",
    "source_id",
    "owner_id",
    "contact_number",
    "status",
  ],
  contacts: [
    "first_name",
    "last_name",
    "title",
    "email",
    "phone",
    "source_id",
  ],
  leads: [
    "title",
    "first_name",
    "last_name",
    "email",
    "stage_id",
    "source_id",
    "industry",
  ],
  opportunities: [
    "opportunity_name",
    "account_id",
    "stage_id",
    "amount",
    "quantity",
    "close_date",
    "email",
    "source_id",
    "owner_id",
  ],
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
  account_types: {
    key: "account_types",
    module: "accounts",
    title: "Account Types",
    singular: "Account Type",
    table: "account_types",
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
  account_sources: {
    key: "account_sources",
    module: "accounts",
    title: "Account Sources",
    singular: "Account Source",
    table: "account_sources",
    fields: [
      { name: "code", label: "Code", type: "text", required: true, notNull: true },
      { name: "name", label: "Name", type: "text", required: true, notNull: true },
      { name: "description", label: "Description", type: "textarea", required: false },
      { name: "sort_order", label: "Sort Order", type: "number", required: false, notNull: true, hasDefault: true },
      { ...activeStatusField, name: "status", label: "Status", type: "select" },
    ],
    columns: ["code", "name", "description", "sort_order", "status"],
    searchColumns: ["code", "name"],
    defaultOrder: "sort_order",
    readOnly: false,
    tenantScoped: true,
  },
  addresses: {
    key: "addresses",
    module: "accounts",
    title: "Addresses",
    singular: "Address",
    table: "addresses",
    fields: [
      { name: "account_id", label: "Account", type: "relation", required: true, notNull: true, relation: { table: "accounts", field: "id", labelField: "name" } },
      {
        name: "address_type",
        label: "Address Type",
        type: "select",
        required: true,
        notNull: true,
        options: [
          { value: "billing", label: "Billing" },
          { value: "shipping", label: "Shipping" },
          { value: "both", label: "Both" },
        ],
      },
      { name: "label", label: "Label", type: "text", required: false },
      { name: "line1", label: "Line 1", type: "text", required: true, notNull: true },
      { name: "line2", label: "Line 2", type: "text", required: false },
      { name: "barangay", label: "Barangay", type: "text", required: false },
      { name: "city", label: "City", type: "text", required: true, notNull: true },
      { name: "province", label: "Province", type: "text", required: false },
      { name: "postal_code", label: "Postal Code", type: "text", required: false },
      { name: "country_code", label: "Country Code", type: "text", required: true, notNull: true, hasDefault: true },
      { name: "contact_id", label: "Contact", type: "relation", required: false, relation: { table: "contacts", field: "id", labelField: "first_name" } },
      { name: "is_default", label: "Default", type: "checkbox", required: false, notNull: true, hasDefault: true },
      { name: "is_active", label: "Active", type: "checkbox", required: false, notNull: true, hasDefault: true },
    ],
    columns: ["address_type", "label", "line1", "city", "is_default"],
    searchColumns: ["label", "line1", "city"],
    defaultOrder: "created_at",
    readOnly: false,
    tenantScoped: false,
    child: true,
    primaryKeys: ["id"],
    parent: { field: "account_id", table: "accounts" },
  },
  lead_stages: {
    key: "lead_stages",
    module: "leads",
    title: "Lead Stages",
    singular: "Lead Stage",
    table: "lead_stages",
    fields: [
      { name: "code", label: "Code", type: "text", required: true, notNull: true },
      { name: "name", label: "Name", type: "text", required: true, notNull: true },
      { name: "description", label: "Description", type: "textarea", required: false },
      { name: "sort_order", label: "Sort Order", type: "number", required: true, notNull: true, hasDefault: true },
      { ...activeStatusField, name: "status", label: "Status", type: "select" },
    ],
    columns: ["code", "name", "description", "sort_order", "status"],
    searchColumns: ["code", "name"],
    defaultOrder: "sort_order",
    readOnly: false,
    tenantScoped: true,
  },
  lead_sources: {
    key: "lead_sources",
    module: "leads",
    title: "Lead Sources",
    singular: "Lead Source",
    table: "lead_sources",
    fields: [
      { name: "code", label: "Code", type: "text", required: true, notNull: true },
      { name: "name", label: "Name", type: "text", required: true, notNull: true },
      { name: "description", label: "Description", type: "textarea", required: false },
      { name: "sort_order", label: "Sort Order", type: "number", required: true, notNull: true, hasDefault: true },
      { ...activeStatusField, name: "status", label: "Status", type: "select" },
    ],
    columns: ["code", "name", "description", "sort_order", "status"],
    searchColumns: ["code", "name"],
    defaultOrder: "sort_order",
    readOnly: false,
    tenantScoped: true,
  },
  contact_sources: {
    key: "contact_sources",
    module: "accounts",
    title: "Contact Sources",
    singular: "Contact Source",
    table: "contact_sources",
    fields: [
      { name: "code", label: "Code", type: "text", required: true, notNull: true },
      { name: "name", label: "Name", type: "text", required: true, notNull: true },
      { name: "description", label: "Description", type: "textarea", required: false },
      { name: "sort_order", label: "Sort Order", type: "number", required: true, notNull: true, hasDefault: true },
      { ...activeStatusField, name: "status", label: "Status", type: "select" },
    ],
    columns: ["code", "name", "description", "sort_order", "status"],
    searchColumns: ["code", "name"],
    defaultOrder: "sort_order",
    readOnly: false,
    tenantScoped: true,
  },
  cash_advances: {
    key: "cash_advances",
    module: "expenses",
    title: "Cash Advances",
    singular: "Cash Advance",
    table: "cash_advances",
    fields: [
      { name: "employee_id", label: "Employee", type: "relation", required: true, notNull: true, relation: { table: "employees", field: "id", labelField: "email" } },
      { name: "date_from", label: "Date From", type: "date", required: true, notNull: true },
      { name: "date_to", label: "Date To", type: "date", required: false },
      { name: "purpose_id", label: "Purpose", type: "relation", required: false, relation: { table: "cash_advance_purposes", field: "id", labelField: "name" } },
      { name: "purpose_other", label: "Specify Purpose", type: "text", required: false, hint: "Fill this in when Purpose is Others.", showWhenRelation: { field: "purpose_id", label: "Others" } },
      { name: "amount", label: "Amount", type: "number", required: true, notNull: true },
      { name: "attachment_path", label: "Attachment", type: "file", required: false, storageBucket: "expense-receipts" },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        notNull: true,
        hasDefault: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "approved", label: "Approved" },
          { value: "released", label: "Released" },
          { value: "settled", label: "Settled" },
          { value: "cancelled", label: "Cancelled" },
        ],
      },
    ],
    columns: ["employee_id", "department", "position", "purpose_id", "date_from", "date_to", "amount", "status"],
    searchColumns: ["purpose_other"],
    defaultOrder: "created_at",
    readOnly: false,
    tenantScoped: true,
    parent: { field: "employee_id", table: "employees" },
  },
  cash_advance_purposes: {
    key: "cash_advance_purposes",
    module: "expenses",
    title: "Cash Advance Purposes",
    singular: "Cash Advance Purpose",
    table: "cash_advance_purposes",
    fields: [
      { name: "code", label: "Code", type: "text", required: true, notNull: true },
      { name: "name", label: "Name", type: "text", required: true, notNull: true },
      { name: "description", label: "Description", type: "textarea", required: false },
      { name: "sort_order", label: "Sort Order", type: "number", required: false, notNull: true, hasDefault: true },
      { ...activeStatusField, name: "status", label: "Status", type: "select" },
    ],
    columns: ["code", "name", "description", "sort_order", "status"],
    searchColumns: ["code", "name"],
    defaultOrder: "sort_order",
    readOnly: false,
    tenantScoped: true,
  },
  business_development_funds: {
    key: "business_development_funds",
    module: "expenses",
    title: "Business Development Funds",
    singular: "Business Development Fund",
    table: "business_development_funds",
    fields: [
      { name: "employee_id", label: "Employee", type: "relation", required: true, notNull: true, relation: { table: "employees", field: "id", labelField: "email" } },
      { name: "fund_date", label: "Fund Date", type: "date", required: true, notNull: true },
      { name: "amount", label: "Amount", type: "number", required: true, notNull: true },
      { name: "purpose", label: "Purpose", type: "textarea", required: false },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        notNull: true,
        hasDefault: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "approved", label: "Approved" },
          { value: "released", label: "Released" },
          { value: "settled", label: "Settled" },
          { value: "cancelled", label: "Cancelled" },
        ],
      },
    ],
    columns: ["employee_id", "fund_date", "amount", "status"],
    searchColumns: ["purpose"],
    defaultOrder: "created_at",
    readOnly: false,
    tenantScoped: true,
    parent: { field: "employee_id", table: "employees" },
  },
  field_expenses: {
    key: "field_expenses",
    module: "expenses",
    title: "Field Expenses",
    singular: "Field Expense",
    table: "field_expenses",
    fields: [
      { name: "employee_id", label: "Employee", type: "relation", required: true, notNull: true, relation: { table: "employees", field: "id", labelField: "email" } },
      { name: "expense_date", label: "Expense Date", type: "date", required: true, notNull: true },
      { name: "category_id", label: "Category", type: "relation", required: false, relation: { table: "expense_categories", field: "id", labelField: "name" } },
      { name: "visit_id", label: "Visit", type: "relation", required: false, relation: { table: "visits", field: "id", labelField: "planned_date" } },
      { name: "amount", label: "Amount", type: "number", required: true, notNull: true },
      { name: "description", label: "Description", type: "textarea", required: false },
      { name: "receipt_url", label: "Receipt URL", type: "text", required: false },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: false,
        notNull: true,
        hasDefault: true,
        options: [
          { value: "draft", label: "Draft" },
          { value: "submitted", label: "Submitted" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
        ],
      },
    ],
    columns: ["employee_id", "expense_date", "category_id", "amount", "status"],
    searchColumns: ["description"],
    defaultOrder: "created_at",
    readOnly: false,
    tenantScoped: true,
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
