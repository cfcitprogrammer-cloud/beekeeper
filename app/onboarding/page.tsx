import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { signOut } from "@/app/(auth)/actions"
import { AuthShell } from "@/components/auth-shell"
import { Brand } from "@/components/brand"
import { requireSession } from "@/lib/auth"
import { OnboardingForm } from "./onboarding-form"

export const metadata: Metadata = { title: "Create your organization" }

const CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "QAR",
  "KWD",
  "EGP",
  "INR",
  "PKR",
  "BDT",
  "LKR",
  "NGN",
  "KES",
  "ZAR",
  "GHS",
  "MAD",
  "TRY",
  "IDR",
  "MYR",
  "SGD",
  "PHP",
  "VND",
  "THB",
  "AUD",
  "NZD",
  "CAD",
  "BRL",
  "MXN",
]

const REGION_ORDER = [
  "UTC",
  "Africa",
  "America",
  "Antarctica",
  "Asia",
  "Atlantic",
  "Australia",
  "Europe",
  "Indian",
  "Pacific",
]

function buildTimezones() {
  const supportedValuesOf = (
    Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
  ).supportedValuesOf
  const zones = supportedValuesOf?.("timeZone") ?? []

  if (!zones.includes("UTC")) zones.unshift("UTC")

  const groups = new Map<string, string[]>()
  for (const zone of zones) {
    const region = zone.includes("/") ? zone.split("/")[0] : "UTC"
    const list = groups.get(region) ?? []
    list.push(zone)
    groups.set(region, list)
  }

  return Array.from(groups.entries())
    .map(([region, groupZones]) => ({
      region,
      zones: groupZones.sort((a, b) => a.localeCompare(b)),
    }))
    .sort(
      (a, b) =>
        (REGION_ORDER.indexOf(a.region) + 1 || 99) -
        (REGION_ORDER.indexOf(b.region) + 1 || 99),
    )
}

function buildCurrencies() {
  const displayNames = new Intl.DisplayNames(["en"], { type: "currency" })
  return CURRENCY_CODES.map((code) => ({
    code,
    label: displayNames.of(code) ?? code,
  }))
}

const STARTING_POINTS = [
  "Administrator role with every permission",
  "6 pipeline stages and 34 starter lookups",
  "3 leave types, 6 expense categories, 4 units of measure",
  "Main warehouse, default price list, shift and territory",
]

function OnboardingPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[oklch(0.235_0.035_55)] px-10 py-9 text-[oklch(0.96_0.015_85)] lg:flex lg:flex-col lg:justify-between">
      <Brand className="text-[oklch(0.96_0.015_85)]" />

      <div className="max-w-sm py-10">
        <h2 className="text-[1.65rem] leading-[1.18] font-medium tracking-[-0.02em] text-balance">
          Start with a real workspace, not an empty shell.
        </h2>
        <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-[oklch(0.8_0.03_80)]">
          Beekeeper seeds the reference data your first outlet, employee and product need
          to land in.
        </p>
      </div>

      <div>
        <p className="text-[10px] font-medium tracking-[0.16em] text-[oklch(0.75_0.05_75)] uppercase">
          Created with your organization
        </p>
        <ul className="mt-4 space-y-2.5">
          {STARTING_POINTS.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-sm leading-snug text-[oklch(0.9_0.02_85)]"
            >
              <span className="mt-1.5 size-[7px] shrink-0 rounded-full bg-[oklch(0.79_0.14_70)]" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="mt-7 border-t border-[oklch(0.36_0.04_60)] pt-4 text-[11px] leading-relaxed text-[oklch(0.75_0.04_78)]">
          You become the first Administrator of this workspace.
        </p>
      </div>
    </aside>
  )
}

export default async function OnboardingPage() {
  const session = await requireSession()
  if (session.profile.org_id) {
    redirect("/dashboard")
  }

  return (
    <AuthShell panel={<OnboardingPanel />}>
      <div className="mb-7">
        <h1 className="text-xl font-medium tracking-[-0.02em]">Name your organization</h1>
        <p className="mt-1.5 max-w-[44ch] text-xs leading-relaxed text-muted-foreground">
          This becomes the workspace your team signs in to. You can change the name later
          from Administration.
        </p>
      </div>

      <OnboardingForm timezones={buildTimezones()} currencies={buildCurrencies()} />

      <div className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        Signed in as <span className="text-foreground">{session.profile.email}</span>.{" "}
        <form action={signOut} className="inline">
          <button
            type="submit"
            className="underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-foreground"
          >
            Use a different account
          </button>
        </form>
        .
      </div>
    </AuthShell>
  )
}
