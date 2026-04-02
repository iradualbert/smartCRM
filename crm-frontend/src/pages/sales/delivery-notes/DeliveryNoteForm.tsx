import * as React from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DocumentLineItemsEditor from "@/shared/DocumentLineItemsEditor"
import {
  listDeliveryNoteTemplates,
  listInvoices,
  listProducts,
  type DeliveryNote,
  type Invoice,
  type Product,
  type Template,
} from "./api"

export const deliveryNoteFormSchema = z.object({
  companyId: z.coerce.number().min(1, "Company is required"),
  invoice: z.coerce.number().min(1, "Invoice is required"),
  delivery_note_number: z.string().min(1, "Delivery note number is required"),
  delivery_date: z.string().min(1, "Delivery date is required"),
  currency: z.string().optional(),
  selected_template: z.coerce.number().nullable().optional(),
  status: z.enum(["draft", "dispatched", "delivered", "cancelled"]),
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

export type DeliveryNoteFormValues = z.infer<typeof deliveryNoteFormSchema>

function makeDeliveryNoteNumber() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const random = Math.floor(Math.random() * 900 + 100)
  return `DN-${y}${m}${d}-${random}`
}

type DeliveryNoteFormProps = {
  mode: "create" | "edit"
  initialValues?: Partial<DeliveryNoteFormValues>
  initialDeliveryNote?: DeliveryNote | null
  onSubmit: (values: DeliveryNoteFormValues, removedLineIds: number[]) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export default function DeliveryNoteForm({
  mode,
  initialValues,
  initialDeliveryNote,
  onSubmit,
  onCancel,
  submitLabel,
}: DeliveryNoteFormProps) {
  const [products, setProducts] = React.useState<Product[]>([])
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [removedLineIds, setRemovedLineIds] = React.useState<number[]>([])
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("details")

  const form = useForm<DeliveryNoteFormValues>({
    resolver: zodResolver(deliveryNoteFormSchema),
    defaultValues: {
      companyId: initialValues?.companyId ?? 1,
      invoice: initialValues?.invoice ?? 0,
      delivery_note_number: initialValues?.delivery_note_number ?? makeDeliveryNoteNumber(),
      delivery_date: initialValues?.delivery_date ?? new Date().toISOString().slice(0, 10),
      currency: initialValues?.currency ?? "USD",
      selected_template: initialValues?.selected_template ?? null,
      status: initialValues?.status ?? "draft",
      lines:
        initialValues?.lines ?? [
          { product: null, description: "", quantity: "1", unit_price: "0.00" },
        ],
    },
  })

  const { control } = form
  const { fields, append, remove } = useFieldArray({ control, name: "lines" })
  const lines = form.watch("lines")
  const selectedStatus = form.watch("status")

  React.useEffect(() => {
    const run = async () => {
      const [productsRes, invoicesRes, templatesRes] = await Promise.all([
        listProducts(),
        listInvoices(),
        listDeliveryNoteTemplates(),
      ])
      setProducts(productsRes.results)
      setInvoices(invoicesRes.results)
      setTemplates(templatesRes.results)
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

  const handleSubmit = async (values: DeliveryNoteFormValues) => {
    setSubmitError(null)
    try {
      await onSubmit(values, removedLineIds)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save delivery note.")
    }
  }

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
                <CardTitle>Delivery note workspace</CardTitle>
                <CardDescription>Create and update dispatch and delivery documents.</CardDescription>
              </div>
              <Badge className="rounded-full border bg-slate-100 text-slate-700">
                {selectedStatus}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 h-auto flex-wrap rounded-2xl bg-slate-100 p-1">
                <TabsTrigger value="details" className="rounded-xl">Details</TabsTrigger>
                <TabsTrigger value="lines" className="rounded-xl">Line items</TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === "details" && (
              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="delivery_note_number"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Delivery Note Number</FieldLabel>
                      <div className="flex gap-2">
                        <Input {...field} className="rounded-xl" />
                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => form.setValue("delivery_note_number", makeDeliveryNoteNumber())}>
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
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <select
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <option value="draft">draft</option>
                        <option value="dispatched">dispatched</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </Field>
                  )}
                />

                <Controller
                  name="invoice"
                  control={control}
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
                  name="delivery_date"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Delivery Date</FieldLabel>
                      <Input {...field} type="date" className="rounded-xl" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                  control={control}
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
              </div>
            )}

            {activeTab === "lines" && (
              <DocumentLineItemsEditor
                form={form}
                control={control}
                fields={fields}
                products={products}
                appendLine={appendLine}
                removeLine={removeLine}
                title="Delivery note lines"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Delivery note summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Line items</span>
              <span>{lines.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-lg font-semibold">{subtotal.toFixed(2)}</span>
            </div>
            {initialDeliveryNote ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Created</span>
                <span>{new Date(initialDeliveryNote.created_at).toLocaleString()}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button type="submit" className="h-11 rounded-2xl">
            {submitLabel ?? (mode === "create" ? "Create Delivery Note" : "Save Changes")}
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