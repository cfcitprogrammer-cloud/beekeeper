---
name: "Beekeeper ERP"
description: "Minimalist, modern enterprise SaaS design system for Beekeeper ERP with warm neutral surfaces, restrained amber accents, and compact Inter typography."
---

DESIGN.md
Beekeeper ERP — Web Application Design System
Version: 1.0 Platform: Desktop Web Application Design Direction: Minimalist, Modern Enterprise SaaS Visual Inspiration: Tarsi by Bryl Lim Primary Brand Color: Amber

1. PRODUCT OVERVIEW
   Beekeeper ERP is a comprehensive business management platform designed to manage field operations, employees, sales, inventory, production, finances, and administrative workflows.
   The application serves multiple user roles, including:

System Administrators

Organization Administrators

Managers

Supervisors

Field Agents

Sales Representatives

Finance Personnel

Operations Personnel

Human Resources Personnel
The web application must provide a consistent, organized, and efficient experience across all modules.
The primary objective is to make complex ERP workflows feel simple and intuitive.
Design Philosophy
Use the visual design philosophy of Tarsi by Bryl Lim as inspiration.
Translate its minimalist and polished design approach into a professional desktop ERP interface.
The application should feel:

Clean and minimal.

Professional but approachable.

Modern and lightweight.

Highly organized.

Information-rich without being cluttered.

Consistent across all modules.

Easy to navigate.

Efficient for users performing repetitive business tasks.
Avoid traditional outdated ERP aesthetics.
Do not make the application look like an old-fashioned enterprise administration panel.
The design should resemble a modern SaaS product with excellent usability. 2. VISUAL DESIGN DIRECTION
Overall Appearance
Use a light theme with warm neutral backgrounds and amber accents.
The visual hierarchy should rely on:

Typography.

Spacing.

Subtle surface differentiation.

Consistent component styling.

Restrained accent colors.
The interface should primarily use white and warm off-white surfaces.
Amber should be used strategically for primary actions, active navigation, selected tabs, and important highlights.
Do not make the entire interface orange or amber.
The amber color should provide identity without overwhelming the user.
Brand Color Palette
Use the following design tokens consistently.
TokenHexUsagePrimary Amber#D97706Primary buttons and brand accentsAmber Dark#B45309Hover and active statesAmber Light#FEF3C7Soft highlighted backgroundsAmber Subtle#FFFBEBSelected navigation surfacesBackground#FAFAF9Main application backgroundSurface#FFFFFFCards, tables and panelsSurface Secondary#F5F5F4Secondary backgroundsText Primary#292524Headings and primary contentText Secondary#78716CSupporting informationText Muted#A8A29EHints and disabled contentBorder#E7E5E4Dividers and outlinesSuccess#15803DSuccessful operationsWarning#D97706Pending and attention statesDanger#DC2626Errors and destructive actionsInfo#2563EBInformational states
Important: Amber is the main brand accent. Green, red, and blue should only communicate functional states.
Dark Mode
Prepare the design system for future dark mode support.
Use:

Dark charcoal backgrounds.

Elevated dark surfaces.

Warm amber accents.

Light primary text.

Muted secondary text.
Do not prioritize dark mode over the primary light theme.

```yaml
colors:
  primary-amber: "#D97706"
  amber-dark: "#B45309"
  amber-light: "#FEF3C7"
  amber-subtle: "#FFFBEB"
  success: "#15803D"
  success-subtle: "#DCFCE7"
  warning: "#D97706"
  warning-subtle: "#FEF3C7"
  danger: "#DC2626"
  danger-subtle: "#FEE2E2"
  info: "#2563EB"
  info-subtle: "#DBEAFE"
  light:
    primary: "#D97706"
    on-primary: "#2A2A2A"
    background: "#FAFAF9"
    on-background: "#292524"
    surface: "#FFFFFF"
    on-surface: "#292524"
    surface-secondary: "#F5F5F4"
    on-surface-secondary: "#766F6B"
    text-primary: "#292524"
    text-secondary: "#78716C"
    text-muted: "#A8A29E"
    border: "#E7E5E4"
    outline: "#E7E5E4"
  dark:
    primary: "#F59E0B"
    on-primary: "#1C1917"
    background: "#1C1917"
    on-background: "#F5F5F4"
    surface: "#292524"
    on-surface: "#F5F5F4"
    surface-secondary: "#332E2A"
    on-surface-secondary: "#A8A29E"
    text-primary: "#F5F5F4"
    text-secondary: "#A8A29E"
    text-muted: "#78716C"
    border: "#44403C"
    outline: "#44403C"
```

3. TYPOGRAPHY
   Use Inter as the primary typeface.
   Typography should be compact, readable, and professional.
   ElementFont SizeWeightMain page title22pxSemiboldSection heading16pxSemiboldCard heading14pxSemiboldBody text13pxRegularTable text13pxRegularSupporting text12pxRegularBreadcrumb12pxRegularNavigation label13pxMediumButton label13pxMediumMetric value26–30pxSemibold
   Avoid oversized headings.
   ERP users need to view substantial amounts of information without unnecessary scrolling.
   Use consistent typography across all modules.

Icons: Lucide

```yaml
typography:
  metric-value:
    fontFamily: "Inter"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 34px
    letterSpacing: -0.5px
  page-title:
    fontFamily: "Inter"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: -0.25px
  section-heading:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: -0.1px
  card-heading:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0px
  body-md:
    fontFamily: "Inter"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  label-md:
    fontFamily: "Inter"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: 0px
  body-sm:
    fontFamily: "Inter"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
  label-sm:
    fontFamily: "Inter"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0.25px
```

4. LAYOUT AND APPLICATION SHELL
   The application must use a consistent desktop ERP layout.
   Main Layout
   Use three primary areas:

Left sidebar navigation.

Top application header.

Main content area.
The layout should be fixed and predictable.
Sidebar
Default width: 240px.
The sidebar should:

Occupy the full viewport height.

Remain fixed while the content area scrolls.

Support independent scrolling.

Have a white or slightly warm neutral background.

Use a subtle right border.

Display grouped navigation items.

Support expandable menu groups.

Indicate the active module clearly.
Sidebar Header
At the top, display:

Beekeeper ERP logo.

Product name.
Use a compact brand area.
Organization Switcher
Below the logo, display an organization information section.
Example:
ORGANIZATION
ACME
ACME · Asia/Manila
This section should communicate the current organization and workspace context.
Allow switching organizations when the user has permission.
Navigation Groups
Organize all modules into logical categories.
Use small uppercase section labels with letter spacing.
Navigation items should contain:

A line-style icon.

A text label.

Optional expand/collapse chevron.

Optional notification count.
Use Lucide icons consistently.
Navigation States
Default:

Transparent background.

Muted text.

Gray icon.
Hover:

Soft neutral background.
Active:

Soft amber background.

Amber icon.

Darker amber or charcoal text.

Optional slim amber indicator on the left.
Expanded groups should reveal their child modules with consistent indentation.
Avoid overly rounded or oversized navigation items.
Top Header
Height: approximately 48–52px.
Include:

Breadcrumb navigation.

Notification icon.

Theme toggle.

Vertical separator.

User avatar.

User name.

Account dropdown.
The top header should remain visible while navigating long content pages.
Example:
ACME / Production
Right side:
Notifications | Theme | IT Avatar | IT TEST
Keep the header minimal.
Main Content Area
The main content area should:

Occupy the remaining viewport width.

Use a white or warm neutral background.

Scroll independently from the sidebar.

Have consistent horizontal padding.

Support responsive layouts.
Default content padding: 24px.
Avoid excessive empty space and unnecessary card containers.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 12px
  gutter-lg: 16px
  gutter-xl: 24px
  section: 32px
  page-margin: 24px
  sidebar-width: 240px
  header-height: 50px
```

5. INFORMATION ARCHITECTURE
   Preserve all existing business modules.
   Use the following navigation hierarchy.
   OVERVIEW

Dashboard

Approvals

Announcements

Activity Feed
PEOPLE

Attendance

Leaves

Employee
OPERATIONS

Visits

Tracking & Maps

Outlets
SALES & CRM

Opportunities

Orders

Sales

Promotions

Contacts

Accounts

Leads
INVENTORY & PRODUCTION

Inventory

Production

Assets

Product
FINANCE

Expenses

Billing and Collection
TOOLS & ANALYTICS

Import and Export

Digital Forms

Service Tickets

Reports

Reports Builder
ADMINISTRATION

Master Data
Important navigation requirements:

Preserve the existing module names.

Use expandable navigation groups where appropriate.

Make the grouping consistent across all pages.

Support permission-based visibility.

Do not display modules that the current user cannot access.

Support nested submenus for modules with multiple functions.

Keep the sidebar scrollable when the menu exceeds the viewport. 6. PAGE STRUCTURE
All module pages must follow a common page structure.
Standard Page Layout
A. Breadcrumb
Example:
ACME / Production / Bills of Materials
Keep breadcrumbs compact and unobtrusive.
B. Page Description
Display a short explanation below the breadcrumb or page heading.
Example:
Bills of materials, production orders and material consumption.
C. Page Actions
Place important actions in the upper-right portion of the page.
Examples:

Dashboard

Create New

Import

Export

Settings
Use amber for the primary action.
D. Module Tabs
For modules with multiple submodules, use a horizontal tab navigation.
Example:
BOMs | Production Orders
Selected tab:

Amber text.

Amber bottom border.

White background.
Inactive tab:

Muted text.

No heavy background.
E. Content Section
Display the main module content.
Possible content types:

Data tables.

Dashboard cards.

Forms.

Detail views.

Activity timelines.

Maps.

Charts.

Approval queues.
Keep the structure consistent. 7. DATA TABLE DESIGN SYSTEM
Data tables are one of the most important components in Beekeeper ERP.
The current application already uses a table-based interface. Preserve this familiar workflow while improving its visual presentation.
Table Container
Use:

White background.

Thin neutral border.

Subtle rounded corners.

Minimal or no shadow.
Suggested border radius: 10px.
Table Toolbar
Position the toolbar above the table.
Left:

Search input.
Right:

Filter.

Columns.

Export.

Create New.
Example:
[ Search records... ] [ Filter ] [ Columns ] [ Export ] [ + Create New ]
The Create New button must use the primary amber color.
Search Input

Full available width.

Search icon on the left.

Subtle border.

White background.

Compact height of approximately 36–38px.

Clear focus state using amber.
Table Header
Use:

Light neutral background.

Compact uppercase or medium-weight labels.

Clear column separation.

Consistent horizontal padding.
Do not use heavy borders.
Table Rows

White background.

Approximately 44–48px row height.

Subtle bottom dividers.

Consistent text alignment.

Hover state with a very light neutral or amber-tinted background.
Avoid excessive row decoration.
Table Features
Support:

Search.

Sorting.

Column visibility.

Filtering.

Pagination.

Page-size selection.

Export.

Row selection.

Bulk actions.

Contextual row actions.
Pagination
Place pagination at the bottom-right.
Example:
Showing 1–50 of 240 results
Previous | 1 | 2 | 3 | Next
Rows per page: 50
Use amber for the current page indicator.
Empty States
When no records are available:

Display a simple line icon.

Show a short title.

Provide a helpful description.

Include a primary action when appropriate.
Example:
No BOMs yet
Create the first BOM to start using this module.
Use a centered layout inside the table content area.
Avoid oversized illustrations. 8. BUTTONS AND INTERACTIVE ELEMENTS
Primary Button
Use:

Amber background (#D97706).

White text.

Medium font weight.

36–38px height.

6–8px border radius.
Example:

Create New
Hover: Use Amber Dark.
Focus: Use a visible amber focus ring.
Disabled: Use muted neutral styling.
Secondary Button
Use:

White background.

Neutral border.

Dark text.

Subtle hover background.
Examples:

Filter.

Columns.

Cancel.

View Details.
Destructive Button
Use red for actions such as:

Delete.

Cancel permanently.

Remove.
Always provide confirmation for destructive operations.
Icon Buttons
Use compact icon buttons for:

Notifications.

Theme.

More actions.

Edit.

Delete.

Refresh.
Maintain consistent icon size and alignment.

```yaml
rounded:
  sm: 4px
  DEFAULT: 6px
  md: 8px
  lg: 10px
  xl: 12px
  full: 9999px
```

```yaml
motion:
  state-change:
    duration: 120ms
    delay: 0ms
    timingFunction: ease-out
  surface-enter:
    duration: 200ms
    delay: 0ms
    timingFunction: cubic-bezier(0.2, 0, 0, 1)
  surface-exit:
    duration: 150ms
    delay: 0ms
    timingFunction: cubic-bezier(0.3, 0, 1, 1)
```

9. FORMS AND INPUTS
   All modules should share the same form design system.
   Form Layout
   Use a clean two-column layout when appropriate.
   For example:
   Left:

General Information.
Right:

Additional Information.
Use one column for simpler forms.
Form Components
Support:

Text fields.

Number fields.

Dropdowns.

Multi-select.

Date pickers.

Time pickers.

Checkboxes.

Radio buttons.

File uploads.

Textareas.

Searchable selects.
Input Styling

White background.

36–40px standard height.

Neutral border.

6–8px border radius.

Dark text.

Muted placeholder.
Focus state:

Amber border.

Soft amber focus ring.
Always display labels above fields.
Validation errors should appear immediately below the relevant input.
Form Actions
Position primary and secondary actions consistently.
Example:
[ Cancel ] [ Save Changes ]
Use amber for Save Changes.
For lengthy forms, consider a sticky action footer. 10. DASHBOARD
The dashboard should provide a unified overview of the organization's operations.
Use a modular dashboard layout.
Dashboard Header
Display:

Welcome message.

Organization name.

Current date.

Date range filter.
Example:
Good morning, IT TEST
Here's what's happening across your organization today.
KPI Cards
Display relevant business metrics.
Examples:

Total Employees.

Active Visits.

Pending Approvals.

Total Sales.

Outstanding Collections.

Inventory Alerts.
Use compact cards with:

Metric title.

Main number.

Comparison indicator.

Small icon.
Do not use excessive colors or oversized illustrations.
Dashboard Sections
Include:

Operational Overview.

Sales Performance.

Attendance Summary.

Recent Activity.

Pending Approvals.

Collection Summary.

Inventory Alerts.
Use charts only when they communicate meaningful information.
Charts should use amber as the primary data series color.
Dashboard Customization
Where supported, allow users to:

Change date ranges.

Filter by department.

Filter by territory.

Rearrange widgets.

View detailed reports.
Display only metrics relevant to the user's permissions and role. 11. MODULE-SPECIFIC DESIGN GUIDELINES
All modules should follow the shared page structure, table design, form design, and visual language.
OVERVIEW
Dashboard
Use KPI cards, charts, activity feeds, and summary widgets.
Approvals
Use an approval queue with:

Request type.

Requester.

Submission date.

Priority.

Status.

Approve and Reject actions.
Announcements
Use a clean announcement list with:

Title.

Author.

Publication date.

Audience.

Status.
Activity Feed
Use a chronological activity timeline with:

User avatar.

Activity description.

Timestamp.

Related module.

Relevant record link.
PEOPLE
Attendance
Display:

Employee.

Date.

Check-in.

Check-out.

Working hours.

Attendance status.
Support attendance filters and date ranges.
Leaves
Display:

Employee.

Leave type.

Date range.

Duration.

Status.

Approval actions.
Include leave balances and request details.
Employee
Display:

Employee ID.

Employee name.

Department.

Position.

Contact information.

Employment status.
Use a searchable employee directory.
OPERATIONS
Visits
Display:

Visit reference.

Customer.

Assigned agent.

Scheduled date.

Check-in time.

Check-out time.

Visit status.
Include visit details and completion records.
Tracking & Maps
Use a map-focused layout.
Include:

Agent location markers.

Agent list.

Location history.

Date filters.

Visit markers.

Route information.
Use a collapsible side panel for agent details.
Do not let the map interfere with global navigation.
Outlets
Display:

Outlet name.

Outlet code.

Address.

Assigned territory.

Contact person.

Status.
Support outlet details and location previews.
SALES & CRM
Opportunities
Display:

Opportunity name.

Account.

Sales owner.

Estimated value.

Expected closing date.

Sales stage.
Support both table and pipeline views.
Orders
Display:

Order number.

Customer.

Order date.

Total amount.

Payment status.

Order status.
Sales
Display:

Sales reference.

Customer.

Salesperson.

Transaction date.

Total amount.

Status.
Promotions
Display:

Promotion name.

Promotion type.

Start date.

End date.

Discount.

Status.
Contacts
Display:

Contact name.

Company.

Email.

Phone.

Position.

Status.
Accounts
Display:

Account name.

Account type.

Assigned owner.

Contact information.

Outstanding balance.

Status.
Leads
Display:

Lead name.

Company.

Source.

Assigned salesperson.

Lead stage.

Creation date.
INVENTORY & PRODUCTION
Inventory
Display:

Product.

SKU.

Warehouse.

Available quantity.

Reserved quantity.

Reorder level.

Stock status.
Production
Use tabs for related production functions.
Examples:

Bills of Materials.

Production Orders.

Material Consumption.
Keep the existing BOM and Production Orders workflow structure.
Assets
Display:

Asset name.

Asset code.

Category.

Assigned employee.

Location.

Condition.

Status.
Product
Display:

Product name.

SKU.

Category.

Unit.

Selling price.

Stock status.
FINANCE
Expenses
Display:

Expense reference.

Employee.

Category.

Date.

Amount.

Approval status.
Billing and Collection
Display:

Invoice number.

Customer.

Invoice date.

Due date.

Total amount.

Paid amount.

Outstanding amount.

Payment status.
Use clear financial summaries and payment history.
TOOLS & ANALYTICS
Import and Export
Use a simple utility interface.
Include:

File upload.

Import type.

Field mapping.

Validation results.

Import history.

Export options.
Digital Forms
Display:

Form name.

Form category.

Created by.

Last updated.

Publication status.
Include form builder and submission management.
Service Tickets
Display:

Ticket number.

Subject.

Customer.

Assigned agent.

Priority.

Created date.

Resolution status.
Reports
Use report categories and organized report listings.
Include:

Report name.

Category.

Last generated.

Owner.

View and export actions.
Reports Builder
Provide a structured report-building interface.
Include:

Data source selection.

Field selection.

Filters.

Grouping.

Sorting.

Preview.

Save Report.

Export.
Keep the interface functional and avoid unnecessary visual complexity.
ADMINISTRATION
Master Data
Use a structured configuration interface.
Support categories and configuration records.
Include:

Category navigation.

Search.

Data tables.

Create and edit forms.

Active/inactive states.
Make administrative functions predictable and consistent. 12. STATUS BADGES
Use compact status badges throughout the application.
Suggested treatments:
StatusTreatmentActiveSoft greenCompletedSoft greenApprovedSoft greenPendingSoft amberIn ProgressSoft blueDraftSoft grayRejectedSoft redOverdueSoft redCancelledSoft grayInactiveSoft gray
Badges should be:

Small.

Rounded.

Easy to scan.

Consistent across modules.
Avoid highly saturated badge backgrounds. 13. DRAWERS, MODALS AND DETAIL VIEWS
Detail Drawers
Use right-side drawers for quick record inspection.
Examples:

Customer details.

Employee details.

Order details.

Approval information.
Recommended width: 420–520px.
Modals
Use modals for:

Confirmations.

Quick forms.

Destructive actions.

Simple selections.
Avoid using modals for complex multi-step workflows.
Full Detail Pages
Use dedicated detail pages for records that require extensive information.
Include:

Page title.

Record identifier.

Status badge.

Action buttons.

Information sections.

Related records.

Activity history. 14. RESPONSIVE DESIGN
Primary target: Desktop web.
Reference viewport: 1440 × 900px.
Support:

1280px desktop.

1440px desktop.

1600px desktop.

Laptop screens.

Tablet screens.
Desktop

Fixed sidebar around 240px.

Full top header.

Main content fills remaining width.

Data tables use available horizontal space.
Tablet

Sidebar can collapse to icon-only mode.

Tables should support horizontal scrolling.

Forms should adapt to one column when necessary.
Mobile
Although desktop is the primary target, ensure essential workflows remain usable.

Use a collapsible navigation drawer.

Stack content vertically.

Allow table cards or horizontal scrolling.

Keep primary actions accessible.

Ensure forms remain usable.
Do not simply shrink the desktop interface. 15. ACCESSIBILITY AND USABILITY
Follow these requirements:

Use accessible contrast.

Maintain visible keyboard focus.

Support keyboard navigation.

Use semantic headings.

Provide accessible labels for icon-only buttons.

Do not communicate status through color alone.

Use appropriate loading indicators.

Confirm destructive actions.

Provide useful error messages.

Maintain consistent interaction patterns.
Prioritize speed and clarity for users performing repetitive ERP tasks. 16. DESIGN CONSISTENCY RULES
These rules apply to every module.

Use the same sidebar across all modules.

Use the same top header across all modules.

Keep page headings consistent.

Reuse the same table components.

Reuse the same form components.

Use the same amber primary action style.

Maintain consistent spacing.

Use consistent iconography.

Use the same status badge system.

Keep breadcrumbs predictable.

Avoid unnecessary cards and containers.

Do not introduce module-specific color themes.

Use white surfaces and neutral backgrounds consistently.

Preserve the user's existing ERP navigation structure.

Make all modules feel like parts of one product. 17. GOOGLE STITCH GENERATION INSTRUCTIONS
Generate a cohesive enterprise web application using this design specification.
IMPORTANT:
The supplied screenshot represents the current Beekeeper ERP layout.
Use it as the structural reference.
Preserve:

Left navigation sidebar.

Organization information section.

Grouped module navigation.

Top header.

Breadcrumbs.

Module tabs.

Search and table toolbar.

Table content area.

Pagination.
Improve:

Overall visual refinement.

Typography hierarchy.

Spacing.

Amber brand identity.

Navigation active states.

Table styling.

Button consistency.

Empty states.

Responsive behavior.
Do not completely redesign the application's information architecture.
Do not turn the application into a marketing website.
Do not use a generic admin dashboard template.
Do not make every section a card.
Do not use excessive gradients, shadows, or illustrations.
Use realistic ERP sample data and business terminology.
The application should feel production-ready.
Initial Screens to Generate
Generate these screens first:

Main Dashboard.

Production — Bills of Materials.

Production — Production Orders.

Visits.

Employee.

Orders.

Inventory.

Billing and Collection.

Approvals.

Master Data.
Ensure all ten screens share the exact same design system and application shell. 18. FINAL DESIGN OBJECTIVE
Transform Beekeeper ERP into a polished modern enterprise application.
The final visual experience should combine:

The minimalist design sensibility of Tarsi.

The usability of a modern SaaS application.

The information architecture of a comprehensive ERP.

A distinctive but restrained amber visual identity.
The result should be clean, professional, efficient, consistent, and comfortable for daily business operations.
Design principle: Less visual noise. Better information hierarchy. Faster workflows.

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Badge** → `@components/badge.html` — `badge-numeric`, `badge-dot`
- **Button** → `@components/button.html` — `button-primary`, `button-icon`, `button-with-icon`
- **Input Field** → `@components/input-field.html` — `input-field-text`, `input-field-icon`
- **Table** → `@components/table.html` — `table-standard`, `table-interactive`, `table-selectable`
- **Tabs** → `@components/tabs.html` — `tabs-horizontal`, `tabs-with-icon`
- **Typography** → `@components/typography.html` — `typography-display`, `typography-body`, `typography-label`
