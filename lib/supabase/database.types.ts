/**
 * Generated from supabase/migrations by scripts/generate-db-types.mjs.
 * Run `npm run db:types` against the linked project for authoritative types.
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
    organizations: Table<{
      id: string
      name: string
      code: string
      timezone: string
      currency_code: string
      settings: Json
      created_at: string
      updated_at: string
    }>
    users: Table<{
      id: string
      org_id: string | null
      email: string
      full_name: string
      avatar_url: string | null
      phone: string | null
      status: string
      is_super_admin: boolean
      last_login_at: string | null
      created_at: string
      updated_at: string
    }>
    roles: Table<{
      id: string
      org_id: string
      name: string
      description: string | null
      created_at: string
      updated_at: string
    }>
    permissions: Table<{
      id: string
      module: string
      action: string
    }>
    role_permissions: Table<{
      role_id: string
      permission_id: string
      data_scope: string
    }>
    user_roles: Table<{
      user_id: string
      role_id: string
    }>
    audit_logs: Table<{
      id: number
      org_id: string
      user_id: string | null
      module: string
      entity_type: string
      entity_id: string | null
      action: string
      changes: Json | null
      ip_address: string | null
      created_at: string
    }>
    approval_workflows: Table<{
      id: string
      org_id: string
      module: string
      name: string
      steps: Json
      is_active: boolean
      created_at: string
    }>
    approvals: Table<{
      id: string
      org_id: string
      workflow_id: string | null
      entity_type: string
      entity_id: string
      level: number
      approver_id: string | null
      status: string
      remarks: string | null
      acted_at: string | null
      created_at: string
    }>
    notifications: Table<{
      id: string
      org_id: string
      user_id: string
      title: string
      body: string | null
      link: string | null
      read_at: string | null
      created_at: string
    }>
    master_data_types: Table<{
      id: string
      org_id: string
      code: string
      name: string
      created_at: string
      updated_at: string
    }>
    master_data_items: Table<{
      id: string
      type_id: string
      code: string
      label: string
      metadata: Json
      sort_order: number
      is_active: boolean
      created_at: string
      updated_at: string
    }>
    territories: Table<{
      id: string
      org_id: string
      parent_id: string | null
      name: string
      level: string
      boundary: unknown | null
      created_at: string
      updated_at: string
    }>
    uoms: Table<{
      id: string
      org_id: string
      code: string
      name: string
      created_at: string
      updated_at: string
    }>
    tax_rates: Table<{
      id: string
      org_id: string
      name: string
      rate: number
      is_inclusive: boolean
      created_at: string
      updated_at: string
    }>
    departments: Table<{
      id: string
      org_id: string
      parent_id: string | null
      name: string
      created_at: string
      updated_at: string
      code: string | null
      description: string | null
      manager_id: string | null
      status: string | null
    }>
    positions: Table<{
      id: string
      org_id: string
      title: string
      grade: string | null
      created_at: string
      updated_at: string
    }>
    employees: Table<{
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
      status: string
      device_id: string | null
      is_field_staff: boolean
      created_at: string
      updated_at: string
      middle_name: string | null
      name_suffix: string | null
      date_of_birth: string | null
      sex: string | null
      civil_status: string | null
      nationality: string | null
      place_of_birth: string | null
      religion: string | null
      present_address: string | null
      permanent_address: string | null
      province: string | null
      city_municipality: string | null
      barangay: string | null
      zip_code: string | null
      sss_no: string | null
      philhealth_no: string | null
      pagibig_no: string | null
      tin: string | null
      umid_no: string | null
      passport_no: string | null
      drivers_license_no: string | null
      prc_license_no: string | null
      emergency_contact_name: string | null
      emergency_contact_relationship: string | null
      emergency_contact_phone: string | null
      emergency_contact_address: string | null
      regularization_date: string | null
      employment_type: string | null
      basic_salary: number | null
      pay_frequency: string | null
      bank_name: string | null
      bank_account_no: string | null
      highest_education: string | null
      school_name: string | null
      course: string | null
      year_graduated: number | null
    }>
    employee_documents: Table<{
      id: string
      employee_id: string
      doc_type: string
      file_url: string
      expires_on: string | null
      created_at: string
    }>
    shifts: Table<{
      id: string
      org_id: string
      name: string
      start_time: string
      end_time: string
      grace_minutes: number
      created_at: string
      updated_at: string
    }>
    employee_shifts: Table<{
      employee_id: string
      shift_id: string
      effective_from: string
      effective_to: string | null
    }>
    attendances: Table<{
      id: string
      org_id: string
      employee_id: string
      work_date: string
      clock_in_at: string | null
      clock_out_at: string | null
      clock_in_loc: unknown | null
      clock_out_loc: unknown | null
      clock_in_photo: string | null
      clock_out_photo: string | null
      status: string
      late_minutes: number
      overtime_minutes: number
      is_within_geofence: boolean | null
      remarks: string | null
      created_at: string
      client_uuid: string | null
      synced_at: string | null
    }>
    leave_types: Table<{
      id: string
      org_id: string
      name: string
      is_paid: boolean
      annual_quota: number | null
      carry_over: boolean
      created_at: string
      updated_at: string
    }>
    leave_balances: Table<{
      employee_id: string
      leave_type_id: string
      year: number
      entitled: number
      used: number
    }>
    leaves: Table<{
      id: string
      org_id: string
      employee_id: string
      leave_type_id: string
      start_date: string
      end_date: string
      days: number
      reason: string | null
      status: string
      created_at: string
      updated_at: string
    }>
    holidays: Table<{
      id: string
      org_id: string
      name: string
      holiday_date: string
      created_at: string
    }>
    accounts: Table<{
      id: string
      org_id: string
      account_no: string
      name: string
      legal_name: string | null
      tax_id: string | null
      account_type: string | null
      owner_id: string | null
      price_list_id: string | null
      payment_term_days: number
      credit_limit: number
      billing_address: Json | null
      shipping_address: Json | null
      status: string
      created_at: string
      updated_at: string
    }>
    contacts: Table<{
      id: string
      org_id: string
      account_id: string | null
      first_name: string
      last_name: string | null
      title: string | null
      email: string | null
      phone: string | null
      is_primary: boolean
      created_at: string
      updated_at: string
    }>
    leads: Table<{
      id: string
      org_id: string
      name: string
      company: string | null
      email: string | null
      phone: string | null
      source: string | null
      owner_id: string | null
      status: string
      score: number | null
      location: unknown | null
      converted_account_id: string | null
      converted_at: string | null
      created_at: string
      updated_at: string
    }>
    pipeline_stages: Table<{
      id: string
      org_id: string
      name: string
      sort_order: number
      probability: number
      is_won: boolean
      is_lost: boolean
      created_at: string
      updated_at: string
    }>
    opportunities: Table<{
      id: string
      org_id: string
      account_id: string
      lead_id: string | null
      name: string
      stage_id: string
      amount: number
      expected_close: string | null
      owner_id: string | null
      lost_reason: string | null
      created_at: string
      updated_at: string
    }>
    activities: Table<{
      id: string
      org_id: string
      entity_type: string
      entity_id: string
      type: string
      subject: string | null
      notes: string | null
      due_at: string | null
      done_at: string | null
      owner_id: string | null
      created_at: string
    }>
    outlets: Table<{
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
      status: string
      photos: Json
      created_at: string
      updated_at: string
    }>
    routes: Table<{
      id: string
      org_id: string
      name: string
      employee_id: string | null
      day_of_week: number | null
      created_at: string
      updated_at: string
    }>
    route_stops: Table<{
      route_id: string
      outlet_id: string
      sequence: number
    }>
    visits: Table<{
      id: string
      org_id: string
      employee_id: string
      outlet_id: string
      route_id: string | null
      planned_date: string | null
      status: string
      check_in_at: string | null
      check_out_at: string | null
      check_in_loc: unknown | null
      check_out_loc: unknown | null
      distance_from_outlet_m: number | null
      skip_reason: string | null
      notes: string | null
      created_at: string
      updated_at: string
      client_uuid: string | null
      synced_at: string | null
    }>
    visit_photos: Table<{
      id: string
      visit_id: string
      file_url: string
      caption: string | null
      taken_at: string
    }>
    location_pings: Table<{
      id: number | null
      org_id: string
      employee_id: string
      recorded_at: string
      location: unknown
      accuracy_m: number | null
      speed_mps: number | null
      battery_pct: number | null
      is_mock: boolean
    }>
    geofences: Table<{
      id: string
      org_id: string
      name: string
      shape: unknown
      rule: string
      created_at: string
      updated_at: string
    }>
    product_categories: Table<{
      id: string
      org_id: string
      parent_id: string | null
      name: string
      created_at: string
      updated_at: string
    }>
    products: Table<{
      id: string
      org_id: string
      sku: string
      barcode: string | null
      name: string
      description: string | null
      category_id: string | null
      brand: string | null
      product_type: string
      base_uom_id: string
      tax_rate_id: string | null
      cost: number
      is_batch_tracked: boolean
      is_active: boolean
      image_url: string | null
      created_at: string
      updated_at: string
    }>
    product_uom_conversions: Table<{
      product_id: string
      uom_id: string
      factor: number
    }>
    price_lists: Table<{
      id: string
      org_id: string
      name: string
      currency_code: string
      valid_from: string | null
      valid_to: string | null
      is_default: boolean
      created_at: string
      updated_at: string
    }>
    price_list_items: Table<{
      price_list_id: string
      product_id: string
      uom_id: string
      price: number
      min_qty: number
    }>
    warehouses: Table<{
      id: string
      org_id: string
      code: string
      name: string
      type: string
      employee_id: string | null
      address: string | null
      created_at: string
      updated_at: string
    }>
    batches: Table<{
      id: string
      product_id: string
      batch_no: string
      mfg_date: string | null
      expiry_date: string | null
      created_at: string
    }>
    stock_levels: Table<{
      id: string
      warehouse_id: string
      product_id: string
      batch_id: string | null
      on_hand: number
      reserved: number
      available: number | null
      reorder_level: number | null
      updated_at: string
    }>
    stock_movements: Table<{
      id: string
      org_id: string
      warehouse_id: string
      product_id: string
      batch_id: string | null
      movement_type: string
      quantity: number
      unit_cost: number | null
      ref_type: string | null
      ref_id: string | null
      notes: string | null
      created_by: string | null
      created_at: string
    }>
    stock_counts: Table<{
      id: string
      org_id: string
      warehouse_id: string
      status: string
      counted_at: string | null
      counted_by: string | null
      created_at: string
    }>
    stock_count_lines: Table<{
      id: string
      count_id: string
      product_id: string
      batch_id: string | null
      system_qty: number
      counted_qty: number
    }>
    boms: Table<{
      id: string
      org_id: string
      product_id: string
      version: number
      output_qty: number
      is_active: boolean
      created_at: string
      updated_at: string
    }>
    bom_items: Table<{
      bom_id: string
      component_id: string
      quantity: number
      scrap_pct: number
    }>
    production_orders: Table<{
      id: string
      org_id: string
      order_no: string
      bom_id: string
      warehouse_id: string
      planned_qty: number
      produced_qty: number
      scrap_qty: number
      status: string
      start_date: string | null
      end_date: string | null
      created_at: string
      updated_at: string
    }>
    production_consumption: Table<{
      production_order_id: string
      component_id: string
      planned_qty: number
      actual_qty: number
    }>
    assets: Table<{
      id: string
      org_id: string
      asset_tag: string
      name: string
      category: string | null
      serial_no: string | null
      purchase_date: string | null
      purchase_cost: number | null
      useful_life_months: number | null
      salvage_value: number | null
      status: string
      assigned_employee_id: string | null
      assigned_outlet_id: string | null
      created_at: string
      updated_at: string
    }>
    asset_assignments: Table<{
      id: string
      asset_id: string
      employee_id: string | null
      outlet_id: string | null
      assigned_at: string
      returned_at: string | null
      condition_out: string | null
      condition_in: string | null
    }>
    asset_maintenance: Table<{
      id: string
      asset_id: string
      scheduled_on: string | null
      completed_on: string | null
      description: string | null
      cost: number | null
    }>
    promos: Table<{
      id: string
      org_id: string
      code: string
      name: string
      promo_type: string
      valid_from: string
      valid_to: string
      budget: number | null
      budget_used: number
      is_stackable: boolean
      priority: number
      status: string
      created_at: string
      updated_at: string
    }>
    promo_rules: Table<{
      id: string
      promo_id: string
      rule_type: string
      config: Json
    }>
    promo_scopes: Table<{
      promo_id: string
      scope_type: string
      scope_ref: string
    }>
    orders: Table<{
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
      status: string
      subtotal: number
      discount_total: number
      tax_total: number
      grand_total: number
      currency_code: string
      notes: string | null
      created_at: string
      updated_at: string
      client_uuid: string | null
      synced_at: string | null
    }>
    order_items: Table<{
      id: string
      order_id: string
      product_id: string
      uom_id: string
      quantity: number
      unit_price: number
      discount_amount: number
      tax_amount: number
      line_total: number
      promo_id: string | null
      is_free_item: boolean
      fulfilled_qty: number
    }>
    promo_redemptions: Table<{
      id: string
      promo_id: string
      order_id: string
      account_id: string | null
      discount_value: number
      redeemed_at: string
    }>
    sales_transactions: Table<{
      id: string
      org_id: string
      txn_no: string
      txn_type: string
      order_id: string | null
      account_id: string | null
      outlet_id: string | null
      salesperson_id: string | null
      txn_date: string
      total_amount: number
      payment_method: string | null
      created_at: string
      client_uuid: string | null
      synced_at: string | null
    }>
    sales_transaction_items: Table<{
      id: string
      txn_id: string
      product_id: string
      quantity: number
      unit_price: number
      line_total: number
    }>
    sales_targets: Table<{
      id: string
      org_id: string
      employee_id: string | null
      territory_id: string | null
      product_id: string | null
      period_start: string
      period_end: string
      metric: string
      target_value: number
      created_at: string
    }>
    expense_categories: Table<{
      id: string
      org_id: string
      name: string
      max_amount: number | null
      requires_receipt: boolean
      created_at: string
      updated_at: string
    }>
    expense_reports: Table<{
      id: string
      org_id: string
      report_no: string
      employee_id: string
      title: string | null
      total_amount: number
      status: string
      submitted_at: string | null
      reimbursed_at: string | null
      created_at: string
      updated_at: string
    }>
    expenses: Table<{
      id: string
      report_id: string | null
      org_id: string
      employee_id: string
      category_id: string
      expense_date: string
      amount: number
      currency_code: string
      description: string | null
      receipt_url: string | null
      visit_id: string | null
      distance_km: number | null
      status: string
      created_at: string
      updated_at: string
      client_uuid: string | null
      synced_at: string | null
    }>
    invoices: Table<{
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
      status: string
      created_at: string
      updated_at: string
    }>
    invoice_items: Table<{
      id: string
      invoice_id: string
      product_id: string | null
      description: string | null
      quantity: number
      unit_price: number
      line_total: number
    }>
    payments: Table<{
      id: string
      org_id: string
      payment_no: string
      account_id: string
      collected_by: string | null
      visit_id: string | null
      method: string
      amount: number
      reference_no: string | null
      check_date: string | null
      received_at: string
      proof_url: string | null
      status: string
      remittance_id: string | null
      created_at: string
      updated_at: string
    }>
    payment_allocations: Table<{
      id: string
      payment_id: string
      invoice_id: string
      amount: number
    }>
    remittances: Table<{
      id: string
      org_id: string
      employee_id: string
      total_amount: number
      bank_reference: string | null
      deposited_at: string | null
      verified_by: string | null
      status: string
      created_at: string
      updated_at: string
    }>
    forms: Table<{
      id: string
      org_id: string
      name: string
      form_type: string | null
      version: number
      status: string
      schema: Json
      created_at: string
      updated_at: string
    }>
    form_fields: Table<{
      id: string
      form_id: string
      key: string
      label: string
      field_type: string
      is_required: boolean
      options: Json | null
      logic: Json | null
      sort_order: number
    }>
    form_submissions: Table<{
      id: string
      org_id: string
      form_id: string
      form_version: number
      submitted_by: string
      visit_id: string | null
      outlet_id: string | null
      ticket_id: string | null
      answers: Json
      location: unknown | null
      submitted_at: string
      synced_at: string | null
      client_uuid: string | null
    }>
    service_tickets: Table<{
      id: string
      org_id: string
      ticket_no: string
      title: string
      description: string | null
      category: string | null
      priority: string
      status: string
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
      client_uuid: string | null
      synced_at: string | null
    }>
    ticket_comments: Table<{
      id: string
      ticket_id: string
      author_id: string
      body: string
      is_internal: boolean
      created_at: string
    }>
    data_jobs: Table<{
      id: string
      org_id: string
      job_type: string
      module: string
      file_url: string | null
      mapping: Json | null
      status: string
      total_rows: number | null
      success_rows: number | null
      error_rows: number | null
      error_report_url: string | null
      created_by: string | null
      created_at: string
      finished_at: string | null
    }>
    report_definitions: Table<{
      id: string
      org_id: string | null
      name: string
      description: string | null
      data_source: string
      config: Json
      is_system: boolean
      owner_id: string | null
      visibility: string
      created_at: string
      updated_at: string
    }>
    report_schedules: Table<{
      id: string
      org_id: string
      report_id: string
      cron: string
      format: string
      recipients: Json
      last_run_at: string | null
      is_active: boolean
      created_at: string
      updated_at: string
    }>
    report_runs: Table<{
      id: string
      org_id: string
      report_id: string
      run_by: string | null
      params: Json | null
      file_url: string | null
      row_count: number | null
      created_at: string
    }>
    dashboard_layouts: Table<{
      id: string
      org_id: string
      role_id: string | null
      user_id: string | null
      widgets: Json
      created_at: string
      updated_at: string
    }>
    announcements: Table<{
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
    }>
    announcement_reads: Table<{
      announcement_id: string
      user_id: string
      read_at: string
      acknowledged_at: string | null
    }>
    activity_feed: Table<{
      id: number
      org_id: string
      actor_id: string | null
      verb: string
      entity_type: string
      entity_id: string
      summary: string
      audience: Json | null
      created_at: string
    }>
    comments: Table<{
      id: string
      org_id: string
      entity_type: string
      entity_id: string
      author_id: string
      body: string
      mentions: string
      created_at: string
    }>
    attachments: Table<{
      id: string
      org_id: string
      entity_type: string
      entity_id: string
      file_name: string
      mime_type: string | null
      size_bytes: number | null
      storage_url: string
      uploaded_by: string | null
      created_at: string
    }>
    }
    Views: {
    rpt_attendance_daily: Table<{
      org_id: string
      employee_name: string | number | null
      hours_worked: string | number | null
    }>
    rpt_visit_compliance: Table<{
      org_id: string
      employee_name: string | number | null
      planned_visits: string | number | null
      completed_visits: string | number | null
      missed_visits: string | number | null
      compliance_pct: string | number | null
    }>
    rpt_sales_by_outlet: Table<{
      org_id: string
      sales_date: string | number | null
      outlet_name: string | number | null
      txn_count: string | number | null
      total_amount: string | number | null
    }>
    rpt_sales_by_rep: Table<{
      org_id: string
      sales_date: string | number | null
      employee_name: string | number | null
      txn_count: string | number | null
      total_amount: string | number | null
    }>
    rpt_stock_on_hand: Table<{
      org_id: string
      warehouse_name: string | number | null
      product_name: string | number | null
    }>
    rpt_receivables_aging: Table<{
      org_id: string
      account_name: string | number | null
      invoice_id: string | number | null
      balance: string | number | null
      days_overdue: string | number | null
      aging_bucket: string | number | null
    }>
    rpt_expense_summary: Table<{
      org_id: string
      month: string | number | null
      employee_name: string | number | null
      category: string | number | null
      expense_count: string | number | null
      total_amount: string | number | null
    }>
    rpt_order_pipeline: Table<{
      org_id: string
      order_count: string | number | null
      total_value: string | number | null
    }>
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
