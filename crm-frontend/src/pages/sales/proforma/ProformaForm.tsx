import * as React from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import SearchSelect from "../shared-components/SearchSelect"
import DocumentLineItemsEditor from "@/shared/DocumentLineItemsEditor"
import {
  listCustomers,
  listProducts,
  listProformaTemplates,
  listQuotations,
  type Customer,
  type Proforma,
  type ProformaStatus,
  type Quotation,
  type Template,
} from "./api"

export const proformaFormSchema = z.object({
  companyId: z.coerce.number().min(1, "Company is required"),
  quotation: z.coerce.number().nullable().optional(),
  customer: z.coerce.number().nullable().optional(),
  proforma_number: z.string().optional(),
  currency: z.string().optional(),
  selected_template: z.coerce.number().nullable().optional(),
  status: z.enum(["draft", "sent", "paid", "cancelled"]),
  issue_date: z.string().optional(),
  valid_until: z.string().optional(),
  tax_mode: z.enum(["exclusive", "inclusive"]),
  tax_label: z.string().min(1, "Tax label is required"),
  tax_rate: z.string().min(1, "Tax rate is required"),
  lines: z
    .array(
      z.object({
        id: z.number().optional(),
        product: z.coerce.number().nullable().optional(),
        description: z.string().min(1, "Line description is required"),
        quantity: z.string().min(1, "Quantity is required"),
        unit_price: z.string().min(1, "Unit price is required"),
      })
    )
    .min(1, "Add at least one line"),
})

export type ProformaFormValues = z.infer<typeof proformaFormSchema>

function statusTone(status: ProformaStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700"
    case "sent":
      return "bg-sky-50 text-sky-700"
    case "cancelled":
      return "bg-zinc-100 text-zinc-700"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

function money(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00"
}

type ProformaFormProps = {
  mode: "create" | "edit"
  initialValues?: Partial<ProformaFormValues>
  initialProforma?: Proforma | null
  onSubmit: (values: ProformaFormValues, removedLineIds: number[]) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export default function ProformaForm({
  mode,
  initialValues,
  initialProforma,
  onSubmit,
  onCancel,
  submitLabel,
}: ProformaFormProps) {
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [removedLineIds, setRemovedLineIds] = React.useState<number[]>([])

  const [quotationSearchOpen, setQuotationSearchOpen] = React.useState(false)
  const [quotationSearch, setQuotationSearch] = React.useState("")
  const [quotationResults, setQuotationResults] = React.useState<Quotation[]>([])
  const [quotationLoading, setQuotationLoading] = React.useState(false)
  const [quotationLoadingMore, setQuotationLoadingMore] = React.useState(false)
  const [quotationHasMore, setQuotationHasMore] = React.useState(false)
  const [quotationOffset, setQuotationOffset] = React.useState(0)

  const [customerSearchOpen, setCustomerSearchOpen] = React.useState(false)
  const [customerSearch, setCustomerSearch] = React.useState("")
  const [customerResults, setCustomerResults] = React.useState<Customer[]>([])
  const [customerLoading, setCustomerLoading] = React.useState(false)
  const [customerLoadingMore, setCustomerLoadingMore] = React.useState(false)
  const [customerHasMore, setCustomerHasMore] = React.useState(false)
  const [customerOffset, setCustomerOffset] = React.useState(0)

  const form = useForm<ProformaFormValues>({
    resolver: zodResolver(proformaFormSchema),
    defaultValues: {
      companyId: initialValues?.companyId ?? 1,
      quotation: initialValues?.quotation ?? null,
      customer: initialValues?.customer ?? null,
      proforma_number: initialValues?.proforma_number ?? "",
      currency: initialValues?.currency ?? "USD",
      selected_template: initialValues?.selected_template ?? null,
      status: initialValues?.status ?? "draft",
      issue_date: initialValues?.issue_date ?? "",
      valid_until: initialValues?.valid_until ?? "",
      tax_mode: initialValues?.tax_mode ?? "exclusive",
      tax_label: initialValues?.tax_label ?? "VAT",
      tax_rate: initialValues?.tax_rate ?? "0.00",
      lines:
        initialValues?.lines ?? [
          { product: null, description: "", quantity: "1", unit_price: "0.00" },
        ],
    },
  })

  const { control } = form
  const { fields, append, remove } = useFieldArray({ control, name: "lines" })
  const companyId = form.watch("companyId")
  const selectedStatus = form.watch("status")
  const selectedQuotationId = form.watch("quotation")
  const selectedCustomerId = form.watch("customer")
  const lines = form.watch("lines")
  const taxMode = form.watch("tax_mode")
  const taxRateValue = Number(form.watch("tax_rate") || 0)

  React.useEffect(() => {
    if (!companyId || !Number.isFinite(Number(companyId)) || Number(companyId) <= 0) {
      setTemplates([])
      return
    }

    const run = async () => {
      try {
        const templatesRes = await listProformaTemplates({ company: companyId })
        setTemplates(templatesRes.results)
      } catch (error) {
        console.error(error)
      }
    }

    void run()
  }, [companyId])

  const loadQuotations = React.useCallback(
    async (search: string, offset: number, appendResults: boolean) => {
      if (!companyId || !Number.isFinite(Number(companyId)) || Number(companyId) <= 0) {
        setQuotationResults([])
        setQuotationHasMore(false)
        return
      }

      try {
        if (appendResults) setQuotationLoadingMore(true)
        else setQuotationLoading(true)

        const data = await listQuotations({ company: companyId, search, offset, limit: 8 })
        setQuotationResults((prev) =>
          appendResults
            ? [...prev, ...data.results.filter((item) => !prev.some((x) => x.id === item.id))]
            : data.results
        )
        setQuotationOffset(offset + data.results.length)
        setQuotationHasMore(Boolean(data.next))
      } catch (error) {
        console.error(error)
      } finally {
        if (appendResults) setQuotationLoadingMore(false)
        else setQuotationLoading(false)
      }
    },
    [companyId]
  )

  const loadCustomers = React.useCallback(
    async (search: string, offset: number, appendResults: boolean) => {
      if (!companyId || !Number.isFinite(Number(companyId)) || Number(companyId) <= 0) {
        setCustomerResults([])
        setCustomerHasMore(false)
        return
      }

      try {
        if (appendResults) setCustomerLoadingMore(true)
        else setCustomerLoading(true)

        const data = await listCustomers({ company: companyId, search, offset, limit: 8 })
        setCustomerResults((prev) =>
          appendResults
            ? [...prev, ...data.results.filter((item) => !prev.some((x) => x.id === item.id))]
            : data.results
        )
        setCustomerOffset(offset + data.results.length)
        setCustomerHasMore(Boolean(data.next))
      } catch (error) {
        console.error(error)
      } finally {
        if (appendResults) setCustomerLoadingMore(false)
        else setCustomerLoading(false)
      }
    },
    [companyId]
  )

  React.useEffect(() => {
    if (!companyId || !Number.isFinite(Number(companyId)) || Number(companyId) <= 0) {
      setQuotationResults([])
      setQuotationHasMore(false)
      return
    }

    const timeout = window.setTimeout(() => {
      void loadQuotations(quotationSearch, 0, false)
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [companyId, loadQuotations, quotationSearch])

  React.useEffect(() => {
    if (!companyId || !Number.isFinite(Number(companyId)) || Number(companyId) <= 0) {
      setCustomerResults([])
      setCustomerHasMore(false)
      return
    }

    const timeout = window.setTimeout(() => {
      void loadCustomers(customerSearch, 0, false)
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [companyId, customerSearch, loadCustomers])

  const selectedQuotation =
    quotationResults.find((item) => item.id === selectedQuotationId) ?? null
  const selectedCustomer =
    customerResults.find((item) => item.id === selectedCustomerId) ?? null

  const linesTotal = lines.reduce(
    (sum, line) => sum + Number(line.quantity || 0) * Number(line.unit_price || 0),
    0
  )
  const taxRateFraction = taxRateValue / 100
  const totals = React.useMemo(() => {
    if (taxMode === "inclusive") {
      const subtotal = taxRateFraction > 0 ? linesTotal / (1 + taxRateFraction) : linesTotal
      const taxTotal = linesTotal - subtotal
      return { subtotal, taxTotal, grandTotal: linesTotal }
    }

    const subtotal = linesTotal
    const taxTotal = subtotal * taxRateFraction
    return { subtotal, taxTotal, grandTotal: subtotal + taxTotal }
  }, [linesTotal, taxMode, taxRateFraction])

  const removeLine = (index: number) => {
    const line = form.getValues(`lines.${index}`)
    if (line?.id) setRemovedLineIds((prev) => [...prev, line.id!])
    remove(index)
  }

  const handleSubmit = async (values: ProformaFormValues) => {
    setSubmitError(null)
    try {
      await onSubmit(values, removedLineIds)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save proforma.")
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
          <h2 className="text-lg font-semibold text-slate-900">Proforma</h2>
          <Badge className={`rounded-full px-3 py-1 capitalize ${statusTone(selectedStatus)}`}>
            {selectedStatus}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field>
            <FieldLabel>Quotation</FieldLabel>
            <SearchSelect<Quotation>
              valueLabel={
                selectedQuotation?.quote_number ??
                (selectedQuotationId ? `Quotation #${selectedQuotationId}` : null)
              }
              placeholder="Search quotation..."
              searchPlaceholder="Search quotations..."
              items={quotationResults}
              open={quotationSearchOpen}
              loading={quotationLoading}
              loadingMore={quotationLoadingMore}
              hasMore={quotationHasMore}
              onOpenChange={setQuotationSearchOpen}
              onSearch={setQuotationSearch}
              onLoadMore={() => void loadQuotations(quotationSearch, quotationOffset, true)}
              onSelect={(quotation) => {
                form.setValue("quotation", quotation.id)
                form.setValue("customer", quotation.customer ?? null)
                setQuotationResults((prev) =>
                  prev.some((item) => item.id === quotation.id) ? prev : [quotation, ...prev]
                )
              }}
              getKey={(item) => item.id}
              getLabel={(item) => item.quote_number || `Quotation #${item.id}`}
              getDescription={(item) => item.name || item.total}
            />
          </Field>

          <Field>
            <FieldLabel>Customer</FieldLabel>
            <SearchSelect<Customer>
              valueLabel={
                selectedCustomer?.name ??
                (selectedCustomerId ? `Customer #${selectedCustomerId}` : null)
              }
              placeholder="Search customer..."
              searchPlaceholder="Search customers..."
              items={customerResults}
              open={customerSearchOpen}
              loading={customerLoading}
              loadingMore={customerLoadingMore}
              hasMore={customerHasMore}
              onOpenChange={setCustomerSearchOpen}
              onSearch={setCustomerSearch}
              onLoadMore={() => void loadCustomers(customerSearch, customerOffset, true)}
              onSelect={(customer) => {
                form.setValue("customer", customer.id)
                setCustomerResults((prev) =>
                  prev.some((item) => item.id === customer.id) ? prev : [customer, ...prev]
                )
              }}
              getKey={(item) => item.id}
              getLabel={(item) => item.name}
              getDescription={(item) => item.email || item.phone_number}
            />
          </Field>

          <Controller
            name="proforma_number"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Proforma number</FieldLabel>
                <Input {...field} value={field.value ?? ""} className="rounded-2xl" />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="issue_date"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Issue date</FieldLabel>
                <Input {...field} type="date" className="rounded-2xl" />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="valid_until"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Valid until</FieldLabel>
                <Input {...field} type="date" className="rounded-2xl" />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="currency"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Currency</FieldLabel>
                <Input {...field} className="rounded-2xl" placeholder="USD" />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Status</FieldLabel>
                <select
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="draft">draft</option>
                  <option value="sent">sent</option>
                  <option value="paid">paid</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </Field>
            )}
          />

          <Controller
            name="selected_template"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Template</FieldLabel>
                <select
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Default proforma template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Tax</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            name="tax_mode"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Tax mode</FieldLabel>
                <select
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="exclusive">exclusive</option>
                  <option value="inclusive">inclusive</option>
                </select>
              </Field>
            )}
          />

          <Controller
            name="tax_label"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Tax label</FieldLabel>
                <Input {...field} className="rounded-2xl" placeholder="VAT" />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="tax_rate"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Tax rate (%)</FieldLabel>
                <Input {...field} className="rounded-2xl" placeholder="0.00" />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>
      </section>

      <DocumentLineItemsEditor
        form={form}
        control={control}
        fields={fields}
        appendLine={() =>
          append({ product: null, description: "", quantity: "1", unit_price: "0.00" })
        }
        removeLine={removeLine}
        title="Line items"
        searchProducts={({ search, offset, limit }) =>
          listProducts({ company: companyId, search, offset, limit })
        }
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Totals</h2>
          {initialProforma ? (
            <div className="text-sm text-slate-500">
              Updated {new Date(initialProforma.updated_at).toLocaleString()}
            </div>
          ) : null}
        </div>

        <div className="ml-auto max-w-md space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium text-slate-900">{money(totals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">
              {form.watch("tax_label")} ({form.watch("tax_rate")}%)
            </span>
            <span className="font-medium text-slate-900">{money(totals.taxTotal)}</span>
          </div>
          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-base font-semibold text-slate-900">Total</span>
              <span className="text-xl font-semibold text-slate-900">
                {money(totals.grandTotal)}
              </span>
            </div>
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
          {submitLabel ?? (mode === "create" ? "Create proforma" : "Save changes")}
        </Button>
      </div>
    </form>
  )
}
