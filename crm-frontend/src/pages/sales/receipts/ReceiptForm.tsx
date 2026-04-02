import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { listInvoices, listReceiptTemplates, type Invoice, type Receipt, type ReceiptStatus, type Template } from "./api"

export const receiptFormSchema = z.object({
  companyId: z.coerce.number().min(1, "Company is required"),
  invoice: z.coerce.number().min(1, "Invoice is required"),
  receipt_number: z.string().min(1, "Receipt number is required"),
  amount_paid: z.string().min(1, "Amount paid is required"),
  currency: z.string().optional(),
  selected_template: z.coerce.number().nullable().optional(),
  status: z.enum(["issued", "cancelled"]),
})

export type ReceiptFormValues = z.infer<typeof receiptFormSchema>

function makeReceiptNumber() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const random = Math.floor(Math.random() * 900 + 100)
  return `REC-${y}${m}${d}-${random}`
}

type ReceiptFormProps = {
  mode: "create" | "edit"
  initialValues?: Partial<ReceiptFormValues>
  initialReceipt?: Receipt | null
  onSubmit: (values: ReceiptFormValues) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export default function ReceiptForm({
  mode,
  initialValues,
  initialReceipt,
  onSubmit,
  onCancel,
  submitLabel,
}: ReceiptFormProps) {
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      companyId: initialValues?.companyId ?? 1,
      invoice: initialValues?.invoice ?? 0,
      receipt_number: initialValues?.receipt_number ?? makeReceiptNumber(),
      amount_paid: initialValues?.amount_paid ?? "",
      currency: initialValues?.currency ?? "USD",
      selected_template: initialValues?.selected_template ?? null,
      status: initialValues?.status ?? "issued",
    },
  })

  React.useEffect(() => {
    const run = async () => {
      const [invoicesRes, templatesRes] = await Promise.all([
        listInvoices(),
        listReceiptTemplates(),
      ])
      setInvoices(invoicesRes.results)
      setTemplates(templatesRes.results)
    }
    run()
  }, [])

  const handleSubmit = async (values: ReceiptFormValues) => {
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save receipt.")
    }
  }

  const selectedStatus = form.watch("status")

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        {submitError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/70">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Receipt workspace</CardTitle>
                <CardDescription>Create or update receipts linked to invoices.</CardDescription>
              </div>
              <Badge className="rounded-full border bg-slate-100 text-slate-700">
                {selectedStatus}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <Controller
              name="receipt_number"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Receipt Number</FieldLabel>
                  <div className="flex gap-2">
                    <Input {...field} className="rounded-xl" />
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => form.setValue("receipt_number", makeReceiptNumber())}>
                      Generate
                    </Button>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <select
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="issued">issued</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </Field>
              )}
            />

            <Controller
              name="invoice"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Invoice</FieldLabel>
                  <select
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    <option value="">Select invoice</option>
                    {invoices.map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number}
                      </option>
                    ))}
                  </select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="amount_paid"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Amount Paid</FieldLabel>
                  <Input {...field} type="number" step="0.01" className="rounded-xl" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="currency"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Currency</FieldLabel>
                  <Input {...field} className="rounded-xl" />
                </Field>
              )}
            />

            <Controller
              name="selected_template"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Template</FieldLabel>
                  <select
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">No template selected</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            />

            <Controller
              name="companyId"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Company Id</FieldLabel>
                  <Input
                    {...field}
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="rounded-xl"
                  />
                  <FieldDescription>Replace later with company context.</FieldDescription>
                </Field>
              )}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Receipt summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mode</span>
              <span>{mode}</span>
            </div>
            {initialReceipt ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created</span>
                <span>{new Date(initialReceipt.created_at).toLocaleString()}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button type="submit" className="h-11 rounded-2xl">
            {submitLabel ?? (mode === "create" ? "Create Receipt" : "Save Changes")}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" className="h-11 rounded-2xl" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  )
}