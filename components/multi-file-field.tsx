"use client"

import * as React from "react"
import { toast } from "sonner"

import { Field } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

/** Stores an array of object paths as a JSON string; the server mirrors them into attachments. */
export function MultiFileField({
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

  let paths: string[] = []
  try {
    const parsed: unknown = JSON.parse(value || "[]")
    if (Array.isArray(parsed)) paths = parsed.filter((item): item is string => typeof item === "string")
  } catch {
    paths = []
  }

  async function upload(files: File[]) {
    setBusy(true)
    const uploaded: string[] = []
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any
      const { data: orgId, error: orgError } = await supabase.rpc("current_org_id")
      if (orgError) throw new Error(orgError.message)
      if (!orgId) throw new Error("No organization is selected.")

      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_")
        const path = `${orgId}/${entityKey}/${crypto.randomUUID()}-${safeName}`
        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: false })
        if (error) throw new Error(error.message)
        uploaded.push(path)
      }

      onChange(JSON.stringify([...paths, ...uploaded]))
      toast.success("File attached.")
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not attach the file.")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  async function openFile(path: string) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600)
      if (error) throw new Error(error.message)
      if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer")
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not open the file.")
    }
  }

  return (
    <Field id={id} label={label} hint={hint} className="sm:col-span-2">
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length) void upload(files)
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
          {busy ? "Uploading..." : "Add attachment"}
        </Button>
        {paths.map((path) => (
          <span key={path} className="flex items-center gap-1 rounded border px-2 py-1 text-xs">
            <button
              type="button"
              onClick={() => void openFile(path)}
              className="max-w-[160px] truncate text-primary underline"
              title={path.split("/").pop() ?? path}
            >
              {path.split("/").pop() ?? path}
            </button>
            <button
              type="button"
              onClick={() => onChange(JSON.stringify(paths.filter((item) => item !== path)))}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remove attachment"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </Field>
  )
}
