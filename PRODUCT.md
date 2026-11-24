# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences share one tenant:

- **Field staff** — sales representatives, merchandisers and delivery staff working
  from phones in the field. They plan and check into outlet visits, take orders,
  capture stock and shelf data, log expenses, collect payments and clock in/out.
- **Back-office teams** — administrators, operations managers, warehouse and
  finance staff on desktop. They manage people, master data, inventory,
  production, pricing, invoicing, approvals and reporting.

A single person can hold both roles, so the interface has to make the current
user's permitted scope obvious rather than presenting every module equally.

## Product Purpose

Beekeeper ERP is a multi-tenant ERP for distribution and field-sales businesses.
It connects what happens in the field — visits, orders, collections, expenses,
attendance — to the back-office records that depend on it: stock, invoices,
payments, approvals and reports. Success means a field visit produces trustworthy
operational and financial records without a second data-entry pass, while every
tenant sees only its own data.

## Positioning

The differentiator is a single permissioned system of record spanning field
execution and back-office settlement. Visit check-ins, GPS trails, outlet orders,
stock movements, invoices and collections are tied to the same tenant, employee,
outlet and product records, so operational compliance and financial exposure can
be answered from one place instead of reconciling separate field and ERP tools.

## Operating Context

- Multi-tenant, self-serve organization onboarding: a new user signs up, names
  their organization, and becomes its first Administrator.
- Field work happens on phones, often with intermittent connectivity; GPS,
  photos, signatures and offline submissions are expected inputs.
- Back-office work happens on desktop browsers, frequently in dense tables,
  approval queues and reports.
- Role-based access is part of daily use: Administrators, managers, sales reps,
  field staff, finance and viewers see different modules and actions.
- Approvals are a recurring ritual across leave, expenses, orders and attendance
  corrections.
- Money and stock are ledger-driven; records are expected to reconcile, not be
  freely editable totals.

## Capabilities and Constraints

- Modules: Home (dashboard, announcements, activity), People (employees,
  attendance, leave), Operations (outlets, visits, tracking, maps), Sales & CRM
  (leads, accounts, opportunities, orders, sales, promos), Inventory (products,
  stock, production, assets), Finance (expenses, billing and collection), Tools
  (import/export, digital forms, service tickets, reports, report builder) and
  System (administration, master data).
- Backend is Supabase: Postgres, Auth, Storage and PostGIS. Row-level security
  enforces tenant isolation plus module/action permissions.
- Authentication is delegated to Supabase Auth. `public.users` is a profile and
  tenant-membership row keyed by `auth.users.id`.
- A user without an organization sees no tenant data until they complete
  onboarding through `bootstrap_organization`.
- Onboarding creates the organization, an Administrator role with every
  permission, and starter master data, pipeline stages, leave types, expense
  categories, units of measure, a warehouse, a price list, a shift and a
  territory.
- `role_permissions.data_scope` (own, team, territory, organization) is stored
  but row-level data scoping is enforced by the application query layer.
- Location pings are high-volume and partitioned monthly; reports must read the
  curated `security_invoker` views rather than raw tables.
- No non-Administrator roles are seeded yet. New tenants begin with exactly one
  role, so role-aware UI must degrade honestly to "Administrator" and "no
  modules" rather than inventing sample roles.
- Open product decision: the order and priority of Phase 1 modules after auth
  and onboarding (see `Progress.md`).

## Brand Commitments

- Product name: **Beekeeper ERP**.
- The incumbent interface uses a warm amber/honey primary against neutral
  surfaces, square corners and restrained density. New screens extend that
  system rather than rebranding it.

## Evidence on Hand

- `RECOMMENDATION.md` is the authoritative product and schema specification.
- `supabase/migrations/` is the authoritative data model, RLS and seed
  implementation.
- `Progress.md` is the authoritative build status.
- There are no customers, testimonials, benchmarks, pricing or usage metrics in
  the repository. Do not fabricate them; empty and first-run states must say
  what is actually true.

## Product Principles

1. **Field truth first.** A record should be created where the work happens and
   flow outward; never ask a field user to duplicate it in the office.
2. **Tenant and permission boundaries are visible.** Navigation, empty states
   and actions reflect what this user can actually see and do.
3. **Ledgers over totals.** Stock, invoices and payments reconcile through
   auditable movements, not editable aggregate fields.
4. **Calm density.** Operational screens carry a lot of information; hierarchy,
   spacing and typography do the work instead of decoration.
5. **Honest first runs.** A new tenant has real seed data and no history. Show
   that plainly and teach the next useful action.

## Accessibility & Inclusion

- Standard keyboard-operable controls, visible focus states and labelled form
  fields are required for the desktop back-office workflows.
- Field screens must remain usable one-handed on a phone, with large touch
  targets and readable contrast in outdoor light.
