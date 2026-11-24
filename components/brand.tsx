import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <path
        d="M16 2.75 27.7 9.5v13L16 29.25 4.3 22.5v-13L16 2.75Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M16 9.4l5.8 3.35v6.7L16 22.8l-5.8-3.35v-6.7L16 9.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function Brand({
  className,
  markClassName,
}: {
  className?: string
  markClassName?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark className={markClassName} />
      <span className="text-sm font-medium tracking-tight">
        Beekeeper<span className="opacity-55"> ERP</span>
      </span>
    </span>
  )
}
