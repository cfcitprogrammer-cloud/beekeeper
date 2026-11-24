"use client"

import * as React from "react"
import { LoaderCircleIcon } from "lucide-react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

export function SubmitButton({
  children,
  pendingLabel,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  pendingLabel?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      {...props}
      type="submit"
      className={className}
      disabled={pending || props.disabled}
    >
      {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  )
}
