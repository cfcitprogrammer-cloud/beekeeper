import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { ChildTable } from "@/components/child-table"
import { PageHeader } from "@/components/panel"
import { PrintButton } from "@/components/print-button"
import { requireOrganization } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"

export const metadata: Metadata = { title: "Employee 201 File" }

function displayValue(raw: unknown) {
  if (raw === null || raw === undefined || raw === "") return "—"
  if (typeof raw === "boolean") return raw ? "Yes" : "No"
  if (typeof raw === "object") return JSON.stringify(raw)
  return String(raw)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="border-b pb-1 text-xs font-semibold tracking-wide uppercase">
        {title}
      </h2>
      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {children}
      </dl>
    </section>
  )
}

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-xs">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{displayValue(value)}</dd>
    </div>
  )
}

export default async function Employee201Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireOrganization()
  if (!session.can("employees", "view")) redirect("/")

  const { id } = await params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = session.supabase as any
  const { data: employee, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .eq("org_id", session.profile.org_id)
    .maybeSingle()

  if (error || !employee) notFound()

  const e = employee as Record<string, unknown>

  const [departmentResult, positionResult, managerResult] = await Promise.all([
    e.department_id
      ? supabase
          .from("departments")
          .select("name")
          .eq("id", e.department_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    e.position_id
      ? supabase
          .from("positions")
          .select("title")
          .eq("id", e.position_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    e.manager_id
      ? supabase
          .from("employees")
          .select("first_name, last_name, employee_no")
          .eq("id", e.manager_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const fullName = [e.first_name, e.middle_name, e.last_name, e.name_suffix]
    .filter(Boolean)
    .join(" ")

  const manager = managerResult?.data as Record<string, unknown> | null
  const educationConfig = getEntity("employee_education")

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8 print:px-0 print:py-0">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <PageHeader
          title="Employee 201 File"
          description="Philippine-compliant employee personnel record."
        />
        <PrintButton />
      </div>

      <article className="mt-6 border bg-card p-6 print:border-0 print:p-0">
        <header className="border-b pb-4">
          <h1 className="text-lg font-semibold">Employee 201 File</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {fullName} · {displayValue(e.employee_no)}
          </p>
        </header>

        <Section title="Personal Information">
          <Field label="Employee No." value={e.employee_no} />
          <Field label="Full Name" value={fullName} />
          <Field label="First Name" value={e.first_name} />
          <Field label="Middle Name" value={e.middle_name} />
          <Field label="Last Name" value={e.last_name} />
          <Field label="Name Suffix" value={e.name_suffix} />
          <Field label="Date of Birth" value={e.date_of_birth} />
          <Field label="Place of Birth" value={e.place_of_birth} />
          <Field label="Sex" value={e.sex} />
          <Field label="Civil Status" value={e.civil_status} />
          <Field label="Nationality" value={e.nationality} />
          <Field label="Religion" value={e.religion} />
          <Field label="Email" value={e.email} />
          <Field label="Phone" value={e.phone} />
        </Section>

        <Section title="Address">
          <Field label="Present Address" value={e.present_address} />
          <Field label="Permanent Address" value={e.permanent_address} />
          <Field label="Barangay" value={e.barangay} />
          <Field label="City / Municipality" value={e.city_municipality} />
          <Field label="Province" value={e.province} />
          <Field label="ZIP Code" value={e.zip_code} />
        </Section>

        <Section title="Government Identifiers">
          <Field label="SSS No." value={e.sss_no} />
          <Field label="PhilHealth No." value={e.philhealth_no} />
          <Field label="Pag-IBIG No." value={e.pagibig_no} />
          <Field label="TIN" value={e.tin} />
          <Field label="UMID No." value={e.umid_no} />
          <Field label="Passport No." value={e.passport_no} />
          <Field label="Driver's License No." value={e.drivers_license_no} />
          <Field label="PRC License No." value={e.prc_license_no} />
        </Section>

        <Section title="Employment Details">
          <Field label="Department" value={departmentResult?.data?.name} />
          <Field label="Position" value={positionResult?.data?.title} />
          <Field
            label="Manager"
            value={manager ? `${manager.first_name} ${manager.last_name}` : null}
          />
          <Field label="Hire Date" value={e.hire_date} />
          <Field label="Regularization Date" value={e.regularization_date} />
          <Field label="Employment Type" value={e.employment_type} />
          <Field label="Status" value={e.status} />
          <Field label="Basic Salary" value={e.basic_salary} />
          <Field label="Pay Frequency" value={e.pay_frequency} />
          <Field label="Bank Name" value={e.bank_name} />
          <Field label="Bank Account No." value={e.bank_account_no} />
          <Field label="Is Field Staff" value={e.is_field_staff} />
          <Field label="Device ID" value={e.device_id} />
        </Section>

        <Section title="Emergency Contact">
          <Field label="Name" value={e.emergency_contact_name} />
          <Field label="Relationship" value={e.emergency_contact_relationship} />
          <Field label="Phone" value={e.emergency_contact_phone} />
          <Field label="Address" value={e.emergency_contact_address} />
        </Section>

      </article>

      {educationConfig ? (
        <ChildTable
          config={educationConfig}
          parentField="employee_id"
          parentId={id}
        />
      ) : null}
    </div>
  )
}