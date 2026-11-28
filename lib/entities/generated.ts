/**
 * Generated from supabase/migrations by scripts/generate-entities.mjs.
 * Curated overrides live in lib/entities/registry.ts.
 */
import type { EntityConfig } from "./types"

export const generatedEntities: Record<string, EntityConfig> = {
  organizations: {
    "key": "organizations",
    "module": "administration",
    "title": "Organizations",
    "singular": "Organization",
    "table": "organizations",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "timezone",
        "label": "Timezone",
        "type": "text",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "currency_code",
        "label": "Currency Code",
        "type": "text",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "settings",
        "label": "Settings",
        "type": "json",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "name",
      "code",
      "timezone",
      "currency_code",
      "settings"
    ],
    "searchColumns": [
      "name",
      "code",
      "timezone"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": false
  },
  users: {
    "key": "users",
    "module": "administration",
    "title": "Users",
    "singular": "User",
    "table": "users",
    "fields": [
      {
        "name": "email",
        "label": "Email",
        "type": "email",
        "required": true,
        "notNull": true
      },
      {
        "name": "full_name",
        "label": "Full Name",
        "type": "text",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "avatar_url",
        "label": "Avatar Url",
        "type": "text",
        "required": false
      },
      {
        "name": "phone",
        "label": "Phone",
        "type": "text",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "active",
            "label": "Active"
          },
          {
            "value": "suspended",
            "label": "Suspended"
          },
          {
            "value": "invited",
            "label": "Invited"
          }
        ]
      },
      {
        "name": "is_super_admin",
        "label": "Is Super Admin",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "last_login_at",
        "label": "Last Login At",
        "type": "datetime",
        "required": false
      }
    ],
    "columns": [
      "email",
      "full_name",
      "avatar_url",
      "phone",
      "status",
      "is_super_admin"
    ],
    "searchColumns": [
      "email",
      "full_name",
      "avatar_url"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  roles: {
    "key": "roles",
    "module": "administration",
    "title": "Roles",
    "singular": "Role",
    "table": "roles",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      }
    ],
    "columns": [
      "name",
      "description"
    ],
    "searchColumns": [
      "name",
      "description"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  permissions: {
    "key": "permissions",
    "module": "administration",
    "title": "Permissions",
    "singular": "Permission",
    "table": "permissions",
    "fields": [
      {
        "name": "module",
        "label": "Module",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "action",
        "label": "Action",
        "type": "text",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "module",
      "action"
    ],
    "searchColumns": [
      "module",
      "action"
    ],
    "defaultOrder": "module",
    "readOnly": true,
    "tenantScoped": false
  },
  role_permissions: {
    "key": "role_permissions",
    "module": "administration",
    "title": "Role Permissions",
    "singular": "Role Permission",
    "table": "role_permissions",
    "fields": [
      {
        "name": "role_id",
        "label": "Role Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "roles",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "permission_id",
        "label": "Permission Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "permissions",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "data_scope",
        "label": "Data Scope",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "own",
            "label": "Own"
          },
          {
            "value": "team",
            "label": "Team"
          },
          {
            "value": "territory",
            "label": "Territory"
          },
          {
            "value": "org",
            "label": "Org"
          }
        ]
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "role_id",
      "permission_id",
      "data_scope",
      "primary"
    ],
    "searchColumns": [
      "primary"
    ],
    "defaultOrder": "role_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "role_id",
      "table": "roles"
    },
    "child": true,
    "primaryKeys": [
      "role_id",
      "permission_id"
    ]
  },
  user_roles: {
    "key": "user_roles",
    "module": "administration",
    "title": "User Roles",
    "singular": "User Role",
    "table": "user_roles",
    "fields": [
      {
        "name": "user_id",
        "label": "User Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "role_id",
        "label": "Role Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "roles",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "user_id",
      "role_id",
      "primary"
    ],
    "searchColumns": [
      "primary"
    ],
    "defaultOrder": "user_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "user_id",
      "table": "users"
    },
    "child": true,
    "primaryKeys": [
      "user_id",
      "role_id"
    ]
  },
  audit_logs: {
    "key": "audit_logs",
    "module": "administration",
    "title": "Audit Logs",
    "singular": "Audit Log",
    "table": "audit_logs",
    "fields": [
      {
        "name": "user_id",
        "label": "User Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "module",
        "label": "Module",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "entity_type",
        "label": "Entity Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "entity_id",
        "label": "Entity Id",
        "type": "text",
        "required": false
      },
      {
        "name": "action",
        "label": "Action",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "changes",
        "label": "Changes",
        "type": "json",
        "required": false
      },
      {
        "name": "ip_address",
        "label": "Ip Address",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "user_id",
      "module",
      "entity_type",
      "entity_id",
      "action",
      "changes"
    ],
    "searchColumns": [
      "module",
      "entity_type",
      "entity_id"
    ],
    "defaultOrder": "created_at",
    "readOnly": true,
    "tenantScoped": true,
    "parent": {
      "field": "user_id",
      "table": "users"
    }
  },
  approval_workflows: {
    "key": "approval_workflows",
    "module": "administration",
    "title": "Approval Workflows",
    "singular": "Approval Workflow",
    "table": "approval_workflows",
    "fields": [
      {
        "name": "module",
        "label": "Module",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "steps",
        "label": "Steps",
        "type": "json",
        "required": true,
        "notNull": true
      },
      {
        "name": "is_active",
        "label": "Is Active",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "module",
      "name",
      "steps",
      "is_active"
    ],
    "searchColumns": [
      "module",
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  approvals: {
    "key": "approvals",
    "module": "approvals",
    "title": "Approvals",
    "singular": "Approval",
    "table": "approvals",
    "fields": [
      {
        "name": "workflow_id",
        "label": "Workflow Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "approval_workflows",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "entity_type",
        "label": "Entity Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "entity_id",
        "label": "Entity Id",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "level",
        "label": "Level",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "approver_id",
        "label": "Approver Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "pending",
            "label": "Pending"
          },
          {
            "value": "approved",
            "label": "Approved"
          },
          {
            "value": "rejected",
            "label": "Rejected"
          },
          {
            "value": "skipped",
            "label": "Skipped"
          }
        ]
      },
      {
        "name": "remarks",
        "label": "Remarks",
        "type": "textarea",
        "required": false
      },
      {
        "name": "acted_at",
        "label": "Acted At",
        "type": "datetime",
        "required": false
      }
    ],
    "columns": [
      "workflow_id",
      "entity_type",
      "entity_id",
      "level",
      "approver_id",
      "status"
    ],
    "searchColumns": [
      "entity_type",
      "entity_id",
      "remarks"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "workflow_id",
      "table": "approval_workflows"
    }
  },
  notifications: {
    "key": "notifications",
    "module": "administration",
    "title": "Notifications",
    "singular": "Notification",
    "table": "notifications",
    "fields": [
      {
        "name": "user_id",
        "label": "User Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "title",
        "label": "Title",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "body",
        "label": "Body",
        "type": "textarea",
        "required": false
      },
      {
        "name": "link",
        "label": "Link",
        "type": "text",
        "required": false
      },
      {
        "name": "read_at",
        "label": "Read At",
        "type": "datetime",
        "required": false
      }
    ],
    "columns": [
      "user_id",
      "title",
      "body",
      "link",
      "read_at"
    ],
    "searchColumns": [
      "title",
      "body",
      "link"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "user_id",
      "table": "users"
    }
  },
  master_data_types: {
    "key": "master_data_types",
    "module": "master_data",
    "title": "Master Data Types",
    "singular": "Master Data Type",
    "table": "master_data_types",
    "fields": [
      {
        "name": "code",
        "label": "Code",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "code",
      "name"
    ],
    "searchColumns": [
      "code",
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  master_data_items: {
    "key": "master_data_items",
    "module": "master_data",
    "title": "Master Data Items",
    "singular": "Master Data Item",
    "table": "master_data_items",
    "fields": [
      {
        "name": "type_id",
        "label": "Type Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "master_data_types",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "label",
        "label": "Label",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "metadata",
        "label": "Metadata",
        "type": "json",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "sort_order",
        "label": "Sort Order",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "is_active",
        "label": "Is Active",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "type_id",
      "code",
      "label",
      "metadata",
      "sort_order",
      "is_active"
    ],
    "searchColumns": [
      "code",
      "label"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "type_id",
      "table": "master_data_types"
    }
  },
  territories: {
    "key": "territories",
    "module": "master_data",
    "title": "Territories",
    "singular": "Territorie",
    "table": "territories",
    "fields": [
      {
        "name": "parent_id",
        "label": "Parent Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "territories",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "level",
        "label": "Level",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "boundary",
        "label": "Boundary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "parent_id",
      "name",
      "level",
      "boundary"
    ],
    "searchColumns": [
      "name",
      "level",
      "boundary"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "parent_id",
      "table": "territories"
    }
  },
  uoms: {
    "key": "uoms",
    "module": "master_data",
    "title": "Uoms",
    "singular": "Uom",
    "table": "uoms",
    "fields": [
      {
        "name": "code",
        "label": "Code",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "code",
      "name"
    ],
    "searchColumns": [
      "code",
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  tax_rates: {
    "key": "tax_rates",
    "module": "master_data",
    "title": "Tax Rates",
    "singular": "Tax Rate",
    "table": "tax_rates",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "rate",
        "label": "Rate",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "is_inclusive",
        "label": "Is Inclusive",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "name",
      "rate",
      "is_inclusive"
    ],
    "searchColumns": [
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  departments: {
    "key": "departments",
    "module": "employees",
    "title": "Departments",
    "singular": "Department",
    "table": "departments",
    "fields": [
      {
        "name": "parent_id",
        "label": "Parent Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "departments",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "code",
        "label": "Code",
        "type": "text",
        "required": false
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      },
      {
        "name": "manager_id",
        "label": "Manager Id",
        "type": "text",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "parent_id",
      "name",
      "code",
      "description",
      "manager_id",
      "status"
    ],
    "searchColumns": [
      "name",
      "code",
      "description"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "parent_id",
      "table": "departments"
    }
  },
  positions: {
    "key": "positions",
    "module": "employees",
    "title": "Positions",
    "singular": "Position",
    "table": "positions",
    "fields": [
      {
        "name": "title",
        "label": "Title",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "grade",
        "label": "Grade",
        "type": "text",
        "required": false
      },
      {
        "name": "job_level",
        "label": "Job Level",
        "type": "text",
        "required": false
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      },
      {
        "name": "min_salary",
        "label": "Min Salary",
        "type": "number",
        "required": false
      },
      {
        "name": "max_salary",
        "label": "Max Salary",
        "type": "number",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "title",
      "grade",
      "job_level",
      "description",
      "min_salary",
      "max_salary"
    ],
    "searchColumns": [
      "title",
      "grade",
      "job_level"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  employees: {
    "key": "employees",
    "module": "employees",
    "title": "Employees",
    "singular": "Employee",
    "table": "employees",
    "fields": [
      {
        "name": "user_id",
        "label": "User Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "employee_no",
        "label": "Employee No",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "first_name",
        "label": "First Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "last_name",
        "label": "Last Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "email",
        "label": "Email",
        "type": "email",
        "required": false
      },
      {
        "name": "phone",
        "label": "Phone",
        "type": "text",
        "required": false
      },
      {
        "name": "department_id",
        "label": "Department Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "departments",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "position_id",
        "label": "Position Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "positions",
          "field": "id",
          "labelField": "title"
        }
      },
      {
        "name": "manager_id",
        "label": "Manager Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "territory_id",
        "label": "Territory Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "territories",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "hire_date",
        "label": "Hire Date",
        "type": "date",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "active",
            "label": "Active"
          },
          {
            "value": "on_leave",
            "label": "On Leave"
          },
          {
            "value": "resigned",
            "label": "Resigned"
          },
          {
            "value": "terminated",
            "label": "Terminated"
          }
        ]
      },
      {
        "name": "device_id",
        "label": "Device Id",
        "type": "text",
        "required": false
      },
      {
        "name": "is_field_staff",
        "label": "Is Field Staff",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "middle_name",
        "label": "Middle Name",
        "type": "text",
        "required": false
      },
      {
        "name": "name_suffix",
        "label": "Name Suffix",
        "type": "text",
        "required": false
      },
      {
        "name": "date_of_birth",
        "label": "Date Of Birth",
        "type": "date",
        "required": false
      },
      {
        "name": "sex",
        "label": "Sex",
        "type": "text",
        "required": false
      },
      {
        "name": "civil_status",
        "label": "Civil Status",
        "type": "text",
        "required": false
      },
      {
        "name": "nationality",
        "label": "Nationality",
        "type": "text",
        "required": false
      },
      {
        "name": "place_of_birth",
        "label": "Place Of Birth",
        "type": "text",
        "required": false
      },
      {
        "name": "religion",
        "label": "Religion",
        "type": "text",
        "required": false
      },
      {
        "name": "present_address",
        "label": "Present Address",
        "type": "text",
        "required": false
      },
      {
        "name": "permanent_address",
        "label": "Permanent Address",
        "type": "text",
        "required": false
      },
      {
        "name": "province",
        "label": "Province",
        "type": "text",
        "required": false
      },
      {
        "name": "city_municipality",
        "label": "City Municipality",
        "type": "text",
        "required": false
      },
      {
        "name": "barangay",
        "label": "Barangay",
        "type": "text",
        "required": false
      },
      {
        "name": "zip_code",
        "label": "Zip Code",
        "type": "text",
        "required": false
      },
      {
        "name": "sss_no",
        "label": "Sss No",
        "type": "text",
        "required": false
      },
      {
        "name": "philhealth_no",
        "label": "Philhealth No",
        "type": "text",
        "required": false
      },
      {
        "name": "pagibig_no",
        "label": "Pagibig No",
        "type": "text",
        "required": false
      },
      {
        "name": "tin",
        "label": "Tin",
        "type": "text",
        "required": false
      },
      {
        "name": "umid_no",
        "label": "Umid No",
        "type": "text",
        "required": false
      },
      {
        "name": "passport_no",
        "label": "Passport No",
        "type": "text",
        "required": false
      },
      {
        "name": "drivers_license_no",
        "label": "Drivers License No",
        "type": "text",
        "required": false
      },
      {
        "name": "prc_license_no",
        "label": "Prc License No",
        "type": "text",
        "required": false
      },
      {
        "name": "emergency_contact_name",
        "label": "Emergency Contact Name",
        "type": "text",
        "required": false
      },
      {
        "name": "emergency_contact_relationship",
        "label": "Emergency Contact Relationship",
        "type": "text",
        "required": false
      },
      {
        "name": "emergency_contact_phone",
        "label": "Emergency Contact Phone",
        "type": "text",
        "required": false
      },
      {
        "name": "emergency_contact_address",
        "label": "Emergency Contact Address",
        "type": "text",
        "required": false
      },
      {
        "name": "regularization_date",
        "label": "Regularization Date",
        "type": "date",
        "required": false
      },
      {
        "name": "employment_type",
        "label": "Employment Type",
        "type": "text",
        "required": false
      },
      {
        "name": "basic_salary",
        "label": "Basic Salary",
        "type": "number",
        "required": false
      },
      {
        "name": "pay_frequency",
        "label": "Pay Frequency",
        "type": "text",
        "required": false
      },
      {
        "name": "bank_name",
        "label": "Bank Name",
        "type": "text",
        "required": false
      },
      {
        "name": "bank_account_no",
        "label": "Bank Account No",
        "type": "text",
        "required": false
      },
      {
        "name": "highest_education",
        "label": "Highest Education",
        "type": "text",
        "required": false
      },
      {
        "name": "school_name",
        "label": "School Name",
        "type": "text",
        "required": false
      },
      {
        "name": "course",
        "label": "Course",
        "type": "text",
        "required": false
      },
      {
        "name": "year_graduated",
        "label": "Year Graduated",
        "type": "number",
        "required": false
      },
      {
        "name": "employment_type_id",
        "label": "Employment Type Id",
        "type": "text",
        "required": false
      },
      {
        "name": "present_province",
        "label": "Present Province",
        "type": "text",
        "required": false
      },
      {
        "name": "present_city_municipality",
        "label": "Present City Municipality",
        "type": "text",
        "required": false
      },
      {
        "name": "present_barangay",
        "label": "Present Barangay",
        "type": "text",
        "required": false
      },
      {
        "name": "present_zip_code",
        "label": "Present Zip Code",
        "type": "text",
        "required": false
      },
      {
        "name": "permanent_province",
        "label": "Permanent Province",
        "type": "text",
        "required": false
      },
      {
        "name": "permanent_city_municipality",
        "label": "Permanent City Municipality",
        "type": "text",
        "required": false
      },
      {
        "name": "permanent_barangay",
        "label": "Permanent Barangay",
        "type": "text",
        "required": false
      },
      {
        "name": "permanent_zip_code",
        "label": "Permanent Zip Code",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "user_id",
      "employee_no",
      "first_name",
      "last_name",
      "email",
      "phone"
    ],
    "searchColumns": [
      "employee_no",
      "first_name",
      "last_name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "user_id",
      "table": "users"
    }
  },
  employee_documents: {
    "key": "employee_documents",
    "module": "employees",
    "title": "Employee Documents",
    "singular": "Employee Document",
    "table": "employee_documents",
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "doc_type",
        "label": "Doc Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "file_url",
        "label": "File Url",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "expires_on",
        "label": "Expires On",
        "type": "date",
        "required": false
      }
    ],
    "columns": [
      "employee_id",
      "doc_type",
      "file_url",
      "expires_on"
    ],
    "searchColumns": [
      "doc_type",
      "file_url"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    }
  },
  shifts: {
    "key": "shifts",
    "module": "attendance",
    "title": "Shifts",
    "singular": "Shift",
    "table": "shifts",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "start_time",
        "label": "Start Time",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "end_time",
        "label": "End Time",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "grace_minutes",
        "label": "Grace Minutes",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "name",
      "start_time",
      "end_time",
      "grace_minutes"
    ],
    "searchColumns": [
      "name",
      "start_time",
      "end_time"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  employee_shifts: {
    "key": "employee_shifts",
    "module": "attendance",
    "title": "Employee Shifts",
    "singular": "Employee Shift",
    "table": "employee_shifts",
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "shift_id",
        "label": "Shift Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "shifts",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "effective_from",
        "label": "Effective From",
        "type": "date",
        "required": true,
        "notNull": true
      },
      {
        "name": "effective_to",
        "label": "Effective To",
        "type": "date",
        "required": false
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "employee_id",
      "shift_id",
      "effective_from",
      "effective_to",
      "primary"
    ],
    "searchColumns": [
      "primary"
    ],
    "defaultOrder": "employee_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    },
    "child": true,
    "primaryKeys": [
      "employee_id",
      "shift_id",
      "effective_from"
    ]
  },
  attendances: {
    "key": "attendances",
    "module": "attendance",
    "title": "Attendances",
    "singular": "Attendance",
    "table": "attendances",
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "work_date",
        "label": "Work Date",
        "type": "date",
        "required": true,
        "notNull": true
      },
      {
        "name": "clock_in_at",
        "label": "Clock In At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "clock_out_at",
        "label": "Clock Out At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "clock_in_loc",
        "label": "Clock In Loc",
        "type": "text",
        "required": false
      },
      {
        "name": "clock_out_loc",
        "label": "Clock Out Loc",
        "type": "text",
        "required": false
      },
      {
        "name": "clock_in_photo",
        "label": "Clock In Photo",
        "type": "text",
        "required": false
      },
      {
        "name": "clock_out_photo",
        "label": "Clock Out Photo",
        "type": "text",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "present",
            "label": "Present"
          },
          {
            "value": "late",
            "label": "Late"
          },
          {
            "value": "absent",
            "label": "Absent"
          },
          {
            "value": "half_day",
            "label": "Half Day"
          },
          {
            "value": "on_leave",
            "label": "On Leave"
          },
          {
            "value": "holiday",
            "label": "Holiday"
          }
        ]
      },
      {
        "name": "late_minutes",
        "label": "Late Minutes",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "overtime_minutes",
        "label": "Overtime Minutes",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "is_within_geofence",
        "label": "Is Within Geofence",
        "type": "checkbox",
        "required": false
      },
      {
        "name": "remarks",
        "label": "Remarks",
        "type": "textarea",
        "required": false
      },
      {
        "name": "client_uuid",
        "label": "Client Uuid",
        "type": "text",
        "required": false
      },
      {
        "name": "synced_at",
        "label": "Synced At",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "employee_id",
      "work_date",
      "clock_in_at",
      "clock_out_at",
      "clock_in_loc",
      "clock_out_loc"
    ],
    "searchColumns": [
      "clock_in_loc",
      "clock_out_loc",
      "clock_in_photo"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    }
  },
  leave_types: {
    "key": "leave_types",
    "module": "leaves",
    "title": "Leave Types",
    "singular": "Leave Type",
    "table": "leave_types",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "is_paid",
        "label": "Is Paid",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "annual_quota",
        "label": "Annual Quota",
        "type": "number",
        "required": false
      },
      {
        "name": "carry_over",
        "label": "Carry Over",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "name",
      "is_paid",
      "annual_quota",
      "carry_over"
    ],
    "searchColumns": [
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  leave_balances: {
    "key": "leave_balances",
    "module": "leaves",
    "title": "Leave Balances",
    "singular": "Leave Balance",
    "table": "leave_balances",
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "leave_type_id",
        "label": "Leave Type Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "leave_types",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "year",
        "label": "Year",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "entitled",
        "label": "Entitled",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "used",
        "label": "Used",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "employee_id",
      "leave_type_id",
      "year",
      "entitled",
      "used",
      "primary"
    ],
    "searchColumns": [
      "primary"
    ],
    "defaultOrder": "employee_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    },
    "child": true,
    "primaryKeys": [
      "employee_id",
      "leave_type_id",
      "year"
    ]
  },
  leaves: {
    "key": "leaves",
    "module": "leaves",
    "title": "Leaves",
    "singular": "Leave",
    "table": "leaves",
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "leave_type_id",
        "label": "Leave Type Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "leave_types",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "start_date",
        "label": "Start Date",
        "type": "date",
        "required": true,
        "notNull": true
      },
      {
        "name": "end_date",
        "label": "End Date",
        "type": "date",
        "required": true,
        "notNull": true
      },
      {
        "name": "days",
        "label": "Days",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "reason",
        "label": "Reason",
        "type": "text",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "draft",
            "label": "Draft"
          },
          {
            "value": "pending",
            "label": "Pending"
          },
          {
            "value": "approved",
            "label": "Approved"
          },
          {
            "value": "rejected",
            "label": "Rejected"
          },
          {
            "value": "cancelled",
            "label": "Cancelled"
          }
        ]
      }
    ],
    "columns": [
      "employee_id",
      "leave_type_id",
      "start_date",
      "end_date",
      "days",
      "reason"
    ],
    "searchColumns": [
      "reason"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    }
  },
  holidays: {
    "key": "holidays",
    "module": "leaves",
    "title": "Holidays",
    "singular": "Holiday",
    "table": "holidays",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "holiday_date",
        "label": "Holiday Date",
        "type": "date",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "name",
      "holiday_date"
    ],
    "searchColumns": [
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  accounts: {
    "key": "accounts",
    "module": "accounts",
    "title": "Accounts",
    "singular": "Account",
    "table": "accounts",
    "fields": [
      {
        "name": "account_no",
        "label": "Account No",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "legal_name",
        "label": "Legal Name",
        "type": "text",
        "required": false
      },
      {
        "name": "tax_id",
        "label": "Tax Id",
        "type": "text",
        "required": false
      },
      {
        "name": "owner_id",
        "label": "Owner Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "price_list_id",
        "label": "Price List Id",
        "type": "text",
        "required": false
      },
      {
        "name": "payment_term_days",
        "label": "Payment Term Days",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "credit_limit",
        "label": "Credit Limit",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "prospect",
            "label": "Prospect"
          },
          {
            "value": "active",
            "label": "Active"
          },
          {
            "value": "inactive",
            "label": "Inactive"
          },
          {
            "value": "blocked",
            "label": "Blocked"
          }
        ]
      },
      {
        "name": "account_type_id",
        "label": "Account Type Id",
        "type": "text",
        "required": false
      },
      {
        "name": "source_id",
        "label": "Source Id",
        "type": "text",
        "required": false
      },
      {
        "name": "parent_account_id",
        "label": "Parent Account Id",
        "type": "text",
        "required": false
      },
      {
        "name": "account_site",
        "label": "Account Site",
        "type": "text",
        "required": false
      },
      {
        "name": "website",
        "label": "Website",
        "type": "text",
        "required": false
      },
      {
        "name": "is_partner",
        "label": "Is Partner",
        "type": "checkbox",
        "required": false
      },
      {
        "name": "rating",
        "label": "Rating",
        "type": "text",
        "required": false
      },
      {
        "name": "industry",
        "label": "Industry",
        "type": "text",
        "required": false
      },
      {
        "name": "number_of_employees",
        "label": "Number Of Employees",
        "type": "number",
        "required": false
      },
      {
        "name": "ownership",
        "label": "Ownership",
        "type": "text",
        "required": false
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      },
      {
        "name": "billing_country",
        "label": "Billing Country",
        "type": "text",
        "required": false
      },
      {
        "name": "billing_city",
        "label": "Billing City",
        "type": "text",
        "required": false
      },
      {
        "name": "billing_region",
        "label": "Billing Region",
        "type": "text",
        "required": false
      },
      {
        "name": "billing_zip",
        "label": "Billing Zip",
        "type": "text",
        "required": false
      },
      {
        "name": "shipping_country",
        "label": "Shipping Country",
        "type": "text",
        "required": false
      },
      {
        "name": "shipping_city",
        "label": "Shipping City",
        "type": "text",
        "required": false
      },
      {
        "name": "shipping_region",
        "label": "Shipping Region",
        "type": "text",
        "required": false
      },
      {
        "name": "shipping_zip",
        "label": "Shipping Zip",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "account_no",
      "name",
      "legal_name",
      "tax_id",
      "owner_id",
      "price_list_id"
    ],
    "searchColumns": [
      "account_no",
      "name",
      "legal_name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "owner_id",
      "table": "employees"
    }
  },
  contacts: {
    "key": "contacts",
    "module": "accounts",
    "title": "Contacts",
    "singular": "Contact",
    "table": "contacts",
    "fields": [
      {
        "name": "account_id",
        "label": "Account Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "accounts",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "first_name",
        "label": "First Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "last_name",
        "label": "Last Name",
        "type": "text",
        "required": false
      },
      {
        "name": "title",
        "label": "Title",
        "type": "text",
        "required": false
      },
      {
        "name": "email",
        "label": "Email",
        "type": "email",
        "required": false
      },
      {
        "name": "phone",
        "label": "Phone",
        "type": "text",
        "required": false
      },
      {
        "name": "is_primary",
        "label": "Is Primary",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "owner_id",
        "label": "Owner Id",
        "type": "text",
        "required": false
      },
      {
        "name": "phone2",
        "label": "Phone2",
        "type": "text",
        "required": false
      },
      {
        "name": "date_of_birth",
        "label": "Date Of Birth",
        "type": "date",
        "required": false
      },
      {
        "name": "source_id",
        "label": "Source Id",
        "type": "text",
        "required": false
      },
      {
        "name": "parent_contact_id",
        "label": "Parent Contact Id",
        "type": "text",
        "required": false
      },
      {
        "name": "country",
        "label": "Country",
        "type": "text",
        "required": false
      },
      {
        "name": "state",
        "label": "State",
        "type": "text",
        "required": false
      },
      {
        "name": "city",
        "label": "City",
        "type": "text",
        "required": false
      },
      {
        "name": "zip",
        "label": "Zip",
        "type": "text",
        "required": false
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      }
    ],
    "columns": [
      "account_id",
      "first_name",
      "last_name",
      "title",
      "email",
      "phone"
    ],
    "searchColumns": [
      "first_name",
      "last_name",
      "title"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "account_id",
      "table": "accounts"
    }
  },
  leads: {
    "key": "leads",
    "module": "leads",
    "title": "Leads",
    "singular": "Lead",
    "table": "leads",
    "fields": [
      {
        "name": "company",
        "label": "Company",
        "type": "text",
        "required": false
      },
      {
        "name": "email",
        "label": "Email",
        "type": "email",
        "required": false
      },
      {
        "name": "phone",
        "label": "Phone",
        "type": "text",
        "required": false
      },
      {
        "name": "owner_id",
        "label": "Owner Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "score",
        "label": "Score",
        "type": "number",
        "required": false
      },
      {
        "name": "location",
        "label": "Location",
        "type": "text",
        "required": false
      },
      {
        "name": "converted_account_id",
        "label": "Converted Account Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "accounts",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "converted_at",
        "label": "Converted At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "stage_id",
        "label": "Stage Id",
        "type": "text",
        "required": false
      },
      {
        "name": "first_name",
        "label": "First Name",
        "type": "text",
        "required": false
      },
      {
        "name": "last_name",
        "label": "Last Name",
        "type": "text",
        "required": false
      },
      {
        "name": "title",
        "label": "Title",
        "type": "text",
        "required": false
      },
      {
        "name": "industry",
        "label": "Industry",
        "type": "text",
        "required": false
      },
      {
        "name": "country",
        "label": "Country",
        "type": "text",
        "required": false
      },
      {
        "name": "region",
        "label": "Region",
        "type": "text",
        "required": false
      },
      {
        "name": "city",
        "label": "City",
        "type": "text",
        "required": false
      },
      {
        "name": "postal_code",
        "label": "Postal Code",
        "type": "text",
        "required": false
      },
      {
        "name": "remarks",
        "label": "Remarks",
        "type": "textarea",
        "required": false
      },
      {
        "name": "source_id",
        "label": "Source Id",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "company",
      "email",
      "phone",
      "owner_id",
      "score",
      "location"
    ],
    "searchColumns": [
      "company",
      "email",
      "phone"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "owner_id",
      "table": "employees"
    }
  },
  opportunities: {
    "key": "opportunities",
    "module": "opportunities",
    "title": "Opportunities",
    "singular": "Opportunitie",
    "table": "opportunities",
    "fields": [
      {
        "name": "account_id",
        "label": "Account Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "accounts",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "opportunity_name",
        "label": "Opportunity Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "stage_id",
        "label": "Stage Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "opportunity_stages",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "amount",
        "label": "Amount",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "close_date",
        "label": "Close Date",
        "type": "date",
        "required": false
      },
      {
        "name": "owner_id",
        "label": "Owner Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "lost_reason",
        "label": "Lost Reason",
        "type": "text",
        "required": false
      },
      {
        "name": "email",
        "label": "Email",
        "type": "email",
        "required": false
      },
      {
        "name": "quantity",
        "label": "Quantity",
        "type": "number",
        "required": false
      },
      {
        "name": "source_id",
        "label": "Source Id",
        "type": "text",
        "required": false
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      }
    ],
    "columns": [
      "account_id",
      "opportunity_name",
      "stage_id",
      "amount",
      "close_date",
      "owner_id"
    ],
    "searchColumns": [
      "opportunity_name",
      "lost_reason",
      "email"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "account_id",
      "table": "accounts"
    }
  },
  activities: {
    "key": "activities",
    "module": "activities",
    "title": "Activities",
    "singular": "Activitie",
    "table": "activities",
    "fields": [
      {
        "name": "entity_type",
        "label": "Entity Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "entity_id",
        "label": "Entity Id",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "type",
        "label": "Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "subject",
        "label": "Subject",
        "type": "text",
        "required": false
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "textarea",
        "required": false
      },
      {
        "name": "due_at",
        "label": "Due At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "done_at",
        "label": "Done At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "owner_id",
        "label": "Owner Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      }
    ],
    "columns": [
      "entity_type",
      "entity_id",
      "type",
      "subject",
      "notes",
      "due_at"
    ],
    "searchColumns": [
      "entity_type",
      "entity_id",
      "type"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "owner_id",
      "table": "employees"
    }
  },
  outlets: {
    "key": "outlets",
    "module": "outlets",
    "title": "Outlets",
    "singular": "Outlet",
    "table": "outlets",
    "fields": [
      {
        "name": "account_id",
        "label": "Account Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "accounts",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "outlet_code",
        "label": "Outlet Code",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "outlet_type",
        "label": "Outlet Type",
        "type": "text",
        "required": false
      },
      {
        "name": "tier",
        "label": "Tier",
        "type": "text",
        "required": false
      },
      {
        "name": "address",
        "label": "Address",
        "type": "textarea",
        "required": false
      },
      {
        "name": "territory_id",
        "label": "Territory Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "territories",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "location",
        "label": "Location",
        "type": "text",
        "required": false
      },
      {
        "name": "geofence_radius_m",
        "label": "Geofence Radius M",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "visit_frequency",
        "label": "Visit Frequency",
        "type": "text",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "prospect",
            "label": "Prospect"
          },
          {
            "value": "active",
            "label": "Active"
          },
          {
            "value": "inactive",
            "label": "Inactive"
          },
          {
            "value": "closed",
            "label": "Closed"
          }
        ]
      },
      {
        "name": "photos",
        "label": "Photos",
        "type": "json",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "account_id",
      "outlet_code",
      "name",
      "outlet_type",
      "tier",
      "address"
    ],
    "searchColumns": [
      "outlet_code",
      "name",
      "outlet_type"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "account_id",
      "table": "accounts"
    }
  },
  routes: {
    "key": "routes",
    "module": "visits",
    "title": "Routes",
    "singular": "Route",
    "table": "routes",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "day_of_week",
        "label": "Day Of Week",
        "type": "number",
        "required": false
      }
    ],
    "columns": [
      "name",
      "employee_id",
      "day_of_week"
    ],
    "searchColumns": [
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    }
  },
  route_stops: {
    "key": "route_stops",
    "module": "visits",
    "title": "Route Stops",
    "singular": "Route Stop",
    "table": "route_stops",
    "fields": [
      {
        "name": "route_id",
        "label": "Route Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "routes",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "outlet_id",
        "label": "Outlet Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "outlets",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "sequence",
        "label": "Sequence",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "route_id",
      "outlet_id",
      "sequence",
      "primary"
    ],
    "searchColumns": [
      "primary"
    ],
    "defaultOrder": "route_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "route_id",
      "table": "routes"
    },
    "child": true,
    "primaryKeys": [
      "route_id",
      "outlet_id"
    ]
  },
  visits: {
    "key": "visits",
    "module": "visits",
    "title": "Visits",
    "singular": "Visit",
    "table": "visits",
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "outlet_id",
        "label": "Outlet Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "outlets",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "route_id",
        "label": "Route Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "routes",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "planned_date",
        "label": "Planned Date",
        "type": "date",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "planned",
            "label": "Planned"
          },
          {
            "value": "in_progress",
            "label": "In Progress"
          },
          {
            "value": "completed",
            "label": "Completed"
          },
          {
            "value": "skipped",
            "label": "Skipped"
          },
          {
            "value": "missed",
            "label": "Missed"
          }
        ]
      },
      {
        "name": "check_in_at",
        "label": "Check In At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "check_out_at",
        "label": "Check Out At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "check_in_loc",
        "label": "Check In Loc",
        "type": "text",
        "required": false
      },
      {
        "name": "check_out_loc",
        "label": "Check Out Loc",
        "type": "text",
        "required": false
      },
      {
        "name": "distance_from_outlet_m",
        "label": "Distance From Outlet M",
        "type": "number",
        "required": false
      },
      {
        "name": "skip_reason",
        "label": "Skip Reason",
        "type": "text",
        "required": false
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "textarea",
        "required": false
      },
      {
        "name": "client_uuid",
        "label": "Client Uuid",
        "type": "text",
        "required": false
      },
      {
        "name": "synced_at",
        "label": "Synced At",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "employee_id",
      "outlet_id",
      "route_id",
      "planned_date",
      "status",
      "check_in_at"
    ],
    "searchColumns": [
      "check_in_loc",
      "check_out_loc",
      "skip_reason"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    }
  },
  visit_photos: {
    "key": "visit_photos",
    "module": "visits",
    "title": "Visit Photos",
    "singular": "Visit Photo",
    "table": "visit_photos",
    "fields": [
      {
        "name": "visit_id",
        "label": "Visit Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "visits",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "file_url",
        "label": "File Url",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "caption",
        "label": "Caption",
        "type": "text",
        "required": false
      },
      {
        "name": "taken_at",
        "label": "Taken At",
        "type": "datetime",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "visit_id",
      "file_url",
      "caption",
      "taken_at"
    ],
    "searchColumns": [
      "file_url",
      "caption"
    ],
    "defaultOrder": "visit_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "visit_id",
      "table": "visits"
    }
  },
  location_pings: {
    "key": "location_pings",
    "module": "tracking",
    "title": "Location Pings",
    "singular": "Location Ping",
    "table": "location_pings",
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "recorded_at",
        "label": "Recorded At",
        "type": "datetime",
        "required": true,
        "notNull": true
      },
      {
        "name": "location",
        "label": "Location",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "accuracy_m",
        "label": "Accuracy M",
        "type": "number",
        "required": false
      },
      {
        "name": "speed_mps",
        "label": "Speed Mps",
        "type": "number",
        "required": false
      },
      {
        "name": "battery_pct",
        "label": "Battery Pct",
        "type": "number",
        "required": false
      },
      {
        "name": "is_mock",
        "label": "Is Mock",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "employee_id",
      "recorded_at",
      "location",
      "accuracy_m",
      "speed_mps",
      "battery_pct"
    ],
    "searchColumns": [
      "location",
      "primary"
    ],
    "defaultOrder": "employee_id",
    "readOnly": true,
    "tenantScoped": true,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    }
  },
  geofences: {
    "key": "geofences",
    "module": "tracking",
    "title": "Geofences",
    "singular": "Geofence",
    "table": "geofences",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "shape",
        "label": "Shape",
        "type": "text",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "name",
      "shape"
    ],
    "searchColumns": [
      "name",
      "shape"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  product_categories: {
    "key": "product_categories",
    "module": "products",
    "title": "Product Categories",
    "singular": "Product Categorie",
    "table": "product_categories",
    "fields": [
      {
        "name": "parent_id",
        "label": "Parent Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "product_categories",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "parent_id",
      "name"
    ],
    "searchColumns": [
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "parent_id",
      "table": "product_categories"
    }
  },
  products: {
    "key": "products",
    "module": "products",
    "title": "Products",
    "singular": "Product",
    "table": "products",
    "fields": [
      {
        "name": "sku",
        "label": "Sku",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "barcode",
        "label": "Barcode",
        "type": "text",
        "required": false
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      },
      {
        "name": "category_id",
        "label": "Category Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "product_categories",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "brand",
        "label": "Brand",
        "type": "text",
        "required": false
      },
      {
        "name": "product_type",
        "label": "Product Type",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "finished",
            "label": "Finished"
          },
          {
            "value": "raw_material",
            "label": "Raw Material"
          },
          {
            "value": "semi_finished",
            "label": "Semi Finished"
          },
          {
            "value": "service",
            "label": "Service"
          }
        ]
      },
      {
        "name": "base_uom_id",
        "label": "Base Uom Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "uoms",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "tax_rate_id",
        "label": "Tax Rate Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "tax_rates",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "cost",
        "label": "Cost",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "is_batch_tracked",
        "label": "Is Batch Tracked",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "is_active",
        "label": "Is Active",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "image_url",
        "label": "Image Url",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "sku",
      "barcode",
      "name",
      "description",
      "category_id",
      "brand"
    ],
    "searchColumns": [
      "sku",
      "barcode",
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "category_id",
      "table": "product_categories"
    }
  },
  product_uom_conversions: {
    "key": "product_uom_conversions",
    "module": "products",
    "title": "Product Uom Conversions",
    "singular": "Product Uom Conversion",
    "table": "product_uom_conversions",
    "fields": [
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "uom_id",
        "label": "Uom Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "uoms",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "factor",
        "label": "Factor",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "product_id",
      "uom_id",
      "factor",
      "primary"
    ],
    "searchColumns": [
      "primary"
    ],
    "defaultOrder": "product_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "product_id",
      "table": "products"
    },
    "child": true,
    "primaryKeys": [
      "product_id",
      "uom_id"
    ]
  },
  price_lists: {
    "key": "price_lists",
    "module": "products",
    "title": "Price Lists",
    "singular": "Price List",
    "table": "price_lists",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "currency_code",
        "label": "Currency Code",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "valid_from",
        "label": "Valid From",
        "type": "date",
        "required": false
      },
      {
        "name": "valid_to",
        "label": "Valid To",
        "type": "date",
        "required": false
      },
      {
        "name": "is_default",
        "label": "Is Default",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "name",
      "currency_code",
      "valid_from",
      "valid_to",
      "is_default"
    ],
    "searchColumns": [
      "name",
      "currency_code"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  price_list_items: {
    "key": "price_list_items",
    "module": "products",
    "title": "Price List Items",
    "singular": "Price List Item",
    "table": "price_list_items",
    "fields": [
      {
        "name": "price_list_id",
        "label": "Price List Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "price_lists",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "uom_id",
        "label": "Uom Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "uoms",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "price",
        "label": "Price",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "min_qty",
        "label": "Min Qty",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "price_list_id",
      "product_id",
      "uom_id",
      "price",
      "min_qty",
      "primary"
    ],
    "searchColumns": [
      "primary"
    ],
    "defaultOrder": "price_list_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "price_list_id",
      "table": "price_lists"
    },
    "child": true,
    "primaryKeys": [
      "price_list_id",
      "product_id",
      "uom_id",
      "min_qty"
    ]
  },
  warehouses: {
    "key": "warehouses",
    "module": "inventory",
    "title": "Warehouses",
    "singular": "Warehouse",
    "table": "warehouses",
    "fields": [
      {
        "name": "code",
        "label": "Code",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "type",
        "label": "Type",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "warehouse",
            "label": "Warehouse"
          },
          {
            "value": "van",
            "label": "Van"
          },
          {
            "value": "store",
            "label": "Store"
          },
          {
            "value": "transit",
            "label": "Transit"
          }
        ]
      },
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "address",
        "label": "Address",
        "type": "textarea",
        "required": false
      }
    ],
    "columns": [
      "code",
      "name",
      "type",
      "employee_id",
      "address"
    ],
    "searchColumns": [
      "code",
      "name",
      "address"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    }
  },
  batches: {
    "key": "batches",
    "module": "products",
    "title": "Batches",
    "singular": "Batche",
    "table": "batches",
    "fields": [
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "batch_no",
        "label": "Batch No",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "mfg_date",
        "label": "Mfg Date",
        "type": "date",
        "required": false
      },
      {
        "name": "expiry_date",
        "label": "Expiry Date",
        "type": "date",
        "required": false
      }
    ],
    "columns": [
      "product_id",
      "batch_no",
      "mfg_date",
      "expiry_date"
    ],
    "searchColumns": [
      "batch_no"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "product_id",
      "table": "products"
    }
  },
  stock_levels: {
    "key": "stock_levels",
    "module": "inventory",
    "title": "Stock Levels",
    "singular": "Stock Level",
    "table": "stock_levels",
    "fields": [
      {
        "name": "warehouse_id",
        "label": "Warehouse Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "warehouses",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "batch_id",
        "label": "Batch Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "batches",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "on_hand",
        "label": "On Hand",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "reserved",
        "label": "Reserved",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "available",
        "label": "Available",
        "type": "number",
        "required": false
      },
      {
        "name": "reorder_level",
        "label": "Reorder Level",
        "type": "number",
        "required": false
      }
    ],
    "columns": [
      "warehouse_id",
      "product_id",
      "batch_id",
      "on_hand",
      "reserved",
      "available"
    ],
    "searchColumns": [],
    "defaultOrder": "warehouse_id",
    "readOnly": true,
    "tenantScoped": false,
    "parent": {
      "field": "warehouse_id",
      "table": "warehouses"
    }
  },
  stock_movements: {
    "key": "stock_movements",
    "module": "inventory",
    "title": "Stock Movements",
    "singular": "Stock Movement",
    "table": "stock_movements",
    "fields": [
      {
        "name": "warehouse_id",
        "label": "Warehouse Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "warehouses",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "batch_id",
        "label": "Batch Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "batches",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "movement_type",
        "label": "Movement Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "quantity",
        "label": "Quantity",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "unit_cost",
        "label": "Unit Cost",
        "type": "number",
        "required": false
      },
      {
        "name": "ref_type",
        "label": "Ref Type",
        "type": "text",
        "required": false
      },
      {
        "name": "ref_id",
        "label": "Ref Id",
        "type": "text",
        "required": false
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "textarea",
        "required": false
      },
      {
        "name": "created_by",
        "label": "Created By",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      }
    ],
    "columns": [
      "warehouse_id",
      "product_id",
      "batch_id",
      "movement_type",
      "quantity",
      "unit_cost"
    ],
    "searchColumns": [
      "movement_type",
      "ref_type",
      "ref_id"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "warehouse_id",
      "table": "warehouses"
    }
  },
  stock_counts: {
    "key": "stock_counts",
    "module": "inventory",
    "title": "Stock Counts",
    "singular": "Stock Count",
    "table": "stock_counts",
    "fields": [
      {
        "name": "warehouse_id",
        "label": "Warehouse Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "warehouses",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "counted_at",
        "label": "Counted At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "counted_by",
        "label": "Counted By",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      }
    ],
    "columns": [
      "warehouse_id",
      "counted_at",
      "counted_by"
    ],
    "searchColumns": [],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "warehouse_id",
      "table": "warehouses"
    }
  },
  stock_count_lines: {
    "key": "stock_count_lines",
    "module": "inventory",
    "title": "Stock Count Lines",
    "singular": "Stock Count Line",
    "table": "stock_count_lines",
    "fields": [
      {
        "name": "count_id",
        "label": "Count Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "stock_counts",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "batch_id",
        "label": "Batch Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "batches",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "system_qty",
        "label": "System Qty",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "counted_qty",
        "label": "Counted Qty",
        "type": "number",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "count_id",
      "product_id",
      "batch_id",
      "system_qty",
      "counted_qty"
    ],
    "searchColumns": [],
    "defaultOrder": "count_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "count_id",
      "table": "stock_counts"
    }
  },
  boms: {
    "key": "boms",
    "module": "production",
    "title": "Boms",
    "singular": "Bom",
    "table": "boms",
    "fields": [
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "version",
        "label": "Version",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "output_qty",
        "label": "Output Qty",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "is_active",
        "label": "Is Active",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "product_id",
      "version",
      "output_qty",
      "is_active"
    ],
    "searchColumns": [],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "product_id",
      "table": "products"
    }
  },
  bom_items: {
    "key": "bom_items",
    "module": "production",
    "title": "Bom Items",
    "singular": "Bom Item",
    "table": "bom_items",
    "fields": [
      {
        "name": "bom_id",
        "label": "Bom Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "boms",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "component_id",
        "label": "Component Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "quantity",
        "label": "Quantity",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "scrap_pct",
        "label": "Scrap Pct",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "bom_id",
      "component_id",
      "quantity",
      "scrap_pct",
      "primary"
    ],
    "searchColumns": [
      "primary"
    ],
    "defaultOrder": "bom_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "bom_id",
      "table": "boms"
    },
    "child": true,
    "primaryKeys": [
      "bom_id",
      "component_id"
    ]
  },
  production_orders: {
    "key": "production_orders",
    "module": "production",
    "title": "Production Orders",
    "singular": "Production Order",
    "table": "production_orders",
    "fields": [
      {
        "name": "order_no",
        "label": "Order No",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "bom_id",
        "label": "Bom Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "boms",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "warehouse_id",
        "label": "Warehouse Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "warehouses",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "planned_qty",
        "label": "Planned Qty",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "produced_qty",
        "label": "Produced Qty",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "scrap_qty",
        "label": "Scrap Qty",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "planned",
            "label": "Planned"
          },
          {
            "value": "released",
            "label": "Released"
          },
          {
            "value": "in_progress",
            "label": "In Progress"
          },
          {
            "value": "completed",
            "label": "Completed"
          },
          {
            "value": "cancelled",
            "label": "Cancelled"
          }
        ]
      },
      {
        "name": "start_date",
        "label": "Start Date",
        "type": "date",
        "required": false
      },
      {
        "name": "end_date",
        "label": "End Date",
        "type": "date",
        "required": false
      }
    ],
    "columns": [
      "order_no",
      "bom_id",
      "warehouse_id",
      "planned_qty",
      "produced_qty",
      "scrap_qty"
    ],
    "searchColumns": [
      "order_no"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "bom_id",
      "table": "boms"
    }
  },
  production_consumption: {
    "key": "production_consumption",
    "module": "production",
    "title": "Production Consumption",
    "singular": "Production Consumption",
    "table": "production_consumption",
    "fields": [
      {
        "name": "production_order_id",
        "label": "Production Order Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "production_orders",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "component_id",
        "label": "Component Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "planned_qty",
        "label": "Planned Qty",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "actual_qty",
        "label": "Actual Qty",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "production_order_id",
      "component_id",
      "planned_qty",
      "actual_qty",
      "primary"
    ],
    "searchColumns": [
      "primary"
    ],
    "defaultOrder": "production_order_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "production_order_id",
      "table": "production_orders"
    },
    "child": true,
    "primaryKeys": [
      "production_order_id",
      "component_id"
    ]
  },
  assets: {
    "key": "assets",
    "module": "assets",
    "title": "Assets",
    "singular": "Asset",
    "table": "assets",
    "fields": [
      {
        "name": "asset_tag",
        "label": "Asset Tag",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "category",
        "label": "Category",
        "type": "text",
        "required": false
      },
      {
        "name": "serial_no",
        "label": "Serial No",
        "type": "text",
        "required": false
      },
      {
        "name": "purchase_date",
        "label": "Purchase Date",
        "type": "date",
        "required": false
      },
      {
        "name": "purchase_cost",
        "label": "Purchase Cost",
        "type": "number",
        "required": false
      },
      {
        "name": "useful_life_months",
        "label": "Useful Life Months",
        "type": "number",
        "required": false
      },
      {
        "name": "salvage_value",
        "label": "Salvage Value",
        "type": "number",
        "required": false,
        "hasDefault": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "available",
            "label": "Available"
          },
          {
            "value": "assigned",
            "label": "Assigned"
          },
          {
            "value": "maintenance",
            "label": "Maintenance"
          },
          {
            "value": "retired",
            "label": "Retired"
          },
          {
            "value": "lost",
            "label": "Lost"
          }
        ]
      },
      {
        "name": "assigned_employee_id",
        "label": "Assigned Employee Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "assigned_outlet_id",
        "label": "Assigned Outlet Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "outlets",
          "field": "id",
          "labelField": "name"
        }
      }
    ],
    "columns": [
      "asset_tag",
      "name",
      "category",
      "serial_no",
      "purchase_date",
      "purchase_cost"
    ],
    "searchColumns": [
      "asset_tag",
      "name",
      "category"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "assigned_employee_id",
      "table": "employees"
    }
  },
  asset_assignments: {
    "key": "asset_assignments",
    "module": "assets",
    "title": "Asset Assignments",
    "singular": "Asset Assignment",
    "table": "asset_assignments",
    "fields": [
      {
        "name": "asset_id",
        "label": "Asset Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "assets",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "outlet_id",
        "label": "Outlet Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "outlets",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "assigned_at",
        "label": "Assigned At",
        "type": "datetime",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "returned_at",
        "label": "Returned At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "condition_out",
        "label": "Condition Out",
        "type": "text",
        "required": false
      },
      {
        "name": "condition_in",
        "label": "Condition In",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "asset_id",
      "employee_id",
      "outlet_id",
      "assigned_at",
      "returned_at",
      "condition_out"
    ],
    "searchColumns": [
      "condition_out",
      "condition_in"
    ],
    "defaultOrder": "asset_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "asset_id",
      "table": "assets"
    }
  },
  asset_maintenance: {
    "key": "asset_maintenance",
    "module": "assets",
    "title": "Asset Maintenance",
    "singular": "Asset Maintenance",
    "table": "asset_maintenance",
    "fields": [
      {
        "name": "asset_id",
        "label": "Asset Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "assets",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "scheduled_on",
        "label": "Scheduled On",
        "type": "date",
        "required": false
      },
      {
        "name": "completed_on",
        "label": "Completed On",
        "type": "date",
        "required": false
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      },
      {
        "name": "cost",
        "label": "Cost",
        "type": "number",
        "required": false
      }
    ],
    "columns": [
      "asset_id",
      "scheduled_on",
      "completed_on",
      "description",
      "cost"
    ],
    "searchColumns": [
      "description"
    ],
    "defaultOrder": "asset_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "asset_id",
      "table": "assets"
    }
  },
  promos: {
    "key": "promos",
    "module": "promos",
    "title": "Promos",
    "singular": "Promo",
    "table": "promos",
    "fields": [
      {
        "name": "code",
        "label": "Code",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "valid_from",
        "label": "Valid From",
        "type": "datetime",
        "required": true,
        "notNull": true
      },
      {
        "name": "valid_to",
        "label": "Valid To",
        "type": "datetime",
        "required": true,
        "notNull": true
      },
      {
        "name": "budget",
        "label": "Budget",
        "type": "number",
        "required": false
      },
      {
        "name": "budget_used",
        "label": "Budget Used",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "readOnly": true
      },
      {
        "name": "is_stackable",
        "label": "Is Stackable",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "priority",
        "label": "Priority",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "code",
      "name",
      "valid_from",
      "valid_to",
      "budget",
      "budget_used"
    ],
    "searchColumns": [
      "code",
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  promo_rules: {
    "key": "promo_rules",
    "module": "promos",
    "title": "Promo Rules",
    "singular": "Promo Rule",
    "table": "promo_rules",
    "fields": [
      {
        "name": "promo_id",
        "label": "Promo Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "promos",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "rule_type",
        "label": "Rule Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "config",
        "label": "Config",
        "type": "json",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "promo_id",
      "rule_type",
      "config"
    ],
    "searchColumns": [
      "rule_type"
    ],
    "defaultOrder": "promo_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "promo_id",
      "table": "promos"
    }
  },
  promo_scopes: {
    "key": "promo_scopes",
    "module": "promos",
    "title": "Promo Scopes",
    "singular": "Promo Scope",
    "table": "promo_scopes",
    "fields": [
      {
        "name": "promo_id",
        "label": "Promo Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "promos",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "scope_type",
        "label": "Scope Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "scope_ref",
        "label": "Scope Ref",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "promo_id",
      "scope_type",
      "scope_ref",
      "primary"
    ],
    "searchColumns": [
      "scope_type",
      "scope_ref",
      "primary"
    ],
    "defaultOrder": "promo_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "promo_id",
      "table": "promos"
    },
    "child": true,
    "primaryKeys": [
      "promo_id",
      "scope_type",
      "scope_ref"
    ]
  },
  orders: {
    "key": "orders",
    "module": "orders",
    "title": "Orders",
    "singular": "Order",
    "table": "orders",
    "fields": [
      {
        "name": "order_no",
        "label": "Order No",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "account_id",
        "label": "Account Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "accounts",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "outlet_id",
        "label": "Outlet Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "outlets",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "opportunity_id",
        "label": "Opportunity Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "opportunities",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "visit_id",
        "label": "Visit Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "visits",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "salesperson_id",
        "label": "Salesperson Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "warehouse_id",
        "label": "Warehouse Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "warehouses",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "order_date",
        "label": "Order Date",
        "type": "date",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "delivery_date",
        "label": "Delivery Date",
        "type": "date",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "text",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "subtotal",
        "label": "Subtotal",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "readOnly": true
      },
      {
        "name": "discount_total",
        "label": "Discount Total",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "readOnly": true
      },
      {
        "name": "tax_total",
        "label": "Tax Total",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "readOnly": true
      },
      {
        "name": "grand_total",
        "label": "Grand Total",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "readOnly": true
      },
      {
        "name": "currency_code",
        "label": "Currency Code",
        "type": "text",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "notes",
        "label": "Notes",
        "type": "textarea",
        "required": false
      },
      {
        "name": "client_uuid",
        "label": "Client Uuid",
        "type": "text",
        "required": false
      },
      {
        "name": "synced_at",
        "label": "Synced At",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "order_no",
      "account_id",
      "outlet_id",
      "opportunity_id",
      "visit_id",
      "salesperson_id"
    ],
    "searchColumns": [
      "order_no",
      "status",
      "currency_code"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "account_id",
      "table": "accounts"
    }
  },
  order_items: {
    "key": "order_items",
    "module": "orders",
    "title": "Order Items",
    "singular": "Order Item",
    "table": "order_items",
    "fields": [
      {
        "name": "order_id",
        "label": "Order Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "orders",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "uom_id",
        "label": "Uom Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "uoms",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "quantity",
        "label": "Quantity",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "unit_price",
        "label": "Unit Price",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "discount_amount",
        "label": "Discount Amount",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "tax_amount",
        "label": "Tax Amount",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "line_total",
        "label": "Line Total",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "promo_id",
        "label": "Promo Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "promos",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "is_free_item",
        "label": "Is Free Item",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "fulfilled_qty",
        "label": "Fulfilled Qty",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "order_id",
      "product_id",
      "uom_id",
      "quantity",
      "unit_price",
      "discount_amount"
    ],
    "searchColumns": [],
    "defaultOrder": "order_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "order_id",
      "table": "orders"
    }
  },
  promo_redemptions: {
    "key": "promo_redemptions",
    "module": "promos",
    "title": "Promo Redemptions",
    "singular": "Promo Redemption",
    "table": "promo_redemptions",
    "fields": [
      {
        "name": "promo_id",
        "label": "Promo Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "promos",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "order_id",
        "label": "Order Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "orders",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "account_id",
        "label": "Account Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "accounts",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "discount_value",
        "label": "Discount Value",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "redeemed_at",
        "label": "Redeemed At",
        "type": "datetime",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "promo_id",
      "order_id",
      "account_id",
      "discount_value",
      "redeemed_at"
    ],
    "searchColumns": [],
    "defaultOrder": "promo_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "promo_id",
      "table": "promos"
    }
  },
  sales_transactions: {
    "key": "sales_transactions",
    "module": "sales",
    "title": "Sales Transactions",
    "singular": "Sales Transaction",
    "table": "sales_transactions",
    "fields": [
      {
        "name": "txn_no",
        "label": "Txn No",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "order_id",
        "label": "Order Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "orders",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "account_id",
        "label": "Account Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "accounts",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "outlet_id",
        "label": "Outlet Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "outlets",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "salesperson_id",
        "label": "Salesperson Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "txn_date",
        "label": "Txn Date",
        "type": "datetime",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "total_amount",
        "label": "Total Amount",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "payment_method",
        "label": "Payment Method",
        "type": "text",
        "required": false
      },
      {
        "name": "client_uuid",
        "label": "Client Uuid",
        "type": "text",
        "required": false
      },
      {
        "name": "synced_at",
        "label": "Synced At",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "txn_no",
      "order_id",
      "account_id",
      "outlet_id",
      "salesperson_id",
      "txn_date"
    ],
    "searchColumns": [
      "txn_no",
      "payment_method",
      "client_uuid"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "order_id",
      "table": "orders"
    }
  },
  sales_transaction_items: {
    "key": "sales_transaction_items",
    "module": "sales",
    "title": "Sales Transaction Items",
    "singular": "Sales Transaction Item",
    "table": "sales_transaction_items",
    "fields": [
      {
        "name": "txn_id",
        "label": "Txn Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "sales_transactions",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "quantity",
        "label": "Quantity",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "unit_price",
        "label": "Unit Price",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "line_total",
        "label": "Line Total",
        "type": "number",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "txn_id",
      "product_id",
      "quantity",
      "unit_price",
      "line_total"
    ],
    "searchColumns": [],
    "defaultOrder": "txn_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "txn_id",
      "table": "sales_transactions"
    }
  },
  sales_targets: {
    "key": "sales_targets",
    "module": "sales",
    "title": "Sales Targets",
    "singular": "Sales Target",
    "table": "sales_targets",
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "territory_id",
        "label": "Territory Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "territories",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "period_start",
        "label": "Period Start",
        "type": "date",
        "required": true,
        "notNull": true
      },
      {
        "name": "period_end",
        "label": "Period End",
        "type": "date",
        "required": true,
        "notNull": true
      },
      {
        "name": "metric",
        "label": "Metric",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "revenue",
            "label": "Revenue"
          },
          {
            "value": "quantity",
            "label": "Quantity"
          },
          {
            "value": "visits",
            "label": "Visits"
          },
          {
            "value": "new_accounts",
            "label": "New Accounts"
          }
        ]
      },
      {
        "name": "target_value",
        "label": "Target Value",
        "type": "number",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "employee_id",
      "territory_id",
      "product_id",
      "period_start",
      "period_end",
      "metric"
    ],
    "searchColumns": [],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    }
  },
  expense_categories: {
    "key": "expense_categories",
    "module": "expenses",
    "title": "Expense Categories",
    "singular": "Expense Categorie",
    "table": "expense_categories",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "max_amount",
        "label": "Max Amount",
        "type": "number",
        "required": false
      },
      {
        "name": "requires_receipt",
        "label": "Requires Receipt",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "name",
      "max_amount",
      "requires_receipt"
    ],
    "searchColumns": [
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  expense_reports: {
    "key": "expense_reports",
    "module": "expenses",
    "title": "Expense Reports",
    "singular": "Expense Report",
    "table": "expense_reports",
    "fields": [
      {
        "name": "report_no",
        "label": "Report No",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "title",
        "label": "Title",
        "type": "text",
        "required": false
      },
      {
        "name": "total_amount",
        "label": "Total Amount",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "draft",
            "label": "Draft"
          },
          {
            "value": "submitted",
            "label": "Submitted"
          },
          {
            "value": "approved",
            "label": "Approved"
          },
          {
            "value": "rejected",
            "label": "Rejected"
          },
          {
            "value": "reimbursed",
            "label": "Reimbursed"
          }
        ]
      },
      {
        "name": "submitted_at",
        "label": "Submitted At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "reimbursed_at",
        "label": "Reimbursed At",
        "type": "datetime",
        "required": false
      }
    ],
    "columns": [
      "report_no",
      "employee_id",
      "title",
      "total_amount",
      "status",
      "submitted_at"
    ],
    "searchColumns": [
      "report_no",
      "title"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    }
  },
  expenses: {
    "key": "expenses",
    "module": "expenses",
    "title": "Expenses",
    "singular": "Expense",
    "table": "expenses",
    "fields": [
      {
        "name": "report_id",
        "label": "Report Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "expense_reports",
          "field": "id",
          "labelField": "title"
        }
      },
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "category_id",
        "label": "Category Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "expense_categories",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "expense_date",
        "label": "Expense Date",
        "type": "date",
        "required": true,
        "notNull": true
      },
      {
        "name": "amount",
        "label": "Amount",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "currency_code",
        "label": "Currency Code",
        "type": "text",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      },
      {
        "name": "receipt_url",
        "label": "Receipt Url",
        "type": "text",
        "required": false
      },
      {
        "name": "visit_id",
        "label": "Visit Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "visits",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "distance_km",
        "label": "Distance Km",
        "type": "number",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "draft",
            "label": "Draft"
          },
          {
            "value": "submitted",
            "label": "Submitted"
          },
          {
            "value": "approved",
            "label": "Approved"
          },
          {
            "value": "rejected",
            "label": "Rejected"
          }
        ]
      },
      {
        "name": "client_uuid",
        "label": "Client Uuid",
        "type": "text",
        "required": false
      },
      {
        "name": "synced_at",
        "label": "Synced At",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "report_id",
      "employee_id",
      "category_id",
      "expense_date",
      "amount",
      "currency_code"
    ],
    "searchColumns": [
      "currency_code",
      "description",
      "receipt_url"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "report_id",
      "table": "expense_reports"
    }
  },
  invoices: {
    "key": "invoices",
    "module": "billing",
    "title": "Invoices",
    "singular": "Invoice",
    "table": "invoices",
    "fields": [
      {
        "name": "invoice_no",
        "label": "Invoice No",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "account_id",
        "label": "Account Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "accounts",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "order_id",
        "label": "Order Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "orders",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "invoice_date",
        "label": "Invoice Date",
        "type": "date",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "due_date",
        "label": "Due Date",
        "type": "date",
        "required": true,
        "notNull": true
      },
      {
        "name": "subtotal",
        "label": "Subtotal",
        "type": "number",
        "required": true,
        "notNull": true,
        "readOnly": true
      },
      {
        "name": "tax_total",
        "label": "Tax Total",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "readOnly": true
      },
      {
        "name": "total",
        "label": "Total",
        "type": "number",
        "required": true,
        "notNull": true,
        "readOnly": true
      },
      {
        "name": "amount_paid",
        "label": "Amount Paid",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "readOnly": true
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "draft",
            "label": "Draft"
          },
          {
            "value": "open",
            "label": "Open"
          },
          {
            "value": "partially_paid",
            "label": "Partially Paid"
          },
          {
            "value": "paid",
            "label": "Paid"
          },
          {
            "value": "overdue",
            "label": "Overdue"
          },
          {
            "value": "void",
            "label": "Void"
          }
        ]
      }
    ],
    "columns": [
      "invoice_no",
      "account_id",
      "order_id",
      "invoice_date",
      "due_date",
      "subtotal"
    ],
    "searchColumns": [
      "invoice_no"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "account_id",
      "table": "accounts"
    }
  },
  invoice_items: {
    "key": "invoice_items",
    "module": "billing",
    "title": "Invoice Items",
    "singular": "Invoice Item",
    "table": "invoice_items",
    "fields": [
      {
        "name": "invoice_id",
        "label": "Invoice Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "invoices",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      },
      {
        "name": "quantity",
        "label": "Quantity",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "unit_price",
        "label": "Unit Price",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "line_total",
        "label": "Line Total",
        "type": "number",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "invoice_id",
      "product_id",
      "description",
      "quantity",
      "unit_price",
      "line_total"
    ],
    "searchColumns": [
      "description"
    ],
    "defaultOrder": "invoice_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "invoice_id",
      "table": "invoices"
    }
  },
  payments: {
    "key": "payments",
    "module": "billing",
    "title": "Payments",
    "singular": "Payment",
    "table": "payments",
    "fields": [
      {
        "name": "payment_no",
        "label": "Payment No",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "account_id",
        "label": "Account Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "accounts",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "collected_by",
        "label": "Collected By",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "visit_id",
        "label": "Visit Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "visits",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "amount",
        "label": "Amount",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "reference_no",
        "label": "Reference No",
        "type": "text",
        "required": false
      },
      {
        "name": "check_date",
        "label": "Check Date",
        "type": "date",
        "required": false
      },
      {
        "name": "received_at",
        "label": "Received At",
        "type": "datetime",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "proof_url",
        "label": "Proof Url",
        "type": "text",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "received",
            "label": "Received"
          },
          {
            "value": "deposited",
            "label": "Deposited"
          },
          {
            "value": "cleared",
            "label": "Cleared"
          },
          {
            "value": "bounced",
            "label": "Bounced"
          },
          {
            "value": "void",
            "label": "Void"
          }
        ]
      },
      {
        "name": "remittance_id",
        "label": "Remittance Id",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "payment_no",
      "account_id",
      "collected_by",
      "visit_id",
      "amount",
      "reference_no"
    ],
    "searchColumns": [
      "payment_no",
      "reference_no",
      "proof_url"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "account_id",
      "table": "accounts"
    }
  },
  payment_allocations: {
    "key": "payment_allocations",
    "module": "billing",
    "title": "Payment Allocations",
    "singular": "Payment Allocation",
    "table": "payment_allocations",
    "fields": [
      {
        "name": "payment_id",
        "label": "Payment Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "payments",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "invoice_id",
        "label": "Invoice Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "invoices",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "amount",
        "label": "Amount",
        "type": "number",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "payment_id",
      "invoice_id",
      "amount"
    ],
    "searchColumns": [],
    "defaultOrder": "payment_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "payment_id",
      "table": "payments"
    }
  },
  remittances: {
    "key": "remittances",
    "module": "billing",
    "title": "Remittances",
    "singular": "Remittance",
    "table": "remittances",
    "fields": [
      {
        "name": "employee_id",
        "label": "Employee Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "total_amount",
        "label": "Total Amount",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "bank_reference",
        "label": "Bank Reference",
        "type": "text",
        "required": false
      },
      {
        "name": "deposited_at",
        "label": "Deposited At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "verified_by",
        "label": "Verified By",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "pending",
            "label": "Pending"
          },
          {
            "value": "deposited",
            "label": "Deposited"
          },
          {
            "value": "verified",
            "label": "Verified"
          },
          {
            "value": "discrepancy",
            "label": "Discrepancy"
          }
        ]
      }
    ],
    "columns": [
      "employee_id",
      "total_amount",
      "bank_reference",
      "deposited_at",
      "verified_by",
      "status"
    ],
    "searchColumns": [
      "bank_reference"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "employee_id",
      "table": "employees"
    }
  },
  forms: {
    "key": "forms",
    "module": "forms",
    "title": "Forms",
    "singular": "Form",
    "table": "forms",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "form_type",
        "label": "Form Type",
        "type": "text",
        "required": false
      },
      {
        "name": "version",
        "label": "Version",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "schema",
        "label": "Schema",
        "type": "json",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "name",
      "form_type",
      "version",
      "schema"
    ],
    "searchColumns": [
      "name",
      "form_type"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
  form_fields: {
    "key": "form_fields",
    "module": "forms",
    "title": "Form Fields",
    "singular": "Form Field",
    "table": "form_fields",
    "fields": [
      {
        "name": "form_id",
        "label": "Form Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "forms",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "key",
        "label": "Key",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "label",
        "label": "Label",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "field_type",
        "label": "Field Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "is_required",
        "label": "Is Required",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "options",
        "label": "Options",
        "type": "json",
        "required": false
      },
      {
        "name": "logic",
        "label": "Logic",
        "type": "json",
        "required": false
      },
      {
        "name": "sort_order",
        "label": "Sort Order",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "form_id",
      "key",
      "label",
      "field_type",
      "is_required",
      "options"
    ],
    "searchColumns": [
      "key",
      "label",
      "field_type"
    ],
    "defaultOrder": "form_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "form_id",
      "table": "forms"
    }
  },
  form_submissions: {
    "key": "form_submissions",
    "module": "forms",
    "title": "Form Submissions",
    "singular": "Form Submission",
    "table": "form_submissions",
    "fields": [
      {
        "name": "form_id",
        "label": "Form Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "forms",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "form_version",
        "label": "Form Version",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "submitted_by",
        "label": "Submitted By",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "visit_id",
        "label": "Visit Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "visits",
          "field": "id",
          "labelField": "id"
        }
      },
      {
        "name": "outlet_id",
        "label": "Outlet Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "outlets",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "ticket_id",
        "label": "Ticket Id",
        "type": "text",
        "required": false
      },
      {
        "name": "answers",
        "label": "Answers",
        "type": "json",
        "required": true,
        "notNull": true
      },
      {
        "name": "location",
        "label": "Location",
        "type": "text",
        "required": false
      },
      {
        "name": "submitted_at",
        "label": "Submitted At",
        "type": "datetime",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "synced_at",
        "label": "Synced At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "client_uuid",
        "label": "Client Uuid",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "form_id",
      "form_version",
      "submitted_by",
      "visit_id",
      "outlet_id",
      "ticket_id"
    ],
    "searchColumns": [
      "ticket_id",
      "location",
      "client_uuid"
    ],
    "defaultOrder": "form_id",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "form_id",
      "table": "forms"
    }
  },
  service_tickets: {
    "key": "service_tickets",
    "module": "tickets",
    "title": "Service Tickets",
    "singular": "Service Ticket",
    "table": "service_tickets",
    "fields": [
      {
        "name": "ticket_no",
        "label": "Ticket No",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "title",
        "label": "Title",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      },
      {
        "name": "category",
        "label": "Category",
        "type": "text",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "open",
            "label": "Open"
          },
          {
            "value": "assigned",
            "label": "Assigned"
          },
          {
            "value": "in_progress",
            "label": "In Progress"
          },
          {
            "value": "on_hold",
            "label": "On Hold"
          },
          {
            "value": "resolved",
            "label": "Resolved"
          },
          {
            "value": "closed",
            "label": "Closed"
          }
        ]
      },
      {
        "name": "account_id",
        "label": "Account Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "accounts",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "outlet_id",
        "label": "Outlet Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "outlets",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "asset_id",
        "label": "Asset Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "assets",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "product_id",
        "label": "Product Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "products",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "reported_by",
        "label": "Reported By",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "assigned_to",
        "label": "Assigned To",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "employees",
          "field": "id",
          "labelField": "email"
        }
      },
      {
        "name": "sla_due_at",
        "label": "Sla Due At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "resolved_at",
        "label": "Resolved At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "resolution",
        "label": "Resolution",
        "type": "textarea",
        "required": false
      },
      {
        "name": "client_uuid",
        "label": "Client Uuid",
        "type": "text",
        "required": false
      },
      {
        "name": "synced_at",
        "label": "Synced At",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "ticket_no",
      "title",
      "description",
      "category",
      "status",
      "account_id"
    ],
    "searchColumns": [
      "ticket_no",
      "title",
      "description"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "account_id",
      "table": "accounts"
    }
  },
  ticket_comments: {
    "key": "ticket_comments",
    "module": "tickets",
    "title": "Ticket Comments",
    "singular": "Ticket Comment",
    "table": "ticket_comments",
    "fields": [
      {
        "name": "ticket_id",
        "label": "Ticket Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "service_tickets",
          "field": "id",
          "labelField": "title"
        }
      },
      {
        "name": "author_id",
        "label": "Author Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "body",
        "label": "Body",
        "type": "textarea",
        "required": true,
        "notNull": true
      },
      {
        "name": "is_internal",
        "label": "Is Internal",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "ticket_id",
      "author_id",
      "body",
      "is_internal"
    ],
    "searchColumns": [
      "body"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "ticket_id",
      "table": "service_tickets"
    }
  },
  data_jobs: {
    "key": "data_jobs",
    "module": "data_jobs",
    "title": "Data Jobs",
    "singular": "Data Job",
    "table": "data_jobs",
    "fields": [
      {
        "name": "module",
        "label": "Module",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "file_url",
        "label": "File Url",
        "type": "text",
        "required": false
      },
      {
        "name": "mapping",
        "label": "Mapping",
        "type": "json",
        "required": false
      },
      {
        "name": "status",
        "label": "Status",
        "type": "select",
        "required": false,
        "notNull": true,
        "hasDefault": true,
        "options": [
          {
            "value": "queued",
            "label": "Queued"
          },
          {
            "value": "validating",
            "label": "Validating"
          },
          {
            "value": "running",
            "label": "Running"
          },
          {
            "value": "completed",
            "label": "Completed"
          },
          {
            "value": "failed",
            "label": "Failed"
          }
        ]
      },
      {
        "name": "total_rows",
        "label": "Total Rows",
        "type": "number",
        "required": false
      },
      {
        "name": "success_rows",
        "label": "Success Rows",
        "type": "number",
        "required": false
      },
      {
        "name": "error_rows",
        "label": "Error Rows",
        "type": "number",
        "required": false
      },
      {
        "name": "error_report_url",
        "label": "Error Report Url",
        "type": "text",
        "required": false
      },
      {
        "name": "created_by",
        "label": "Created By",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "finished_at",
        "label": "Finished At",
        "type": "datetime",
        "required": false
      }
    ],
    "columns": [
      "module",
      "file_url",
      "mapping",
      "status",
      "total_rows",
      "success_rows"
    ],
    "searchColumns": [
      "module",
      "file_url",
      "error_report_url"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "created_by",
      "table": "users"
    }
  },
  report_definitions: {
    "key": "report_definitions",
    "module": "reports",
    "title": "Report Definitions",
    "singular": "Report Definition",
    "table": "report_definitions",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "required": false
      },
      {
        "name": "data_source",
        "label": "Data Source",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "config",
        "label": "Config",
        "type": "json",
        "required": true,
        "notNull": true
      },
      {
        "name": "is_system",
        "label": "Is System",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "owner_id",
        "label": "Owner Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      }
    ],
    "columns": [
      "name",
      "description",
      "data_source",
      "config",
      "is_system",
      "owner_id"
    ],
    "searchColumns": [
      "name",
      "description",
      "data_source"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "owner_id",
      "table": "users"
    }
  },
  report_schedules: {
    "key": "report_schedules",
    "module": "reports",
    "title": "Report Schedules",
    "singular": "Report Schedule",
    "table": "report_schedules",
    "fields": [
      {
        "name": "report_id",
        "label": "Report Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "report_definitions",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "cron",
        "label": "Cron",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "recipients",
        "label": "Recipients",
        "type": "json",
        "required": true,
        "notNull": true
      },
      {
        "name": "last_run_at",
        "label": "Last Run At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "is_active",
        "label": "Is Active",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "report_id",
      "cron",
      "recipients",
      "last_run_at",
      "is_active"
    ],
    "searchColumns": [
      "cron"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "report_id",
      "table": "report_definitions"
    }
  },
  report_runs: {
    "key": "report_runs",
    "module": "reports",
    "title": "Report Runs",
    "singular": "Report Run",
    "table": "report_runs",
    "fields": [
      {
        "name": "report_id",
        "label": "Report Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "report_definitions",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "run_by",
        "label": "Run By",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "params",
        "label": "Params",
        "type": "json",
        "required": false
      },
      {
        "name": "file_url",
        "label": "File Url",
        "type": "text",
        "required": false
      },
      {
        "name": "row_count",
        "label": "Row Count",
        "type": "number",
        "required": false
      }
    ],
    "columns": [
      "report_id",
      "run_by",
      "params",
      "file_url",
      "row_count"
    ],
    "searchColumns": [
      "file_url"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "report_id",
      "table": "report_definitions"
    }
  },
  dashboard_layouts: {
    "key": "dashboard_layouts",
    "module": "dashboard",
    "title": "Dashboard Layouts",
    "singular": "Dashboard Layout",
    "table": "dashboard_layouts",
    "fields": [
      {
        "name": "role_id",
        "label": "Role Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "roles",
          "field": "id",
          "labelField": "name"
        }
      },
      {
        "name": "user_id",
        "label": "User Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "widgets",
        "label": "Widgets",
        "type": "json",
        "required": true,
        "notNull": true
      }
    ],
    "columns": [
      "role_id",
      "user_id",
      "widgets"
    ],
    "searchColumns": [],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "role_id",
      "table": "roles"
    }
  },
  announcements: {
    "key": "announcements",
    "module": "announcements",
    "title": "Announcements",
    "singular": "Announcement",
    "table": "announcements",
    "fields": [
      {
        "name": "title",
        "label": "Title",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "body",
        "label": "Body",
        "type": "textarea",
        "required": true,
        "notNull": true
      },
      {
        "name": "attachments",
        "label": "Attachments",
        "type": "json",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "audience",
        "label": "Audience",
        "type": "json",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "is_pinned",
        "label": "Is Pinned",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "requires_ack",
        "label": "Requires Ack",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "publish_at",
        "label": "Publish At",
        "type": "datetime",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "expires_at",
        "label": "Expires At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "created_by",
        "label": "Created By",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      }
    ],
    "columns": [
      "title",
      "body",
      "attachments",
      "audience",
      "is_pinned",
      "requires_ack"
    ],
    "searchColumns": [
      "title",
      "body"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "created_by",
      "table": "users"
    }
  },
  announcement_reads: {
    "key": "announcement_reads",
    "module": "announcements",
    "title": "Announcement Reads",
    "singular": "Announcement Read",
    "table": "announcement_reads",
    "fields": [
      {
        "name": "announcement_id",
        "label": "Announcement Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "announcements",
          "field": "id",
          "labelField": "title"
        }
      },
      {
        "name": "user_id",
        "label": "User Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "read_at",
        "label": "Read At",
        "type": "datetime",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "acknowledged_at",
        "label": "Acknowledged At",
        "type": "datetime",
        "required": false
      },
      {
        "name": "primary",
        "label": "Primary",
        "type": "text",
        "required": false
      }
    ],
    "columns": [
      "announcement_id",
      "user_id",
      "read_at",
      "acknowledged_at",
      "primary"
    ],
    "searchColumns": [
      "primary"
    ],
    "defaultOrder": "announcement_id",
    "readOnly": false,
    "tenantScoped": false,
    "parent": {
      "field": "announcement_id",
      "table": "announcements"
    },
    "child": true,
    "primaryKeys": [
      "announcement_id",
      "user_id"
    ]
  },
  activity_feed: {
    "key": "activity_feed",
    "module": "activity",
    "title": "Activity Feed",
    "singular": "Activity Feed",
    "table": "activity_feed",
    "fields": [
      {
        "name": "actor_id",
        "label": "Actor Id",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "verb",
        "label": "Verb",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "entity_type",
        "label": "Entity Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "entity_id",
        "label": "Entity Id",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "summary",
        "label": "Summary",
        "type": "textarea",
        "required": true,
        "notNull": true
      },
      {
        "name": "audience",
        "label": "Audience",
        "type": "json",
        "required": false
      }
    ],
    "columns": [
      "actor_id",
      "verb",
      "entity_type",
      "entity_id",
      "summary",
      "audience"
    ],
    "searchColumns": [
      "verb",
      "entity_type",
      "entity_id"
    ],
    "defaultOrder": "created_at",
    "readOnly": true,
    "tenantScoped": true,
    "parent": {
      "field": "actor_id",
      "table": "users"
    }
  },
  comments: {
    "key": "comments",
    "module": "activity",
    "title": "Comments",
    "singular": "Comment",
    "table": "comments",
    "fields": [
      {
        "name": "entity_type",
        "label": "Entity Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "entity_id",
        "label": "Entity Id",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "author_id",
        "label": "Author Id",
        "type": "relation",
        "required": true,
        "notNull": true,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      },
      {
        "name": "body",
        "label": "Body",
        "type": "textarea",
        "required": true,
        "notNull": true
      },
      {
        "name": "mentions",
        "label": "Mentions",
        "type": "json",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "entity_type",
      "entity_id",
      "author_id",
      "body",
      "mentions"
    ],
    "searchColumns": [
      "entity_type",
      "entity_id",
      "body"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "author_id",
      "table": "users"
    }
  },
  attachments: {
    "key": "attachments",
    "module": "attachments",
    "title": "Attachments",
    "singular": "Attachment",
    "table": "attachments",
    "fields": [
      {
        "name": "entity_type",
        "label": "Entity Type",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "entity_id",
        "label": "Entity Id",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "file_name",
        "label": "File Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "mime_type",
        "label": "Mime Type",
        "type": "text",
        "required": false
      },
      {
        "name": "size_bytes",
        "label": "Size Bytes",
        "type": "number",
        "required": false
      },
      {
        "name": "storage_url",
        "label": "Storage Url",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "uploaded_by",
        "label": "Uploaded By",
        "type": "relation",
        "required": false,
        "relation": {
          "table": "users",
          "field": "id",
          "labelField": "full_name"
        }
      }
    ],
    "columns": [
      "entity_type",
      "entity_id",
      "file_name",
      "mime_type",
      "size_bytes",
      "storage_url"
    ],
    "searchColumns": [
      "entity_type",
      "entity_id",
      "file_name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true,
    "parent": {
      "field": "uploaded_by",
      "table": "users"
    }
  },
  opportunity_stages: {
    "key": "opportunity_stages",
    "module": "opportunities",
    "title": "Opportunity Stages",
    "singular": "Opportunity Stage",
    "table": "opportunity_stages",
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true,
        "notNull": true
      },
      {
        "name": "sort_order",
        "label": "Sort Order",
        "type": "number",
        "required": true,
        "notNull": true
      },
      {
        "name": "probability",
        "label": "Probability",
        "type": "number",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "is_won",
        "label": "Is Won",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      },
      {
        "name": "is_lost",
        "label": "Is Lost",
        "type": "checkbox",
        "required": false,
        "notNull": true,
        "hasDefault": true
      }
    ],
    "columns": [
      "name",
      "sort_order",
      "probability",
      "is_won",
      "is_lost"
    ],
    "searchColumns": [
      "name"
    ],
    "defaultOrder": "created_at",
    "readOnly": false,
    "tenantScoped": true
  },
}

export const moduleEntities: Record<string, string[]> = {
  "administration": [
    "organizations",
    "users",
    "roles",
    "permissions",
    "role_permissions",
    "user_roles",
    "audit_logs",
    "approval_workflows",
    "notifications"
  ],
  "approvals": [
    "approvals"
  ],
  "master_data": [
    "master_data_types",
    "master_data_items",
    "territories",
    "uoms",
    "tax_rates"
  ],
  "employees": [
    "departments",
    "positions",
    "employees",
    "employee_documents"
  ],
  "attendance": [
    "shifts",
    "employee_shifts",
    "attendances"
  ],
  "leaves": [
    "leave_types",
    "leave_balances",
    "leaves",
    "holidays"
  ],
  "accounts": [
    "accounts",
    "contacts"
  ],
  "leads": [
    "leads"
  ],
  "opportunities": [
    "opportunities",
    "opportunity_stages"
  ],
  "activities": [
    "activities"
  ],
  "outlets": [
    "outlets"
  ],
  "visits": [
    "routes",
    "route_stops",
    "visits",
    "visit_photos"
  ],
  "tracking": [
    "location_pings",
    "geofences"
  ],
  "products": [
    "product_categories",
    "products",
    "product_uom_conversions",
    "price_lists",
    "price_list_items",
    "batches"
  ],
  "inventory": [
    "warehouses",
    "stock_levels",
    "stock_movements",
    "stock_counts",
    "stock_count_lines"
  ],
  "production": [
    "boms",
    "bom_items",
    "production_orders",
    "production_consumption"
  ],
  "assets": [
    "assets",
    "asset_assignments",
    "asset_maintenance"
  ],
  "promos": [
    "promos",
    "promo_rules",
    "promo_scopes",
    "promo_redemptions"
  ],
  "orders": [
    "orders",
    "order_items"
  ],
  "sales": [
    "sales_transactions",
    "sales_transaction_items",
    "sales_targets"
  ],
  "expenses": [
    "expense_categories",
    "expense_reports",
    "expenses"
  ],
  "billing": [
    "invoices",
    "invoice_items",
    "payments",
    "payment_allocations",
    "remittances"
  ],
  "forms": [
    "forms",
    "form_fields",
    "form_submissions"
  ],
  "tickets": [
    "service_tickets",
    "ticket_comments"
  ],
  "data_jobs": [
    "data_jobs"
  ],
  "reports": [
    "report_definitions",
    "report_schedules",
    "report_runs"
  ],
  "dashboard": [
    "dashboard_layouts"
  ],
  "announcements": [
    "announcements",
    "announcement_reads"
  ],
  "activity": [
    "activity_feed",
    "comments"
  ],
  "attachments": [
    "attachments"
  ]
}
