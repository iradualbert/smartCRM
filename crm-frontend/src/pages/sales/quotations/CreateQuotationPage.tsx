import * as React from "react"
import { useNavigate } from "react-router-dom"
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
  createQuotationWithLines,
  listCustomers,
  listProducts,
  listQuotationTemplates,
  type Customer,
  type Product,
  type Template,
} from "./api"

const quotationSchema = z.object({
  companyId: z.coerce.number().min(1, "Company is required"),
  customerMode: z.enum(["existing", "manual"]),
  existingCustomerId: z.coerce.number().nullable().optional(),

  manualCustomerName: z.string().optional(),
  manualCustomerEmail: z.string().optional(),
  manualCustomerPhone: z.string().optional(),
  manualCustomerAddress: z.string().optional(),

  name: z.string().min(1, "Quotation name is required"),
  quote_number: z.string().min(1, "Quote number is required"),
  description: z.string().optional(),
  currency: z.string().optional(),
  selected_template: z.coerce.number().nullable().optional(),

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
}).superRefine((data, ctx) => {
  if (data.customerMode === "existing" && !data.existingCustomerId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["existingCustomerId"],
      message: "Select a customer",
    })
  }

  if (data.customerMode === "manual" && !data.manualCustomerName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["manualCustomerName"],
      message: "Customer name is required",
    })
  }
})

type FormValues = z.infer<typeof quotationSchema>

function makeQuoteNumber() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const random = Math.floor(Math.random() * 900 + 100)
  return `QUO-${y}${m}${d}-${random}`
}

const CreateQuotationPage = () => {
  const navigate = useNavigate()

  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [products, setProducts] = React.useState<Product[]>([])
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [loadingOptions, setLoadingOptions] = React.useState(true)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      companyId: 1,
      customerMode: "manual",
      existingCustomerId: null,
      manualCustomerName: "",
      manualCustomerEmail: "",
      manualCustomerPhone: "",
      manualCustomerAddress: "",
      name: "",
      quote_number: makeQuoteNumber(),
      description: "",
      currency: "USD",
      selected_template: null,
      lines: [
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

  const customerMode = form.watch("customerMode")
  const lines = form.watch("lines")

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true)
        const [customersRes, productsRes, templatesRes] = await Promise.all([
          listCustomers(),
          listProducts(),
          listQuotationTemplates(),
        ])
        setCustomers(customersRes.results)
        setProducts(productsRes.results)
        setTemplates(templatesRes.results)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingOptions(false)
      }
    }

    loadOptions()
  }, [])

  const subtotal = lines.reduce((sum, line) => {
    const qty = Number(line.quantity || 0)
    const unit = Number(line.unit_price || 0)
    return sum + qty * unit
  }, 0)

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)

    try {
      const quotation = await createQuotationWithLines({
        companyId: values.companyId,
        customerMode: values.customerMode,
        existingCustomerId: values.existingCustomerId ?? null,
        manualCustomer: {
          name: values.manualCustomerName || "",
          email: values.manualCustomerEmail || "",
          phone_number: values.manualCustomerPhone || "",
          address: values.manualCustomerAddress || "",
        },
        quotation: {
          name: values.name,
          quote_number: values.quote_number,
          description: values.description || "",
          currency: values.currency || "USD",
          selected_template: values.selected_template ?? null,
          status: "draft",
        },
        lines: values.lines.map((line) => ({
          product: line.product ?? null,
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
        })),
      })

      navigate(`/quotations/${quotation.id}`)
    } catch (error) {
      console.error(error)
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create quotation."
      )
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Quotation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a quotation with manual entry or existing customers and products.
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
                  <Input {...field} placeholder="Website redesign proposal" />
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
                  <div className="flex gap-2">
                    <Input {...field} placeholder="QUO-0001" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.setValue("quote_number", makeQuoteNumber())}
                    >
                      Generate
                    </Button>
                  </div>
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
                  <Input {...field} placeholder="USD" />
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
                  />
                  <FieldDescription>Replace later with active company context.</FieldDescription>
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
                  <Textarea {...field} rows={4} placeholder="Optional quotation notes" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="mb-4 text-base font-semibold">Customer</h2>

          <div className="mb-4 flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="manual"
                checked={customerMode === "manual"}
                onChange={() => form.setValue("customerMode", "manual")}
              />
              Manual entry
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="existing"
                checked={customerMode === "existing"}
                onChange={() => form.setValue("customerMode", "existing")}
              />
              Select existing
            </label>
          </div>

          {customerMode === "existing" ? (
            <Controller
              name="existingCustomerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Existing Customer</FieldLabel>
                  <select
                    className="h-10 w-full rounded-md border px-3"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : null)
                    }
                    disabled={loadingOptions}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="manualCustomerName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Customer Name</FieldLabel>
                    <Input {...field} placeholder="Acme Ltd" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="manualCustomerEmail"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Customer Email</FieldLabel>
                    <Input {...field} placeholder="hello@acme.com" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="manualCustomerPhone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Customer Phone</FieldLabel>
                    <Input {...field} placeholder="+254 700 000 000" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="manualCustomerAddress"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Customer Address</FieldLabel>
                    <Input {...field} placeholder="Customer address" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          )}
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
                          onClick={() => remove(index)}
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

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating..." : "Create Quotation"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateQuotationPage