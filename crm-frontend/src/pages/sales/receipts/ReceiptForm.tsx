import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import SearchSelect from "../shared-components/SearchSelect"
import TemplatePicker from "../shared-components/TemplatePicker"
import {
  listInvoices,
  listReceiptTemplates,
  type Invoice,
  type Receipt,
  type ReceiptStatus,
  type Template,
} from "./api"

export const receiptFormSchema = z.object({
  companyId: z.coerce.number().min(1, "Company is required"),
  invoice: z.coerce.number().min(1, "Invoice is required"),
  customer: z.coerce.number().nullable().optional(),
  receipt_number: z.string().optional(),
  amount_paid: z.string().min(1, "Amount paid is required"),
  currency: z.string().optional(),
  selected_template: z.coerce.number().nullable().optional(),
  status: z.enum(["issued", "cancelled"]),
})

export type ReceiptFormValues = z.infer<typeof receiptFormSchema>

type ReceiptFormProps = {
  mode: "create" | "edit"
  companyId: number
  initialValues?: Partial<ReceiptFormValues>
  initialReceipt?: Receipt | null
  onSubmit: (values: ReceiptFormValues) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export default function ReceiptForm({
  mode,
  companyId,
  initialValues,
  initialReceipt,
  onSubmit,
  onCancel,
  submitLabel,
}: ReceiptFormProps) {
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [invoiceSearchOpen, setInvoiceSearchOpen] = React.useState(false)
  const [invoiceSearch, setInvoiceSearch] = React.useState("")
  const [invoiceResults, setInvoiceResults] = React.useState<Invoice[]>([])
  const [invoiceLoading, setInvoiceLoading] = React.useState(false)
  const [invoiceLoadingMore, setInvoiceLoadingMore] = React.useState(false)
  const [invoiceHasMore, setInvoiceHasMore] = React.useState(false)
  const [invoiceOffset, setInvoiceOffset] = React.useState(0)

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      companyId: initialValues?.companyId ?? companyId,
      invoice: initialValues?.invoice ?? 0,
      customer: initialValues?.customer ?? null,
      receipt_number: initialValues?.receipt_number ?? "",
      amount_paid: initialValues?.amount_paid ?? "",
      currency: initialValues?.currency ?? "USD",
      selected_template: initialValues?.selected_template ?? null,
      status: initialValues?.status ?? "issued",
    },
  })

  const selectedStatus = form.watch("status")
  const selectedInvoiceId = form.watch("invoice")
  const watchedCompanyId = form.watch("companyId")

  React.useEffect(() => {
    if (!watchedCompanyId || !Number.isFinite(Number(watchedCompanyId)) || Number(watchedCompanyId) <= 0) {
      setTemplates([])
      return
    }

    const run = async () => {
      const templatesRes = await listReceiptTemplates({ company: watchedCompanyId })
      setTemplates(templatesRes.results)
    }
    void run()
  }, [watchedCompanyId])

  const loadInvoices = React.useCallback(
    async (search: string, offset: number, appendResults: boolean) => {
      if (!watchedCompanyId || !Number.isFinite(Number(watchedCompanyId)) || Number(watchedCompanyId) <= 0) {
        setInvoiceResults([])
        setInvoiceHasMore(false)
        return
      }

      try {
        if (appendResults) setInvoiceLoadingMore(true)
        else setInvoiceLoading(true)

        const data = await listInvoices({
          company: watchedCompanyId,
          search,
          offset,
          limit: 8,
        })

        setInvoiceResults((prev) =>
          appendResults
            ? [...prev, ...data.results.filter((item) => !prev.some((x) => x.id === item.id))]
            : data.results
        )
        setInvoiceOffset(offset + data.results.length)
        setInvoiceHasMore(Boolean(data.next))
      } catch (error) {
        console.error(error)
      } finally {
        if (appendResults) setInvoiceLoadingMore(false)
        else setInvoiceLoading(false)
      }
    },
    [form, watchedCompanyId]
  )

  React.useEffect(() => {
    if (!watchedCompanyId || !Number.isFinite(Number(watchedCompanyId)) || Number(watchedCompanyId) <= 0) {
      setInvoiceResults([])
      setInvoiceHasMore(false)
      return
    }

    const timeout = window.setTimeout(() => {
      void loadInvoices(invoiceSearch, 0, false)
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [invoiceSearch, loadInvoices, watchedCompanyId])

  const selectedInvoice = invoiceResults.find((item) => item.id === selectedInvoiceId) ?? null

  const handleSubmit = async (values: ReceiptFormValues) => {
    setSubmitError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save receipt.")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      {submitError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Receipt</h2>
          <Badge className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 capitalize text-slate-700">
            {selectedStatus}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field>
            <FieldLabel>Invoice</FieldLabel>
            <SearchSelect<Invoice>
              valueLabel={
                selectedInvoice?.invoice_number ??
                (selectedInvoiceId ? `Selected invoice #${selectedInvoiceId}` : null)
              }
              placeholder="Search invoice..."
              searchPlaceholder="Search invoices..."
              items={invoiceResults}
              open={invoiceSearchOpen}
              loading={invoiceLoading}
              loadingMore={invoiceLoadingMore}
              hasMore={invoiceHasMore}
              onOpenChange={setInvoiceSearchOpen}
              onSearch={setInvoiceSearch}
              onLoadMore={() => void loadInvoices(invoiceSearch, invoiceOffset, true)}
              onSelect={(invoice) => {
                form.setValue("invoice", invoice.id)
                form.setValue("customer", invoice.customer ?? null)
                setInvoiceResults((prev) =>
                  prev.some((item) => item.id === invoice.id) ? prev : [invoice, ...prev]
                )
              }}
              getKey={(item) => item.id}
              getLabel={(item) => item.invoice_number}
              getDescription={(item) => item.customer_name || item.total}
            />
            {form.formState.errors.invoice ? (
              <FieldError errors={[form.formState.errors.invoice]} />
            ) : null}
          </Field>

          <Field>
            <FieldLabel>Customer</FieldLabel>
            <div className="flex h-11 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
              {selectedInvoice?.customer_name ?? initialReceipt?.customer_name ?? "Auto-populated from invoice"}
            </div>
          </Field>

          <Controller
            name="receipt_number"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Receipt number</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  className="rounded-2xl"
                  placeholder="Auto-generated if left blank"
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
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
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
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
            name="amount_paid"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Amount paid</FieldLabel>
                <Input {...field} type="number" step="0.01" className="rounded-2xl" />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="currency"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Currency</FieldLabel>
                <Input {...field} className="rounded-2xl" placeholder="USD" />
              </Field>
            )}
          />

          <Controller
            name="selected_template"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Template</FieldLabel>
                <TemplatePicker
                  documentType="receipt"
                  value={field.value}
                  templates={templates}
                  onChange={field.onChange}
                  defaultLabel="Use default receipt template"
                />
              </Field>
            )}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Amount</h2>
          {initialReceipt ? (
            <div className="text-sm text-slate-500">
              Updated {new Date(initialReceipt.updated_at).toLocaleString()}
            </div>
          ) : null}
        </div>

        <div className="ml-auto max-w-md space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Amount paid</span>
            <span className="text-xl font-semibold text-slate-900">
              {form.watch("amount_paid") || "0.00"}
            </span>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" className="rounded-2xl" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" className="rounded-2xl">
          {submitLabel ?? (mode === "create" ? "Create receipt" : "Save changes")}
        </Button>
      </div>
    </form>
  )
}
