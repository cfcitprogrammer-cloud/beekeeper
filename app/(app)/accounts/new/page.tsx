import { notFound, redirect } from "next/navigation"

import { AccountFormPage } from "@/components/account-form-page"
import { requireOrganization } from "@/lib/auth"
import { getEntity } from "@/lib/entities/registry"

export default async function NewAccountPage() {
  const session = await requireOrganization()
  if (!session.can("accounts", "create")) redirect("/")

  const config = getEntity("accounts")
  if (!config) notFound()

  return <AccountFormPage config={config} />
}
