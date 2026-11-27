"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LoaderCircleIcon, PlusIcon, Trash2Icon } from "lucide-react"

import {
  fetchRelationOptions,
  saveAccountWithContacts,
} from "@/app/(app)/entities/actions"
import { EntityForm, initialFormValues } from "@/components/entity-form"
import { Field } from "@/components/form-field"
import { FormError } from "@/components/form-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { EntityConfig, EntityRow } from "@/lib/entities/types"

type Contact = {
  first_name: string
  last_name: string
  title: string
  email: string
  phone: string
  is_primary: boolean
}

const emptyContact = (): Contact => ({
  first_name: "",
  last_name: "",
  title: "",
  email: "",
  phone: "",
  is_primary: false,
})

type AddressInput = {
  address_type: "billing" | "shipping"
  label: string
  line1: string
  line2: string
  barangay: string
  city: string
  province: string
  postal_code: string
  country_code: string
  is_default: boolean
}

const emptyAddress = (address_type: "billing" | "shipping"): AddressInput => ({
  address_type,
  label: "",
  line1: "",
  line2: "",
  barangay: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "PH",
  is_default: true,
})

export function AccountFormPage({
  config,
  initialRow,
}: {
  config: EntityConfig
  initialRow?: EntityRow | null
}) {
  const router = useRouter()
  const [values, setValues] = React.useState<Record<string, unknown>>(
    initialFormValues(config, initialRow ?? null)
  )
  const [relationOptions, setRelationOptions] = React.useState<
    Record<string, { value: string; label: string }[]>
  >({})
  const [contacts, setContacts] = React.useState<Contact[]>([emptyContact()])
  const [addresses, setAddresses] = React.useState({
    billing: emptyAddress("billing"),
    shipping: emptyAddress("shipping"),
  })
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    const relationFields = config.fields.filter(
      (field) => field.type === "relation" && !field.searchable
    )
    if (!relationFields.length) return
    startTransition(async () => {
      toast.loading("Loading form options...", { id: "account-options" })
      const results = await Promise.all(
        relationFields.map((field) => fetchRelationOptions(config.key, field.name))
      )
      toast.dismiss("account-options")
      setRelationOptions(
        Object.fromEntries(
          relationFields.map((field, index) => [field.name, results[index].options ?? []])
        )
      )
    })
  }, [config])

  function updateContact(index: number, key: keyof Contact, value: string | boolean) {
    setContacts((current) =>
      current.map((contact, position) =>
        position === index ? { ...contact, [key]: value } : contact
      )
    )
  }

  function updateAddress(
    kind: "billing" | "shipping",
    key: keyof AddressInput,
    value: string | boolean
  ) {
    setAddresses((current) => ({
      ...current,
      [kind]: { ...current[kind], [key]: value },
    }))
  }

  function save() {
    startTransition(async () => {
      toast.loading("Saving account...", { id: "account-save" })
      try {
        const result = await saveAccountWithContacts(values, contacts, [
          addresses.billing,
          addresses.shipping,
        ])
        toast.dismiss("account-save")
        if (!result.ok) {
          toast.error(result.error ?? "Could not save this account.")
          setError(result.error ?? "Could not save this account.")
          return
        }
        toast.success("Account saved.")
        router.push("/accounts")
        router.refresh()
      } catch (caught) {
        toast.dismiss("account-save")
        const message =
          caught instanceof Error ? caught.message : "Could not save this account."
        toast.error(message)
        setError(message)
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">New Account</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Add the account details and any contacts that belong to it.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {error ? <FormError message={error} className="mt-4" /> : null}

      <div className="mt-6 space-y-5">
        <section className="overflow-hidden rounded-lg border bg-card">
          <header className="border-b bg-muted/20 px-5 py-3">
            <h2 className="text-xs font-medium">Account details</h2>
          </header>
          <div className="p-5">
            <EntityForm
              config={config}
              values={values}
              relationOptions={relationOptions}
              fullPage
              onChange={(name, value) =>
                setValues((current) => ({ ...current, [name]: value }))
              }
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border bg-card">
          <header className="flex items-center justify-between gap-3 border-b bg-muted/20 px-5 py-3">
            <div>
              <h2 className="text-xs font-medium">Contacts</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Add as many contacts as this account needs.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setContacts((current) => [...current, emptyContact()])}
            >
              <PlusIcon />
              Add contact
            </Button>
          </header>

          <div className="flex flex-col gap-4 p-5">
            {contacts.map((contact, index) => (
              <div key={index} className="grid gap-4 rounded-md border p-4 sm:grid-cols-3">
                <Field id={`contact-first-${index}`} label="First name">
                  <Input
                    id={`contact-first-${index}`}
                    value={contact.first_name}
                    onChange={(event) => updateContact(index, "first_name", event.target.value)}
                    placeholder="First name"
                  />
                </Field>
                <Field id={`contact-last-${index}`} label="Last name">
                  <Input
                    id={`contact-last-${index}`}
                    value={contact.last_name}
                    onChange={(event) => updateContact(index, "last_name", event.target.value)}
                    placeholder="Last name"
                  />
                </Field>
                <Field id={`contact-title-${index}`} label="Title">
                  <Input
                    id={`contact-title-${index}`}
                    value={contact.title}
                    onChange={(event) => updateContact(index, "title", event.target.value)}
                    placeholder="Job title"
                  />
                </Field>
                <Field id={`contact-email-${index}`} label="Email">
                  <Input
                    id={`contact-email-${index}`}
                    type="email"
                    value={contact.email}
                    onChange={(event) => updateContact(index, "email", event.target.value)}
                    placeholder="name@example.com"
                  />
                </Field>
                <Field id={`contact-phone-${index}`} label="Phone">
                  <Input
                    id={`contact-phone-${index}`}
                    value={contact.phone}
                    onChange={(event) => updateContact(index, "phone", event.target.value)}
                    placeholder="Phone number"
                  />
                </Field>
                <div className="flex items-end justify-between gap-3">
                  <label className="flex items-center gap-2 pb-2 text-xs">
                    <input
                      type="checkbox"
                      checked={contact.is_primary}
                      onChange={(event) => updateContact(index, "is_primary", event.target.checked)}
                      className="size-3.5 accent-[var(--primary)]"
                    />
                    Primary contact
                  </label>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setContacts((current) => current.filter((_, position) => position !== index))
                    }
                    aria-label={`Remove contact ${index + 1}`}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {(["billing", "shipping"] as const).map((kind) => {
          const address = addresses[kind]
          const title = kind === "billing" ? "Billing address" : "Shipping address"
          return (
            <section key={kind} className="overflow-hidden rounded-lg border bg-card">
              <header className="border-b bg-muted/20 px-5 py-3">
                <h2 className="text-xs font-medium">{title}</h2>
              </header>
              <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field id={`${kind}-label`} label="Label">
                  <Input
                    id={`${kind}-label`}
                    value={address.label}
                    onChange={(event) => updateAddress(kind, "label", event.target.value)}
                    placeholder="Head Office"
                  />
                </Field>
                <Field id={`${kind}-line1`} label="Address line 1">
                  <Input
                    id={`${kind}-line1`}
                    value={address.line1}
                    onChange={(event) => updateAddress(kind, "line1", event.target.value)}
                    placeholder="Street address"
                  />
                </Field>
                <Field id={`${kind}-line2`} label="Address line 2">
                  <Input
                    id={`${kind}-line2`}
                    value={address.line2}
                    onChange={(event) => updateAddress(kind, "line2", event.target.value)}
                    placeholder="Unit, floor, building"
                  />
                </Field>
                <Field id={`${kind}-barangay`} label="Barangay">
                  <Input
                    id={`${kind}-barangay`}
                    value={address.barangay}
                    onChange={(event) => updateAddress(kind, "barangay", event.target.value)}
                  />
                </Field>
                <Field id={`${kind}-city`} label="City">
                  <Input
                    id={`${kind}-city`}
                    value={address.city}
                    onChange={(event) => updateAddress(kind, "city", event.target.value)}
                  />
                </Field>
                <Field id={`${kind}-province`} label="Province">
                  <Input
                    id={`${kind}-province`}
                    value={address.province}
                    onChange={(event) => updateAddress(kind, "province", event.target.value)}
                  />
                </Field>
                <Field id={`${kind}-postal`} label="Postal code">
                  <Input
                    id={`${kind}-postal`}
                    value={address.postal_code}
                    onChange={(event) => updateAddress(kind, "postal_code", event.target.value)}
                  />
                </Field>
                <Field id={`${kind}-country`} label="Country code">
                  <Input
                    id={`${kind}-country`}
                    value={address.country_code}
                    maxLength={2}
                    onChange={(event) => updateAddress(kind, "country_code", event.target.value)}
                  />
                </Field>
                <label className="flex items-center gap-2 pb-2 text-xs lg:self-end">
                  <input
                    type="checkbox"
                    checked={address.is_default}
                    onChange={(event) => updateAddress(kind, "is_default", event.target.checked)}
                    className="size-3.5 accent-[var(--primary)]"
                  />
                  Default address
                </label>
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end gap-2 rounded-lg border bg-card p-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button size="sm" onClick={save} disabled={pending}>
          {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
          Save account
        </Button>
      </div>
    </div>
  )
}
