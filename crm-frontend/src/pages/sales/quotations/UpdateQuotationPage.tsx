import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

import {
  getQuotation,
  listProducts,
  listQuotationTemplates,
  updateQuotationWithLines,
  type Product,
  type Quotation,
  type Template,
  type QuotationStatus,
} from "./api"

const editQuotationSchema = z.object({
  name: z.string().min(1, "Quotation name is required"),
  quote_number: z.string().min(1, "Quote number is required"),
  description: z.string().optional(),
  currency: z.string().optional(),
  selected_template: z.coerce.number().nullable().optional(),
  status: z.enum(["draft", "sent", "approved", "rejected", "expired"]),
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
    .min(1, "Add at least one line item"),
})

type FormValues = z.infer<typeof editQuotationSchema>

const UpdateQuotationPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quotation, setQuotation] = React.useState<Quotation | null>(null)
  const [products, setProducts] = React.useState<Product[]>([])
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [removedLineIds, setRemovedLineIds] = React.useState<number[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(editQuotationSchema),
    defaultValues: {
      name: "",
      quote_number: "",
      description: "",
      currency: "USD",
      selected_template: null,
      status: "draft",
      lines: [],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const lines = form.watch("lines")

  React.useEffect(() => {
    const run = async () => {
      if (!id) return

      try {
        setLoading(true)
        const [quotationData, productsRes, templatesRes] = await Promise.all([
          getQuotation(id),
          listProducts(),
          listQuotationTemplates(),
        ])

        setQuotation(quotationData)
        setProducts(productsRes.results)
        setTemplates(templatesRes.results)

        form.reset({
          name: quotationData.name || "",
          quote_number: quotationData.quote_number || "",
          description: quotationData.description || "",
          currency: quotationData.currency || "USD",
          selected_template: quotationData.selected_template ?? null,
          status: quotationData.status,
          lines: (quotationData.lines ?? []).map((line) => ({
            id: line.id,
            product: line.product ?? null,
            description: line.description || "",
            quantity: line.quantity,
            unit_price: line.unit_price,
          })),
        })

        replace(
          (quotationData.lines ?? []).map((line) => ({
            id: line.id,
            product: line.product ?? null,
            description: line.description || "",
            quantity: line.quantity,
            unit_price: line.unit_price,
          }))
        )
      } catch (error) {
        console.error(error)
        setSubmitError("Failed to load quotation.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [id, form, replace])

  const subtotal = lines.reduce((sum, line) => {
    const qty = Number(line.quantity || 0)
    const unit = Number(line.unit_price || 0)
    return sum + qty * unit
  }, 0)

  const removeLine = (index: number) => {
    const line = form.getValues(`lines.${index}`)
    if (line?.id) {
      setRemovedLineIds((prev) => [...prev, line.id!])
    }
    remove(index)
  }

  const onSubmit = async (values: FormValues) => {
    if (!id) return
    setSubmitError(null)

    try {
      const updated = await updateQuotationWithLines({
        quotationId: Number(id),
        quotation: {
          name: values.name,
          quote_number: values.quote_number,
          description: values.description || "",
          currency: values.currency || "USD",
          selected_template: values.selected_template ?? null,
          status: values.status as QuotationStatus,
        },
        lines: values.lines.map((line) => ({
          id: line.id,
          product: line.product ?? null,
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
        })),
        removedLineIds,
      })

      navigate(`/quotations/${updated.id}`)
    } catch (error) {
      console.error(error)
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update quotation."
      )
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          Loading quotation editor...
        </div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Quotation not found.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Quotation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update quotation details, status, template, and line items.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {submitError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <section className="rounded-2xl border p-6">
          <h2 className="mb-4 text-base font-semibold">Quotation Details</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Quotation Name</FieldLabel>
                  <Input {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="quote_number"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Quote Number</FieldLabel>
                  <Input {...field} />
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
                  <Input {...field} />
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
                    className="h-10 w-full rounded-md border px-3"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="draft">draft</option>
                    <option value="sent">sent</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                    <option value="expired">expired</option>
                  </select>
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
                    className="h-10 w-full rounded-md border px-3"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : null)
                    }
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
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="md:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <Textarea {...field} rows={4} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </section>

        <section className="rounded-2xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Line Items</h2>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  product: null,
                  description: "",
                  quantity: "1",
                  unit_price: "0.00",
                })
              }
            >
              Add Line
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="w-14 px-3 py-3 font-medium">#</th>
                  <th className="min-w-[180px] px-3 py-3 font-medium">Product</th>
                  <th className="min-w-[280px] px-3 py-3 font-medium">Description</th>
                  <th className="w-[120px] px-3 py-3 font-medium">Qty</th>
                  <th className="w-[140px] px-3 py-3 font-medium">Unit Price</th>
                  <th className="w-[140px] px-3 py-3 font-medium">Line Total</th>
                  <th className="w-[110px] px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {fields.map((item, index) => {
                  const quantity = Number(lines[index]?.quantity || 0)
                  const unitPrice = Number(lines[index]?.unit_price || 0)
                  const lineTotal = quantity * unitPrice

                  return (
                    <tr key={item.id} className="border-t align-top">
                      <td className="px-3 py-3 text-muted-foreground">{index + 1}</td>

                      <td className="px-3 py-3">
                        <Controller
                          name={`lines.${index}.product`}
                          control={form.control}
                          render={({ field }) => (
                            <select
                              className="h-10 w-full rounded-md border px-3"
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

                      <td className="px-3 py-3">
                        <Controller
                          name={`lines.${index}.description`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <div>
                              <Input {...field} placeholder="Line description" />
                              {fieldState.invalid ? (
                                <p className="mt-1 text-xs text-red-500">
                                  {fieldState.error?.message}
                                </p>
                              ) : null}
                            </div>
                          )}
                        />
                      </td>

                      <td className="px-3 py-3">
                        <Controller
                          name={`lines.${index}.quantity`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <div>
                              <Input {...field} type="number" step="0.01" min="0" className="text-right" />
                              {fieldState.invalid ? (
                                <p className="mt-1 text-xs text-red-500">
                                  {fieldState.error?.message}
                                </p>
                              ) : null}
                            </div>
                          )}
                        />
                      </td>

                      <td className="px-3 py-3">
                        <Controller
                          name={`lines.${index}.unit_price`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <div>
                              <Input {...field} type="number" step="0.01" min="0" className="text-right" />
                              {fieldState.invalid ? (
                                <p className="mt-1 text-xs text-red-500">
                                  {fieldState.error?.message}
                                </p>
                              ) : null}
                            </div>
                          )}
                        />
                      </td>

                      <td className="px-3 py-3">
                        <div className="h-10 rounded-md border bg-muted/30 px-3 py-2 text-right font-medium">
                          {lineTotal.toFixed(2)}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeLine(index)}
                          disabled={fields.length === 1}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="rounded-xl border px-4 py-3 text-sm">
              <span className="mr-2 text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/quotations/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default UpdateQuotationPage