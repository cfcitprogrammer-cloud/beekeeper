import { notFound, redirect } from "next/navigation"

import { EmployeeFormPage } from "@/components/employee-form-page"
import { requireOrganization } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"

export default async function NewEmployeePage() {
  const session = await requireOrganization()
  if (!session.can("employees", "create")) redirect("/")

  const config = getEntity("employees")
  if (!config) notFound()

  return <EmployeeFormPage config={config} />
}