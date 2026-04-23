import * as React from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import DocumentLineItemsEditor from "@/shared/DocumentLineItemsEditor"
import {
  listCustomers,
  listProducts,
  listProformaTemplates,
  listQuotations,
  type Customer,
  type Product,
  type Proforma,
  type ProformaStatus,
  type Quotation,
  type Template,
} from "./api"

export const proformaFormSchema = z.object({
  companyId: z.coerce.number().min(1, "Company is required"),
  quotation: z.coerce.number().nullable().optional(),
  customer: z.coerce.number().nullable().optional(),
  proforma_number: z.string().min(1, "Proforma number is required"),
  currency: z.string().optional(),
  selected_template: z.coerce.number().nullable().optional(),
  status: z.enum(["draft", "sent", "paid", "cancelled"]),
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
    .min(1, "Add at least one line"),
})

export type ProformaFormValues = z.infer<typeof proformaFormSchema>

function makeProformaNumber() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const random = Math.floor(Math.random() * 900 + 100)
  return `PRO-${y}${m}${d}-${random}`
}

function statusTone(status: ProformaStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "sent":
      return "bg-sky-50 text-sky-700 border-sky-200"
    case "cancelled":
      return "bg-zinc-100 text-zinc-700 border-zinc-200"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200"
  }
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
  const [products, setProducts] = React.useState<Product[]>([])
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [quotations, setQuotations] = React.useState<Quotation[]>([])
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [loadingOptions, setLoadingOptions] = React.useState(true)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [removedLineIds, setRemovedLineIds] = React.useState<number[]>([])
  const [activeTab, setActiveTab] = React.useState("details")

  const form = useForm<ProformaFormValues>({
    resolver: zodResolver(proformaFormSchema),
    defaultValues: {
      companyId: initialValues?.companyId ?? 1,
      quotation: initialValues?.quotation ?? null,
      customer: initialValues?.customer ?? null,
      proforma_number: initialValues?.proforma_number ?? makeProformaNumber(),
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
  const { fields, append, remove } = useFieldArray({ control, name: "lines" })
  const selectedStatus = form.watch("status")
  const lines = form.watch("lines")

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoadingOptions(true)
        const [productsRes, customersRes, quotationsRes, templatesRes] = await Promise.all([
          listProducts(),
          listCustomers(),
          listQuotations(),
          listProformaTemplates(),
        ])
        setProducts(productsRes.results)
        setCustomers(customersRes.results)
        setQuotations(quotationsRes.results)
        setTemplates(templatesRes.results)
      } finally {
        setLoadingOptions(false)
      }
    }
    run()
  }, [])

  const subtotal = lines.reduce((sum, line) => {
    return sum + Number(line.quantity || 0) * Number(line.unit_price || 0)
  }, 0)

  const appendLine = () =>
    append({ product: null, description: "", quantity: "1", unit_price: "0.00" })

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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Proforma workspace</CardTitle>
                  <CardDescription>Create and update proformas with reusable line items.</CardDescription>
                </div>
                <Badge className={`rounded-full border ${statusTone(selectedStatus)}`}>
                  {selectedStatus}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 h-auto flex-wrap rounded-2xl bg-slate-100 p-1">
                  <TabsTrigger value="details" className="rounded-xl">Details</TabsTrigger>
                  <TabsTrigger value="lines" className="rounded-xl">Line items</TabsTrigger>
                  <TabsTrigger value="notes" className="rounded-xl">Notes</TabsTrigger>
                </TabsList>
              </Tabs>

              {activeTab === "details" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    name="proforma_number"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Proforma Number</FieldLabel>
                        <div className="flex gap-2">
                          <Input {...field} className="rounded-xl" />
                          <Button type="button" variant="outline" className="rounded-xl" onClick={() => form.setValue("proforma_number", makeProformaNumber())}>
                            Generate
                          </Button>
                        </div>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="status"
                    control={control}
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
                          <option value="paid">paid</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="quotation"
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Quotation</FieldLabel>
                        <select
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          disabled={loadingOptions}
                        >
                          <option value="">No quotation</option>
                          {quotations.map((q) => (
                            <option key={q.id} value={q.id}>
                              {q.quote_number}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  />

                  <Controller
                    name="customer"
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Customer</FieldLabel>
                        <select
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          disabled={loadingOptions}
                        >
                          <option value="">No customer</option>
                          {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  />

                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>Currency</FieldLabel>
                        <Input {...field} className="rounded-xl" />
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
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          disabled={loadingOptions}
                        >
                          <option value="">No template selected</option>
                          {templates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  />

                </div>
              )}

              {activeTab === "lines" && (
                <DocumentLineItemsEditor
                  form={form}
                  control={control}
                  fields={fields}
                  products={products}
                  loadingOptions={loadingOptions}
                  appendLine={appendLine}
                  removeLine={removeLine}
                  title="Proforma line items"
                />
              )}

              {activeTab === "notes" && (
                <Controller
                  name="internal_note"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Internal Note</FieldLabel>
                      <Textarea {...field} rows={6} className="rounded-2xl" />
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
              <CardTitle>Proforma summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Line items</span>
                <span className="font-medium">{lines.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-lg font-semibold">{subtotal.toFixed(2)}</span>
              </div>
              {initialProforma ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created</span>
                    <span>{new Date(initialProforma.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button type="submit" className="h-11 rounded-2xl">
              {submitLabel ?? (mode === "create" ? "Create Proforma" : "Save Changes")}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" className="h-11 rounded-2xl" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  )
}