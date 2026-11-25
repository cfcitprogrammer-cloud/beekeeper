import { notFound, redirect } from "next/navigation"

import { EmployeeFormPage } from "@/components/employee-form-page"
import { requireOrganization } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"
import { getEntityRow } from "@/lib/entities/server"

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireOrganization()
  if (!session.can("employees", "update")) redirect("/")

  const { id } = await params
  const config = getEntity("employees")
  if (!config) notFound()

  const { row, error } = await getEntityRow(session, "employees", id)
  if (error || !row) notFound()

  return <EmployeeFormPage config={config} employeeId={id} initialRow={row} />
}