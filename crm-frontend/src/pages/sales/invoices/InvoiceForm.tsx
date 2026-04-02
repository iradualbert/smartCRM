import * as React from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileSpreadsheet, Plus, Receipt, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

import {
  listProducts,
  listInvoiceTemplates,
  listProformas,
  type Product,
  type Proforma,
  type Template,
  type Invoice,
  type InvoiceStatus,
} from "./api"

export const invoiceFormSchema = z.object({
  companyId: z.coerce.number().min(1, "Company is required"),
  proforma: z.coerce.number().min(1, "Proforma is required"),
  invoice_number: z.string().min(1, "Invoice number is required"),
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

export function makeInvoiceNumber() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const random = Math.floor(Math.random() * 900 + 100)
  return `INV-${y}${m}${d}-${random}`
}

function statusTone(status: InvoiceStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "sent":
      return "bg-sky-50 text-sky-700 border-sky-200"
    case "overdue":
      return "bg-rose-50 text-rose-700 border-rose-200"
    case "partially_paid":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "cancelled":
      return "bg-zinc-100 text-zinc-700 border-zinc-200"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200"
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

const InvoiceForm = ({
  mode,
  initialValues,
  initialInvoice,
  onSubmit,
  submitLabel,
  cancelLabel = "Cancel",
  onCancel,
}: InvoiceFormProps) => {
  const [products, setProducts] = React.useState<Product[]>([])
  const [proformas, setProformas] = React.useState<Proforma[]>([])
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [loadingOptions, setLoadingOptions] = React.useState(true)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [removedLineIds, setRemovedLineIds] = React.useState<number[]>([])
  const [activeTab, setActiveTab] = React.useState("details")

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      companyId: initialValues?.companyId ?? 1,
      proforma: initialValues?.proforma ?? 0,
      invoice_number: initialValues?.invoice_number ?? makeInvoiceNumber(),
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const lines = form.watch("lines")
  const selectedStatus = form.watch("status")

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoadingOptions(true)
        const [productsRes, templatesRes, proformasRes] = await Promise.all([
          listProducts(),
          listInvoiceTemplates(),
          listProformas(),
        ])
        setProducts(productsRes.results)
        setTemplates(templatesRes.results)
        setProformas(proformasRes.results)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingOptions(false)
      }
    }

    run()
  }, [])

  const subtotal = lines.reduce((sum, line) => {
    const qty = Number(line.quantity || 0)
    const unit = Number(line.unit_price || 0)
    return sum + qty * unit
  }, 0)

  const handleRemoveLine = (index: number) => {
    const line = form.getValues(`lines.${index}`)
    if (line?.id) {
      setRemovedLineIds((prev) => [...prev, line.id!])
    }
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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {submitError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-slate-50/70">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-slate-900">Invoice workspace</CardTitle>
                  <CardDescription>
                    Reusable form for create, edit, and conversion flows.
                  </CardDescription>
                </div>
                <Badge className={`rounded-full border ${statusTone(selectedStatus)}`}>
                  {selectedStatus.replaceAll("_", " ")}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 h-auto flex-wrap rounded-2xl bg-slate-100 p-1">
                  <TabsTrigger value="details" className="rounded-xl">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="lines" className="rounded-xl">
                    Line items
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="rounded-xl">
                    Notes
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {activeTab === "details" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    name="invoice_number"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Invoice Number</FieldLabel>
                        <div className="flex gap-2">
                          <Input {...field} placeholder="INV-20260402-101" className="rounded-xl" />
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => form.setValue("invoice_number", makeInvoiceNumber())}
                          >
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
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Status</FieldLabel>
                        <select
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
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
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="proforma"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Proforma</FieldLabel>
                        <select
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={loadingOptions}
                        >
                          <option value="">Select proforma</option>
                          {proformas.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.proforma_number}
                            </option>
                          ))}
                        </select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="currency"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Currency</FieldLabel>
                        <Input {...field} placeholder="USD" className="rounded-xl" />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="selected_template"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Template</FieldLabel>
                        <select
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : null)
                          }
                          disabled={loadingOptions}
                        >
                          <option value="">No template selected</option>
                          {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="companyId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Company Id</FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="rounded-xl"
                        />
                        <FieldDescription>
                          Replace with active company context later.
                        </FieldDescription>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>
              )}

              {activeTab === "lines" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Invoice line items</h3>
                      <p className="text-sm text-slate-500">
                        Choose products or enter custom lines manually.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() =>
                        append({
                          product: null,
                          description: "",
                          quantity: "1",
                          unit_price: "0.00",
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add line
                    </Button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-slate-600">
                          <th className="px-4 py-3 font-medium">#</th>
                          <th className="px-4 py-3 font-medium">Product</th>
                          <th className="px-4 py-3 font-medium">Description</th>
                          <th className="px-4 py-3 font-medium">Qty</th>
                          <th className="px-4 py-3 font-medium">Unit Price</th>
                          <th className="px-4 py-3 font-medium">Line Total</th>
                          <th className="px-4 py-3 text-right font-medium">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {fields.map((item, index) => {
                          const quantity = Number(lines[index]?.quantity || 0)
                          const unitPrice = Number(lines[index]?.unit_price || 0)
                          const lineTotal = quantity * unitPrice

                          return (
                            <tr key={item.id} className="border-t border-slate-100 align-top">
                              <td className="px-4 py-3 text-slate-500">{index + 1}</td>

                              <td className="min-w-[180px] px-4 py-3">
                                <Controller
                                  name={`lines.${index}.product`}
                                  control={form.control}
                                  render={({ field }) => (
                                    <select
                                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                                      value={field.value ?? ""}
                                      onChange={(e) => {
                                        const productId = e.target.value ? Number(e.target.value) : null
                                        field.onChange(productId)
                                        const selected = products.find((p) => p.id === productId)
                                        if (selected) {
                                          form.setValue(
                                            `lines.${index}.description`,
                                            selected.description?.trim() || selected.name
                                          )
                                          form.setValue(
                                            `lines.${index}.unit_price`,
                                            selected.default_price || "0.00"
                                          )
                                        }
                                      }}
                                      disabled={loadingOptions}
                                    >
                                      <option value="">Manual</option>
                                      {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                          {product.name}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                />
                              </td>

                              <td className="min-w-[280px] px-4 py-3">
                                <Controller
                                  name={`lines.${index}.description`}
                                  control={form.control}
                                  render={({ field, fieldState }) => (
                                    <div>
                                      <Input
                                        {...field}
                                        placeholder="Line description"
                                        className="rounded-xl"
                                      />
                                      {fieldState.invalid ? (
                                        <p className="mt-1 text-xs text-rose-600">
                                          {fieldState.error?.message}
                                        </p>
                                      ) : null}
                                    </div>
                                  )}
                                />
                              </td>

                              <td className="w-[120px] px-4 py-3">
                                <Controller
                                  name={`lines.${index}.quantity`}
                                  control={form.control}
                                  render={({ field, fieldState }) => (
                                    <div>
                                      <Input
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="rounded-xl text-right"
                                      />
                                      {fieldState.invalid ? (
                                        <p className="mt-1 text-xs text-rose-600">
                                          {fieldState.error?.message}
                                        </p>
                                      ) : null}
                                    </div>
                                  )}
                                />
                              </td>

                              <td className="w-[140px] px-4 py-3">
                                <Controller
                                  name={`lines.${index}.unit_price`}
                                  control={form.control}
                                  render={({ field, fieldState }) => (
                                    <div>
                                      <Input
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="rounded-xl text-right"
                                      />
                                      {fieldState.invalid ? (
                                        <p className="mt-1 text-xs text-rose-600">
                                          {fieldState.error?.message}
                                        </p>
                                      ) : null}
                                    </div>
                                  )}
                                />
                              </td>

                              <td className="w-[140px] px-4 py-3">
                                <div className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right font-medium text-slate-900">
                                  {lineTotal.toFixed(2)}
                                </div>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                  onClick={() => handleRemoveLine(index)}
                                  disabled={fields.length === 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <Controller
                  name="internal_note"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Internal Note</FieldLabel>
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder="Optional internal note for your team."
                        className="rounded-2xl"
                      />
                      <FieldDescription>
                        Frontend-ready field you can later map to backend notes.
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Receipt className="h-5 w-5 text-sky-600" />
                Invoice summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Line items</span>
                <span className="font-medium text-slate-900">{lines.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-lg font-semibold text-slate-900">
                  {subtotal.toFixed(2)}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">Current mode</div>
                <div className="mt-2 font-medium text-slate-900">
                  {mode === "create" ? "Create invoice" : "Edit invoice"}
                </div>
              </div>

              {initialInvoice ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
                    Existing invoice metadata
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Created</span>
                      <span>{new Date(initialInvoice.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Updated</span>
                      <span>{new Date(initialInvoice.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button type="submit" className="h-11 rounded-2xl">
              {submitLabel ?? (mode === "create" ? "Create Invoice" : "Save Changes")}
            </Button>

            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl"
                onClick={onCancel}
              >
                {cancelLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  )
}

export default InvoiceForm