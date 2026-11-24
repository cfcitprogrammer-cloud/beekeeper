export const REPORT_VIEWS = {
  rpt_attendance_daily: [
    "work_date",
    "employee_no",
    "employee_name",
    "status",
    "clock_in_at",
    "clock_out_at",
    "late_minutes",
    "overtime_minutes",
    "hours_worked",
  ],
  rpt_visit_compliance: [
    "planned_date",
    "employee_no",
    "employee_name",
    "planned_visits",
    "completed_visits",
    "missed_visits",
    "compliance_pct",
  ],
  rpt_sales_by_outlet: ["sales_date", "outlet_name", "txn_count", "total_amount"],
  rpt_sales_by_rep: ["sales_date", "employee_no", "employee_name", "txn_count", "total_amount"],
  rpt_stock_on_hand: [
    "warehouse_name",
    "sku",
    "product_name",
    "batch_no",
    "expiry_date",
    "on_hand",
    "reserved",
    "available",
    "reorder_level",
  ],
  rpt_receivables_aging: [
    "account_name",
    "invoice_no",
    "invoice_date",
    "due_date",
    "total",
    "amount_paid",
    "balance",
    "days_overdue",
    "aging_bucket",
  ],
  rpt_expense_summary: [
    "month",
    "employee_no",
    "employee_name",
    "category",
    "status",
    "expense_count",
    "total_amount",
  ],
  rpt_order_pipeline: ["order_date", "status", "order_count", "total_value"],
} as const

export type ReportViewName = keyof typeof REPORT_VIEWS

export function isReportView(value: string): value is ReportViewName {
  return value in REPORT_VIEWS
}

export function reportColumns(value: string): readonly string[] {
  return isReportView(value) ? REPORT_VIEWS[value] : []
}
