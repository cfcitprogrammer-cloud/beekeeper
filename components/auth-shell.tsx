import type * as React from "react"

import { Brand } from "@/components/brand"
import { cn } from "@/lib/utils"

const CHAIN = [
  "Visit checked in",
  "Order taken",
  "Stock reserved",
  "Invoice issued",
  "Payment collected",
]

export function LedgerPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[oklch(0.235_0.035_55)] px-10 py-9 text-[oklch(0.96_0.015_85)] lg:flex lg:flex-col lg:justify-between">
      <div className="relative">
        <Brand className="text-[oklch(0.96_0.015_85)]" />
      </div>

      <div className="relative max-w-sm py-10">
        <h2 className="text-[1.65rem] leading-[1.18] font-medium tracking-[-0.02em] text-balance">
          Field work and back-office records, on one ledger.
        </h2>
        <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-[oklch(0.8_0.03_80)]">
          A visit, its order, the stock it moves and the payment it earns stay tied to the
          same outlet, employee and product.
        </p>
      </div>

      <div className="relative">
        <p className="text-[10px] font-medium tracking-[0.16em] text-[oklch(0.75_0.05_75)] uppercase">
          One record, end to end
        </p>
        <ol className="relative mt-4 space-y-3">
          <span
            aria-hidden="true"
            className="absolute top-1.5 bottom-1.5 left-[3px] w-px bg-[oklch(0.42_0.05_62)]"
          />
          {CHAIN.map((step) => (
            <li key={step} className="relative flex items-center gap-3 text-sm">
              <span className="relative z-10 size-[7px] shrink-0 rounded-full bg-[oklch(0.79_0.14_70)] ring-4 ring-[oklch(0.235_0.035_55)]" />
              <span className="text-[oklch(0.9_0.02_85)]">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-7 border-t border-[oklch(0.36_0.04_60)] pt-4 text-[11px] leading-relaxed text-[oklch(0.75_0.04_78)]">
          Every row is scoped to your organization by row-level security.
        </p>
      </div>
    </aside>
  )
}

export function AuthShell({
  children,
  panel,
  className,
}: {
  children: React.ReactNode
  panel?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "min-h-svh lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]",
        className,
      )}
    >
      {panel ?? <LedgerPanel />}
      <main className="flex min-h-svh flex-col">
        <div className="flex items-center border-b px-5 py-4 lg:hidden">
          <Brand />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="px-5 pb-6 text-center text-[10px] tracking-wide text-muted-foreground lg:px-8">
          Beekeeper ERP · every record scoped to your organization
        </p>
      </main>
    </div>
  )
}
