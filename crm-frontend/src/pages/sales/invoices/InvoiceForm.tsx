import * as React from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import SearchSelect from "../shared-components/SearchSelect"
import DocumentLineItemsEditor from "@/shared/DocumentLineItemsEditor"
import {
  getProforma,
  getQuotation,
  listCustomers,
  listInvoiceTemplates,
  listProducts,
  listProformas,
  listQuotations,
  type Customer,
  type Invoice,
  type InvoiceStatus,
  type Proforma,
  type Quotation,
  type Template,
} from "./api"

export const invoiceFormSchema = z.object({
  companyId: z.coerce.number().min(1, "Company is required"),
  proforma: z.coerce.number().nullable().optional(),
  quotation: z.coerce.number().nullable().optional(),
  customer: z.coerce.number().nullable().optional(),
  invoice_number: z.string().optional(),
  currency: z.string().optional(),
  selected_template: z.coerce.number().nullable().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
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
    .min(1, "Add at least one invoice line"),
})

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

function statusTone(status: InvoiceStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700"
    case "sent":
      return "bg-sky-50 text-sky-700"
    case "overdue":
      return "bg-rose-50 text-rose-700"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

type InvoiceFormProps = {
  mode: "create" | "edit"
  initialValues?: Partial<InvoiceFormValues>
  initialInvoice?: Invoice | null
  onSubmit: (values: InvoiceFormValues, removedLineIds: number[]) => Promise<void>
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
}

export default function InvoiceForm({
  mode,
  initialValues,
  initialInvoice,
  onSubmit,
  submitLabel,
  cancelLabel = "Cancel",
  onCancel,
}: InvoiceFormProps) {
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [removedLineIds, setRemovedLineIds] = React.useState<number[]>([])

  // Proforma search
  const [proformaSearchOpen, setProformaSearchOpen] = React.useState(false)
  const [proformaSearch, setProformaSearch] = React.useState("")
  const [proformaResults, setProformaResults] = React.useState<Proforma[]>([])
  const [proformaLoading, setProformaLoading] = React.useState(false)
  const [proformaLoadingMore, setProformaLoadingMore] = React.useState(false)
  const [proformaHasMore, setProformaHasMore] = React.useState(false)
  const [proformaOffset, setProformaOffset] = React.useState(0)

  // Quotation search
  const [quotationSearchOpen, setQuotationSearchOpen] = React.useState(false)
  const [quotationSearch, setQuotationSearch] = React.useState("")
  const [quotationResults, setQuotationResults] = React.useState<Quotation[]>([])
  const [quotationLoading, setQuotationLoading] = React.useState(false)
  const [quotationLoadingMore, setQuotationLoadingMore] = React.useState(false)
  const [quotationHasMore, setQuotationHasMore] = React.useState(false)
  const [quotationOffset, setQuotationOffset] = React.useState(0)

  // Customer search
  const [customerSearchOpen, setCustomerSearchOpen] = React.useState(false)
  const [customerSearch, setCustomerSearch] = React.useState("")
  const [customerResults, setCustomerResults] = React.useState<Customer[]>([])
  const [customerLoading, setCustomerLoading] = React.useState(false)
  const [customerLoadingMore, setCustomerLoadingMore] = React.useState(false)
  const [customerHasMore, setCustomerHasMore] = React.useState(false)
  const [customerOffset, setCustomerOffset] = React.useState(0)
  const [selectedCustomerName, setSelectedCustomerName] = React.useState<string | null>(
    initialInvoice?.customer_name ?? null
  )

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      companyId: initialValues?.companyId ?? 1,
      proforma: initialValues?.proforma ?? null,
      quotation: initialValues?.quotation ?? null,
      customer: initialValues?.customer ?? null,
      invoice_number: initialValues?.invoice_number ?? "",
      currency: initialValues?.currency ?? "USD",
      selected_template: initialValues?.selected_template ?? null,
      status: initialValues?.status ?? "draft",
      lines: initialValues?.lines ?? [
        { product: null, description: "", quantity: "1", unit_price: "0.00" },
      ],
    },
  })

  const { control } = form
  const { fields, append, remove, replace } = useFieldArray({ control, name: "lines" })

  const companyId = form.watch("companyId")
  const selectedStatus = form.watch("status")
  const selectedProformaId = form.watch("proforma")
  const selectedQuotationId = form.watch("quotation")
  const selectedCustomerId = form.watch("customer")
  const lines = form.watch("lines")

  React.useEffect(() => {
    if (!companyId || !Number.isFinite(Number(companyId)) || Number(companyId) <= 0) {
      setTemplates([])
      return
    }
    const run = async () => {
      try {
        const res = await listInvoiceTemplates({ company: companyId })
        setTemplates(res.results)
      } catch (error) {
        console.error(error)
      }
    }
    void run()
  }, [companyId])

  // Proforma loader
  const loadProformas = React.useCallback(
    async (search: string, offset: number, appendResults: boolean) => {
      if (!companyId || !Number.isFinite(Number(companyId)) || Number(companyId) <= 0) {
        setProformaResults([])
        setProformaHasMore(false)
        return
      }
      try {
        if (appendResults) setProformaLoadingMore(true)
        else setProformaLoading(true)
        const data = await listProformas({ company: companyId, search, offset, limit: 8 })
        setProformaResults((prev) =>
          appendResults
            ? [...prev, ...data.results.filter((item) => !prev.some((x) => x.id === item.id))]
            : data.results
        )
        setProformaOffset(offset + data.results.length)
        setProformaHasMore(Boolean(data.next))
      } catch (error) {
        console.error(error)
      } finally {
        if (appendResults) setProformaLoadingMore(false)
        else setProformaLoading(false)
      }
    },
    [companyId]
  )

  React.useEffect(() => {
    if (!companyId || !Number.isFinite(Number(companyId)) || Number(companyId) <= 0) {
      setProformaResults([])
      setProformaHasMore(false)
      return
    }
    const timeout = window.setTimeout(() => void loadProformas(proformaSearch, 0, false), 250)
    return () => window.clearTimeout(timeout)
  }, [companyId, loadProformas, proformaSearch])

  // Quotation loader
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

  React.useEffect(() => {
    if (!companyId || !Number.isFinite(Number(companyId)) || Number(companyId) <= 0) {
      setQuotationResults([])
      setQuotationHasMore(false)
      return
    }
    const timeout = window.setTimeout(() => void loadQuotations(quotationSearch, 0, false), 250)
    return () => window.clearTimeout(timeout)
  }, [companyId, loadQuotations, quotationSearch])

  // Customer loader
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
      setCustomerResults([])
      setCustomerHasMore(false)
      return
    }
    const timeout = window.setTimeout(() => void loadCustomers(customerSearch, 0, false), 250)
    return () => window.clearTimeout(timeout)
  }, [companyId, loadCustomers, customerSearch])

  const selectedProforma = proformaResults.find((item) => item.id === selectedProformaId) ?? null
  const selectedQuotation = quotationResults.find((item) => item.id === selectedQuotationId) ?? null

  const handleProformaSelect = async (proforma: Proforma) => {
    form.setValue("proforma", proforma.id)
    setProformaResults((prev) =>
      prev.some((item) => item.id === proforma.id) ? prev : [proforma, ...prev]
    )
    try {
      const full = await getProforma(proforma.id)
      if (full.customer) {
        form.setValue("customer", full.customer)
        setSelectedCustomerName(full.customer_name ?? null)
      }
      if (full.currency) form.setValue("currency", full.currency)
      if (full.lines && full.lines.length > 0) {
        replace(
          full.lines.map((line) => ({
            id: undefined,
            product: line.product ?? null,
            description: line.description ?? "",
            quantity: line.quantity,
            unit_price: line.unit_price,
          }))
        )
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleQuotationSelect = async (quotation: Quotation) => {
    form.setValue("quotation", quotation.id)
    setQuotationResults((prev) =>
      prev.some((item) => item.id === quotation.id) ? prev : [quotation, ...prev]
    )
    try {
      const full = await getQuotation(quotation.id)
      if (full.customer) {
        form.setValue("customer", full.customer)
        setSelectedCustomerName(full.customer_name ?? null)
      }
      if (full.currency) form.setValue("currency", full.currency)
      if (full.lines && full.lines.length > 0) {
        replace(
          full.lines.map((line) => ({
            id: undefined,
            product: line.product ?? null,
            description: line.description ?? "",
            quantity: line.quantity,
            unit_price: line.unit_price,
          }))
        )
      }
    } catch (error) {
      console.error(error)
    }
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.quantity || 0) * Number(line.unit_price || 0),
    0
  )

  const handleRemoveLine = (index: number) => {
    const line = form.getValues(`lines.${index}`)
    if (line?.id) setRemovedLineIds((prev) => [...prev, line.id!])
    remove(index)
  }

  const handleSubmit = async (values: InvoiceFormValues) => {
    setSubmitError(null)
    try {
      await onSubmit(values, removedLineIds)
    } catch (error) {
      console.error(error)
      setSubmitError(error instanceof Error ? error.message : "Failed to save invoice.")
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
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Invoice setup</h2>
            <p className="text-sm text-slate-500">
              Link a proforma or quotation to auto-fill customer and line items, or create manually.
            </p>
          </div>
          <Badge className={`rounded-full px-3 py-1 capitalize ${statusTone(selectedStatus)}`}>
            {selectedStatus.replace(/_/g, " ")}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* Proforma */}
          <Field>
            <FieldLabel>Proforma (optional)</FieldLabel>
            <SearchSelect<Proforma>
              valueLabel={
                selectedProforma?.proforma_number ??
                (selectedProformaId ? `Proforma #${selectedProformaId}` : null)
              }
              placeholder="Link a proforma..."
              searchPlaceholder="Search proformas..."
              items={proformaResults}
              open={proformaSearchOpen}
              loading={proformaLoading}
              loadingMore={proformaLoadingMore}
              hasMore={proformaHasMore}
              onOpenChange={setProformaSearchOpen}
              onSearch={setProformaSearch}
              onLoadMore={() => void loadProformas(proformaSearch, proformaOffset, true)}
              onSelect={handleProformaSelect}
              getKey={(item) => item.id}
              getLabel={(item) => item.proforma_number || `Proforma #${item.id}`}
              getDescription={(item) => item.customer_name || item.total}
            />
            <FieldDescription>Selecting auto-fills customer and line items.</FieldDescription>
          </Field>

          {/* Quotation */}
          <Field>
            <FieldLabel>Quotation (optional)</FieldLabel>
            <SearchSelect<Quotation>
              valueLabel={
                selectedQuotation?.quote_number ??
                (selectedQuotationId ? `Quotation #${selectedQuotationId}` : null)
              }
              placeholder="Link a quotation..."
              searchPlaceholder="Search quotations..."
              items={quotationResults}
              open={quotationSearchOpen}
              loading={quotationLoading}
              loadingMore={quotationLoadingMore}
              hasMore={quotationHasMore}
              onOpenChange={setQuotationSearchOpen}
              onSearch={setQuotationSearch}
              onLoadMore={() => void loadQuotations(quotationSearch, quotationOffset, true)}
              onSelect={handleQuotationSelect}
              getKey={(item) => item.id}
              getLabel={(item) => item.quote_number || item.name}
              getDescription={(item) => item.customer_name || item.total}
            />
            <FieldDescription>Selecting auto-fills customer and line items.</FieldDescription>
          </Field>

          {/* Customer */}
          <Field>
            <FieldLabel>Customer (optional)</FieldLabel>
            <SearchSelect<Customer>
              valueLabel={
                selectedCustomerName ??
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
                setSelectedCustomerName(customer.name)
                setCustomerResults((prev) =>
                  prev.some((item) => item.id === customer.id) ? prev : [customer, ...prev]
                )
              }}
              getKey={(item) => item.id}
              getLabel={(item) => item.name}
              getDescription={(item) => item.email ?? item.phone_number ?? ""}
            />
            <FieldDescription>Auto-filled from proforma or quotation. Editable.</FieldDescription>
          </Field>

          {/* Invoice number */}
          <Controller
            name="invoice_number"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Invoice number</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  className="rounded-2xl"
                  placeholder="Auto-generated if left blank"
                />
                <FieldDescription>Leave empty to use the organization numbering sequence.</FieldDescription>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          {/* Status */}
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
                  <option value="overdue">overdue</option>
                </select>
              </Field>
            )}
          />

          {/* Currency */}
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

          {/* Template */}
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
                  <option value="">Default invoice template</option>
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

      <DocumentLineItemsEditor
        form={form}
        control={control}
        fields={fields}
        appendLine={() =>
          append({ product: null, description: "", quantity: "1", unit_price: "0.00" })
        }
        removeLine={handleRemoveLine}
        title="Invoice line items"
        description="Search products from your catalog, or build lines manually. Selecting a proforma or quotation above auto-fills these."
        searchProducts={({ search, offset, limit }) =>
          listProducts({ company: companyId, search, offset, limit })
        }
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Totals</h2>
          {initialInvoice ? (
            <div className="text-sm text-slate-500">
              Updated {new Date(initialInvoice.updated_at).toLocaleString()}
            </div>
          ) : null}
        </div>

        <div className="ml-auto max-w-md space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Line items</span>
            <span className="font-medium text-slate-900">{lines.length}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-xl font-semibold text-slate-900">{subtotal.toFixed(2)}</span>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" className="rounded-2xl" onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button type="submit" className="rounded-2xl">
          {submitLabel ?? (mode === "create" ? "Create invoice" : "Save changes")}
        </Button>
      </div>
    </form>
  )
}
