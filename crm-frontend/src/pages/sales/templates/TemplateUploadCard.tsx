import { Upload, FileText } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { TemplateDocumentType } from "./api"

export type TemplateFormValues = {
  company: number | null
  name: string
  description: string
  document_type: TemplateDocumentType
  mapping: Record<string, string>
  supported_currencies: string[]
  is_active: boolean
  is_default: boolean
  file: File | null
}

type TemplateUploadCardProps = {
  mode: "create" | "edit"
  values: TemplateFormValues
  onChange: (patch: Partial<TemplateFormValues>) => void
  currentFileUrl?: string | null
}

const DOCUMENT_TYPES: TemplateDocumentType[] = [
  "invoice",
  "quotation",
  "proforma",
  "delivery_note",
  "receipt",
]

const CURRENCIES = ["USD", "EUR", "GBP", "TRY", "KES", "UGX", "TZS"]

export default function TemplateUploadCard({
  mode,
  values,
  onChange,
  currentFileUrl,
}: TemplateUploadCardProps) {
  const toggleCurrency = (currency: string) => {
    const exists = values.supported_currencies.includes(currency)
    onChange({
      supported_currencies: exists
        ? values.supported_currencies.filter((c) => c !== currency)
        : [...values.supported_currencies, currency],
    })
  }

  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-slate-50/70">
        <CardTitle>Template setup</CardTitle>
        <CardDescription>
          Upload the template file and configure the basic metadata.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="rounded-xl"
            placeholder="Standard Invoice Template"
          />
        </Field>

        <Field>
          <FieldLabel>Document Type</FieldLabel>
          <select
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
            value={values.document_type}
            onChange={(e) =>
              onChange({ document_type: e.target.value as TemplateDocumentType })
            }
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel>Description</FieldLabel>
          <Textarea
            value={values.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="rounded-2xl"
            rows={4}
            placeholder="Optional description for the template"
          />
        </Field>

        <Field>
          <FieldLabel>Company Id</FieldLabel>
          <Input
            type="number"
            className="rounded-xl"
            value={values.company ?? ""}
            onChange={(e) =>
              onChange({
                company: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
          <FieldDescription>Replace later with active company context.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Template File</FieldLabel>
          <label className="flex h-24 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100">
            <div className="flex flex-col items-center gap-2 text-sm">
              <Upload className="h-5 w-5" />
              <span>{values.file ? values.file.name : "Choose .docx template"}</span>
            </div>
            <input
              type="file"
              accept=".doc,.docx"
              className="hidden"
              onChange={(e) => onChange({ file: e.target.files?.[0] ?? null })}
            />
          </label>
          {mode === "edit" && currentFileUrl ? (
            <a
              href={currentFileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center text-sm text-sky-700 hover:underline"
            >
              <FileText className="mr-1.5 h-4 w-4" />
              Open current file
            </a>
          ) : null}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel>Supported Currencies</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((currency) => {
              const active = values.supported_currencies.includes(currency)
              return (
                <button
                  key={currency}
                  type="button"
                  onClick={() => toggleCurrency(currency)}
                >
                  <Badge
                    className={`rounded-full border px-3 py-1 ${
                      active
                        ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {currency}
                  </Badge>
                </button>
              )
            })}
          </div>
        </Field>

        <Field>
          <FieldLabel>Flags</FieldLabel>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={values.is_active}
                onChange={(e) => onChange({ is_active: e.target.checked })}
              />
              Active template
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={values.is_default}
                onChange={(e) => onChange({ is_default: e.target.checked })}
              />
              Default template
            </label>
          </div>
        </Field>
      </CardContent>
    </Card>
  )
}