"use client"

import * as React from "react"
import { toast } from "sonner"

import { Field } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

/**
 * Uploads a file to a Supabase bucket and stores its object path on the entity.
 * Objects follow the tenant convention `<org_id>/<entity>/<file>` so the
 * storage RLS policies in 20261124091600_storage.sql apply.
 */
export function FileField({
  id,
  label,
  hint,
  value,
  bucket,
  entityKey,
  onChange,
}: {
  id: string
  label: string
  hint?: string
  value: string
  bucket: string
  entityKey: string
  onChange: (value: string) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [busy, setBusy] = React.useState(false)

  const fileName = value ? value.split("/").pop() ?? value : ""

  async function upload(file: File) {
    setBusy(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any
      const { data: orgId, error: orgError } = await supabase.rpc("current_org_id")
      if (orgError) throw new Error(orgError.message)
      if (!orgId) throw new Error("No organization is selected.")

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_")
      const path = `${orgId}/${entityKey}/${crypto.randomUUID()}-${safeName}`
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false })
      if (error) throw new Error(error.message)

      onChange(path)
      toast.success("File uploaded.")
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not upload the file."
      toast.error(message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function openFile() {
    if (!value) return
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(value, 3600)
      if (error) throw new Error(error.message)
      if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer")
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not open the file.")
    }
  }

  return (
    <Field id={id} label={label} hint={hint}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Uploading..." : value ? "Replace file" : "Choose file"}
        </Button>
        {value ? (
          <>
            <button
              type="button"
              onClick={() => void openFile()}
              className="max-w-[180px] truncate text-xs text-primary underline"
              title={fileName}
            >
              {fileName}
            </button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
            >
              Remove
            </Button>
          </>
        ) : null}
      </div>
    </Field>
  )
}
