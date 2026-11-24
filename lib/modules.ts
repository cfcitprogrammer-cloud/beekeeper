import type { LucideIcon } from "lucide-react"
import {
  ActivityIcon,
  BadgeDollarSignIcon,
  BarChart3Icon,
  BoxesIcon,
  Building2Icon,
  CalendarDaysIcon,
  ClipboardListIcon,
  ClockIcon,
  DatabaseZapIcon,
  FactoryIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  MapPinIcon,
  MegaphoneIcon,
  NavigationIcon,
  PackageIcon,
  ReceiptIcon,
  SettingsIcon,
  ShoppingCartIcon,
  SlidersHorizontalIcon,
  StoreIcon,
  Table2Icon,
  TargetIcon,
  TicketPercentIcon,
  TruckIcon,
  UserPlusIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react"

export type ModuleDefinition = {
  slug: string
  name: string
  group: ModuleGroupId
  /** Permission module checked against `has_permission` / current_permissions. */
  permission: string
  description: string
  capabilities: string[]
  phase: number
  icon: LucideIcon
}

export type ModuleGroupId =
  | "overview"
  | "people"
  | "operations"
  | "revenue"
  | "inventory"
  | "finance"
  | "tools"
  | "system"

export const MODULE_GROUPS: { id: ModuleGroupId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "people", label: "People" },
  { id: "operations", label: "Operations" },
  { id: "revenue", label: "Sales & CRM" },
  { id: "inventory", label: "Inventory" },
  { id: "finance", label: "Finance" },
  { id: "tools", label: "Tools" },
  { id: "system", label: "System" },
]

export const MODULES: ModuleDefinition[] = [
  {
    slug: "dashboard",
    name: "Dashboard",
    group: "overview",
    permission: "dashboard",
    description: "The role-aware landing page: today's field activity, revenue and the work waiting on you.",
    capabilities: [
      "Configurable KPI widgets per role",
      "Visits, sales, collections and approvals at a glance",
      "Saved dashboard layouts",
    ],
    phase: 7,
    icon: LayoutDashboardIcon,
  },
  {
    slug: "approvals",
    name: "Approvals",
    group: "overview",
    permission: "approvals",
    description: "The shared queue of pending decisions across leave, expenses, orders and corrections.",
    capabilities: [
      "Multi-level approval steps",
      "Approve or reject with remarks",
      "Decisions written to the audit log and activity feed",
    ],
    phase: 5,
    icon: ClipboardListIcon,
  },
  {
    slug: "announcements",
    name: "Announcements",
    group: "overview",
    permission: "announcements",
    description: "Company and team broadcasts with targeting, scheduling and read receipts.",
    capabilities: [
      "Target by role, department, region or team",
      "Publish and expiry windows",
      "Acknowledgement tracking",
    ],
    phase: 7,
    icon: MegaphoneIcon,
  },
  {
    slug: "activity",
    name: "Activity feed",
    group: "overview",
    permission: "activity",
    description: "A chronological stream of what changed across the organization.",
    capabilities: [
      "System events from the audit log",
      "Filter by person, module and date",
      "Comments and mentions",
    ],
    phase: 7,
    icon: ActivityIcon,
  },
  {
    slug: "employees",
    name: "Employees",
    group: "people",
    permission: "employees",
    description: "The employee master, reporting lines, documents and field assignments.",
    capabilities: [
      "Profiles, departments, positions and managers",
      "Employment status and documents",
      "Territory, route and device assignment",
    ],
    phase: 1,
    icon: UsersIcon,
  },
  {
    slug: "attendance",
    name: "Attendance",
    group: "people",
    permission: "attendance",
    description: "Clock-in and clock-out records, shifts, lateness and corrections.",
    capabilities: [
      "GPS and selfie clock-in from the field",
      "Late, early and overtime computation",
      "Manual corrections with approval",
    ],
    phase: 2,
    icon: ClockIcon,
  },
  {
    slug: "leaves",
    name: "Leaves",
    group: "people",
    permission: "leaves",
    description: "Leave types, balances, requests and multi-level approval.",
    capabilities: [
      "Accrual and yearly balances",
      "Multi-level approval workflow",
      "Holiday calendar and attendance integration",
    ],
    phase: 5,
    icon: CalendarDaysIcon,
  },
  {
    slug: "outlets",
    name: "Outlets",
    group: "operations",
    permission: "outlets",
    description: "The store and customer-location master that field visits are planned around.",
    capabilities: [
      "Addresses, coordinates and geofences",
      "Channel, tier and visit frequency",
      "Assignment to accounts and routes",
    ],
    phase: 2,
    icon: StoreIcon,
  },
  {
    slug: "visits",
    name: "Visits",
    group: "operations",
    permission: "visits",
    description: "Planned and ad-hoc outlet visits, from check-in to completed tasks.",
    capabilities: [
      "Visit plans and routes",
      "Geolocated check-in and time on site",
      "Orders, stock checks, collections and photos",
    ],
    phase: 2,
    icon: MapPinIcon,
  },
  {
    slug: "tracking",
    name: "Tracking & maps",
    group: "operations",
    permission: "tracking",
    description: "Live and historical field location, territories and geofence alerts.",
    capabilities: [
      "Live and last-known positions",
      "Trail playback and distance travelled",
      "Out-of-territory and geofence alerts",
    ],
    phase: 2,
    icon: NavigationIcon,
  },
  {
    slug: "leads",
    name: "Leads",
    group: "revenue",
    permission: "leads",
    description: "Capture, qualify and convert prospects into accounts and opportunities.",
    capabilities: [
      "Source, owner, status and score",
      "Activity logging and reassignment",
      "Conversion to account, contact and opportunity",
    ],
    phase: 4,
    icon: UserPlusIcon,
  },
  {
    slug: "accounts",
    name: "Accounts",
    group: "revenue",
    permission: "accounts",
    description: "Customer companies, billing terms, credit limits and account history.",
    capabilities: [
      "Legal, billing and shipping details",
      "Contacts and linked outlets",
      "Credit terms, price list and salesperson",
    ],
    phase: 4,
    icon: Building2Icon,
  },
  {
    slug: "opportunities",
    name: "Opportunities",
    group: "revenue",
    permission: "opportunities",
    description: "The sales pipeline with stages, values, probability and forecasts.",
    capabilities: [
      "Kanban and forecast views",
      "Products of interest and competitors",
      "Won opportunities become orders",
    ],
    phase: 4,
    icon: TargetIcon,
  },
  {
    slug: "orders",
    name: "Orders",
    group: "revenue",
    permission: "orders",
    description: "Field and back-office sales orders with pricing, promos and fulfilment.",
    capabilities: [
      "Line items, discounts, taxes and delivery dates",
      "Draft to approved to fulfilled workflow",
      "Stock reservation and invoice hand-off",
    ],
    phase: 4,
    icon: ShoppingCartIcon,
  },
  {
    slug: "sales",
    name: "Sales",
    group: "revenue",
    permission: "sales",
    description: "Recorded sell-out transactions, returns and target achievement.",
    capabilities: [
      "Van sales and point-of-sale entries",
      "Returns and credit memos",
      "Performance by product, outlet, rep and region",
    ],
    phase: 4,
    icon: BadgeDollarSignIcon,
  },
  {
    slug: "promos",
    name: "Promotions",
    group: "revenue",
    permission: "promos",
    description: "Promotion definitions, eligibility rules, budgets and redemption tracking.",
    capabilities: [
      "Percentage, amount, bundle and free-item rules",
      "Eligibility by outlet, account, region and product",
      "Budget caps, stacking and ROI",
    ],
    phase: 4,
    icon: TicketPercentIcon,
  },
  {
    slug: "products",
    name: "Products",
    group: "inventory",
    permission: "products",
    description: "The product and SKU catalogue with units, barcodes, pricing and tax.",
    capabilities: [
      "Categories, brand and product type",
      "Units of measure and conversions",
      "Price lists, tax class and images",
    ],
    phase: 3,
    icon: PackageIcon,
  },
  {
    slug: "inventory",
    name: "Inventory",
    group: "inventory",
    permission: "inventory",
    description: "Stock by warehouse and van, with batches, movements, counts and valuation.",
    capabilities: [
      "On-hand, reserved and available stock",
      "Receipts, issues, transfers and adjustments",
      "Batch, expiry and reorder levels",
    ],
    phase: 3,
    icon: BoxesIcon,
  },
  {
    slug: "production",
    name: "Production",
    group: "inventory",
    permission: "production",
    description: "Bills of materials, production orders and material consumption.",
    capabilities: [
      "BOMs and material requirements",
      "Production orders and output",
      "Yield, scrap and stock movements",
    ],
    phase: 6,
    icon: FactoryIcon,
  },
  {
    slug: "assets",
    name: "Assets",
    group: "inventory",
    permission: "assets",
    description: "Vehicles, devices, equipment and merchandising fixtures with assignment history.",
    capabilities: [
      "Tags, categories and purchase information",
      "Assignment to employees or outlets",
      "Maintenance schedules and location history",
    ],
    phase: 6,
    icon: TruckIcon,
  },
  {
    slug: "expenses",
    name: "Expenses",
    group: "finance",
    permission: "expenses",
    description: "Employee expense claims with receipts, policy checks and approvals.",
    capabilities: [
      "Categories, per-diem and mileage rules",
      "Receipt attachments and visit linkage",
      "Approval and reimbursement status",
    ],
    phase: 5,
    icon: WalletIcon,
  },
  {
    slug: "billing",
    name: "Billing & collection",
    group: "finance",
    permission: "billing",
    description: "Invoices, receivables, field collections and remittance reconciliation.",
    capabilities: [
      "Invoices generated from orders and sales",
      "Aging, payment allocation and statements",
      "Field collections and deposits",
    ],
    phase: 5,
    icon: ReceiptIcon,
  },
  {
    slug: "import-export",
    name: "Import & export",
    group: "tools",
    permission: "data_jobs",
    description: "Bulk CSV and XLSX import with validation, plus scheduled exports.",
    capabilities: [
      "Templates and field mapping",
      "Validation and error reports",
      "Job history and scheduled exports",
    ],
    phase: 7,
    icon: DatabaseZapIcon,
  },
  {
    slug: "forms",
    name: "Digital forms",
    group: "tools",
    permission: "forms",
    description: "Configurable surveys, audits and checklists with offline capture.",
    capabilities: [
      "Field types and conditional logic",
      "Photo, signature and GPS capture",
      "Attachment to visits, outlets and tickets",
    ],
    phase: 6,
    icon: ClipboardListIcon,
  },
  {
    slug: "tickets",
    name: "Service tickets",
    group: "tools",
    permission: "tickets",
    description: "Support issues tied to accounts, outlets, assets or products, with SLAs.",
    capabilities: [
      "Priority, assignment and SLA timers",
      "Comments and attachments",
      "Resolution and customer sign-off",
    ],
    phase: 6,
    icon: LifeBuoyIcon,
  },
  {
    slug: "reports",
    name: "Reports",
    group: "tools",
    permission: "reports",
    description: "Prebuilt operational and management reports over the curated views.",
    capabilities: [
      "Attendance, visits, sales, aging and stock",
      "Filters, scheduling and exports",
      "PDF and Excel output",
    ],
    phase: 7,
    icon: BarChart3Icon,
  },
  {
    slug: "reports-builder",
    name: "Reports builder",
    group: "tools",
    permission: "reports",
    description: "Self-service report design over approved data sources.",
    capabilities: [
      "Columns, filters, grouping and aggregations",
      "Charts and saved views",
      "Sharing and schedules",
    ],
    phase: 7,
    icon: SlidersHorizontalIcon,
  },
  {
    slug: "administration",
    name: "Administration",
    group: "system",
    permission: "administration",
    description: "Users, roles, permissions, organization settings, approvals and audit logs.",
    capabilities: [
      "Users, roles and data scopes",
      "Organization and approval configuration",
      "Notification templates, API keys and audit logs",
    ],
    phase: 1,
    icon: SettingsIcon,
  },
  {
    slug: "master-data",
    name: "Master data",
    group: "system",
    permission: "master_data",
    description: "Shared reference data used across every module.",
    capabilities: [
      "Territories, outlet types and channels",
      "Units, currencies, tax rates and payment terms",
      "Expense, leave, ticket and lead lookups",
    ],
    phase: 1,
    icon: Table2Icon,
  },
]

export function getModule(slug: string) {
  return MODULES.find((module) => module.slug === slug)
}

export function visibleModules(can: (module: string, action?: string) => boolean) {
  return MODULES.filter((module) => can(module.permission, "view"))
}
