import * as React from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import SearchSelect from "../shared-components/SearchSelect"
import DocumentLineItemsEditor from "@/shared/DocumentLineItemsEditor"
import {
  listInvoiceTemplates,
  listProducts,
  listProformas,
  type Invoice,
  type InvoiceStatus,
  type Proforma,
  type Template,
} from "./api"

export const invoiceFormSchema = z.object({
  companyId: z.coerce.number().min(1, "Company is required"),
  proforma: z.coerce.number().min(1, "Proforma is required"),
  invoice_number: z.string().optional(),
  currency: z.string().optional(),
  selected_template: z.coerce.number().nullable().optional(),
  status: z.enum(["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"]),
  internal_note: z.string().optional(),
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
    case "partially_paid":
      return "bg-amber-50 text-amber-700"
    case "cancelled":
      return "bg-zinc-100 text-zinc-700"
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

  const [proformaSearchOpen, setProformaSearchOpen] = React.useState(false)
  const [proformaSearch, setProformaSearch] = React.useState("")
  const [proformaResults, setProformaResults] = React.useState<Proforma[]>([])
  const [proformaLoading, setProformaLoading] = React.useState(false)
  const [proformaLoadingMore, setProformaLoadingMore] = React.useState(false)
  const [proformaHasMore, setProformaHasMore] = React.useState(false)
  const [proformaOffset, setProformaOffset] = React.useState(0)

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      companyId: initialValues?.companyId ?? 1,
      proforma: initialValues?.proforma ?? 0,
      invoice_number: initialValues?.invoice_number ?? "",
      currency: initialValues?.currency ?? "USD",
      selected_template: initialValues?.selected_template ?? null,
      status: initialValues?.status ?? "draft",
      internal_note: initialValues?.internal_note ?? "",
      lines:
        initialValues?.lines ?? [
          {
            product: null,
            description: "",
            quantity: "1",
            unit_price: "0.00",
          },
        ],
    },
  })

  const { control } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  })

  const companyId = form.watch("companyId")
  const selectedStatus = form.watch("status")
  const selectedProformaId = form.watch("proforma")
  const lines = form.watch("lines")

  React.useEffect(() => {
    if (!companyId || !Number.isFinite(Number(companyId)) || Number(companyId) <= 0) {
      setTemplates([])
      return
    }

    const run = async () => {
      try {
        const templatesRes = await listInvoiceTemplates({ company: companyId })
        setTemplates(templatesRes.results)
      } catch (error) {
        console.error(error)
      }
    }

    void run()
  }, [companyId])

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

        const data = await listProformas({
          company: companyId,
          search,
          offset,
          limit: 8,
        })

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
    [companyId, form]
  )

  React.useEffect(() => {
    if (!companyId || !Number.isFinite(Number(companyId)) || Number(companyId) <= 0) {
      setProformaResults([])
      setProformaHasMore(false)
      return
    }

    const timeout = window.setTimeout(() => {
      void loadProformas(proformaSearch, 0, false)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [companyId, loadProformas, proformaSearch])

  const selectedProforma =
    proformaResults.find((item) => item.id === selectedProformaId) ?? null

  const subtotal = lines.reduce((sum, line) => {
    return sum + Number(line.quantity || 0) * Number(line.unit_price || 0)
  }, 0)

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
              Match the quotation workflow with a searchable proforma source and clear billing metadata.
            </p>
          </div>
          <Badge className={`rounded-full px-3 py-1 capitalize ${statusTone(selectedStatus)}`}>
            {selectedStatus.replaceAll("_", " ")}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field>
            <FieldLabel>Proforma</FieldLabel>
            <SearchSelect<Proforma>
              valueLabel={
                selectedProforma?.proforma_number ??
                (selectedProformaId ? `Selected proforma #${selectedProformaId}` : null)
              }
              placeholder="Search proforma..."
              searchPlaceholder="Search proformas..."
              items={proformaResults}
              open={proformaSearchOpen}
              loading={proformaLoading}
              loadingMore={proformaLoadingMore}
              hasMore={proformaHasMore}
              onOpenChange={setProformaSearchOpen}
              onSearch={setProformaSearch}
              onLoadMore={() => void loadProformas(proformaSearch, proformaOffset, true)}
              onSelect={(proforma) => {
                form.setValue("proforma", proforma.id)
                setProformaResults((prev) =>
                  prev.some((item) => item.id === proforma.id) ? prev : [proforma, ...prev]
                )
              }}
              getKey={(item) => item.id}
              getLabel={(item) => item.proforma_number || `Proforma #${item.id}`}
              getDescription={(item) => item.customer_name || item.total}
            />
            {form.formState.errors.proforma ? (
              <FieldError errors={[form.formState.errors.proforma]} />
            ) : null}
          </Field>

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
                <FieldDescription>
                  Leave empty to use the organization numbering sequence.
                </FieldDescription>
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
                  <option value="partially_paid">partially paid</option>
                  <option value="paid">paid</option>
                  <option value="overdue">overdue</option>
                  <option value="cancelled">cancelled</option>
                </select>
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
            name="selected_template"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Template</FieldLabel>
                <select
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : null)
                  }
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

          <Controller
            name="internal_note"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="xl:col-span-3">
                <FieldLabel>Internal note</FieldLabel>
                <Textarea
                  {...field}
                  rows={4}
                  className="rounded-2xl"
                  placeholder="Optional notes for your team."
                />
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
          append({
            product: null,
            description: "",
            quantity: "1",
            unit_price: "0.00",
          })
        }
        removeLine={handleRemoveLine}
        title="Invoice line items"
        description="Search products from your paginated catalog or write custom lines manually."
        searchProducts={({ search, offset, limit }) =>
          listProducts({
            company: companyId,
            search,
            offset,
            limit,
          })
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
