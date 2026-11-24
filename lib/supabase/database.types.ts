/**
 * TEMPORARY hand-written types for the tables used by the Phase 0 shell.
 *
 * Replace this file with the generated schema once the project is linked and
 * migrations are applied:
 *
 *   npm run db:types
 *
 * The generated file will include every table, view, function and enum.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OrganizationRow = {
  id: string
  name: string
  code: string
  timezone: string
  currency_code: string
  settings: Json
  created_at: string
  updated_at: string
}

export type UserRow = {
  id: string
  org_id: string | null
  email: string
  full_name: string
  avatar_url: string | null
  phone: string | null
  status: "active" | "suspended" | "invited"
  is_super_admin: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export type EmployeeRow = {
  id: string
  org_id: string
  user_id: string | null
  employee_no: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  department_id: string | null
  position_id: string | null
  manager_id: string | null
  territory_id: string | null
  hire_date: string | null
  status: "active" | "on_leave" | "resigned" | "terminated"
  device_id: string | null
  is_field_staff: boolean
  created_at: string
  updated_at: string
}

export type OutletRow = {
  id: string
  org_id: string
  account_id: string | null
  outlet_code: string
  name: string
  outlet_type: string | null
  tier: string | null
  address: string | null
  territory_id: string | null
  location: unknown | null
  geofence_radius_m: number
  visit_frequency: string | null
  status: "prospect" | "active" | "inactive" | "closed"
  photos: Json
  created_at: string
  updated_at: string
}

export type VisitRow = {
  id: string
  org_id: string
  employee_id: string
  outlet_id: string
  route_id: string | null
  planned_date: string | null
  status: "planned" | "in_progress" | "completed" | "skipped" | "missed"
  check_in_at: string | null
  check_out_at: string | null
  check_in_loc: unknown | null
  check_out_loc: unknown | null
  distance_from_outlet_m: number | null
  skip_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type OrderRow = {
  id: string
  org_id: string
  order_no: string
  account_id: string
  outlet_id: string | null
  opportunity_id: string | null
  visit_id: string | null
  salesperson_id: string | null
  warehouse_id: string | null
  order_date: string
  delivery_date: string | null
  status:
    | "draft"
    | "submitted"
    | "approved"
    | "partially_fulfilled"
    | "fulfilled"
    | "invoiced"
    | "closed"
    | "cancelled"
  subtotal: number
  discount_total: number
  tax_total: number
  grand_total: number
  currency_code: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type InvoiceRow = {
  id: string
  org_id: string
  invoice_no: string
  account_id: string
  order_id: string | null
  invoice_date: string
  due_date: string
  subtotal: number
  tax_total: number
  total: number
  amount_paid: number
  status: "draft" | "open" | "partially_paid" | "paid" | "overdue" | "void"
  created_at: string
  updated_at: string
}

export type ApprovalRow = {
  id: string
  org_id: string
  workflow_id: string | null
  entity_type: string
  entity_id: string
  level: number
  approver_id: string | null
  status: "pending" | "approved" | "rejected" | "skipped"
  remarks: string | null
  acted_at: string | null
  created_at: string
}

export type ServiceTicketRow = {
  id: string
  org_id: string
  ticket_no: string
  title: string
  description: string | null
  category: string | null
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "assigned" | "in_progress" | "on_hold" | "resolved" | "closed"
  account_id: string | null
  outlet_id: string | null
  asset_id: string | null
  product_id: string | null
  reported_by: string | null
  assigned_to: string | null
  sla_due_at: string | null
  resolved_at: string | null
  resolution: string | null
  created_at: string
  updated_at: string
}

export type ActivityFeedRow = {
  id: number
  org_id: string
  actor_id: string | null
  verb: string
  entity_type: string
  entity_id: string
  summary: string
  audience: Json | null
  created_at: string
}

export type AnnouncementRow = {
  id: string
  org_id: string
  title: string
  body: string
  attachments: Json
  audience: Json
  is_pinned: boolean
  requires_ack: boolean
  publish_at: string
  expires_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type AttendanceRow = {
  id: string
  org_id: string
  employee_id: string
  work_date: string
  clock_in_at: string | null
  clock_out_at: string | null
  status: "present" | "late" | "absent" | "half_day" | "on_leave" | "holiday"
  late_minutes: number
  overtime_minutes: number
  is_within_geofence: boolean | null
  remarks: string | null
  created_at: string
}

export type ReceivablesAgingRow = {
  org_id: string
  account_id: string
  account_name: string
  invoice_id: string
  invoice_no: string
  invoice_date: string
  due_date: string
  total: number
  amount_paid: number
  balance: number
  days_overdue: number
  aging_bucket: string
}

type Table<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      users: Table<UserRow>
      organizations: Table<OrganizationRow>
      employees: Table<EmployeeRow>
      outlets: Table<OutletRow>
      visits: Table<VisitRow>
      orders: Table<OrderRow>
      invoices: Table<InvoiceRow>
      approvals: Table<ApprovalRow>
      service_tickets: Table<ServiceTicketRow>
      activity_feed: Table<ActivityFeedRow>
      announcements: Table<AnnouncementRow>
      attendances: Table<AttendanceRow>
    }
    Views: {
      rpt_receivables_aging: {
        Row: ReceivablesAgingRow
        Relationships: []
      }
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
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
