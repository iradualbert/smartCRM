import * as React from "react"
import { useFieldArray, useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Calculator,
  ChevronsUpDown,
  Package2,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

import {
  createCustomer,
  createProduct,
  listCustomers,
  listProducts,
  listQuotationTemplates,
  type Customer,
  type Product,
  type Quotation,
  type QuotationStatus,
  type QuotationTaxMode,
  type Template,
} from "./api"

export const quotationFormSchema = z
  .object({
    companyId: z.number(),
    customerMode: z.enum(["existing", "manual"]),
    existingCustomerId: z.coerce.number().nullable().optional(),
    manualCustomerName: z.string().optional(),
    manualCustomerEmail: z.string().optional(),
    manualCustomerPhone: z.string().optional(),
    manualCustomerAddress: z.string().optional(),

    name: z.string().min(1, "Quotation name is required"),
    quote_number: z.string().min(1, "Quote number is required"),
    description: z.string().optional(),
    currency: z.string().min(1, "Currency is required"),
    selected_template: z.coerce.number().nullable().optional(),
    status: z.enum(["draft", "sent", "approved", "rejected", "expired"]),
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
      .min(1, "Add at least one line item"),
  })
  .superRefine((data, ctx) => {
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

export type QuotationFormValues = z.infer<typeof quotationFormSchema>

type Props = {
  mode: "create" | "edit"
  initialValues: QuotationFormValues
  onSubmit: (values: QuotationFormValues, removedLineIds: number[]) => Promise<void>
  submitting?: boolean
}

function money(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : "0.00"
}

function makeQuoteNumber() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const random = Math.floor(Math.random() * 900 + 100)
  return `QUO-${y}${m}${d}-${random}`
}

function SearchSelect<T extends { id: number; name: string }>({
  value,
  placeholder,
  searchPlaceholder,
  items,
  loading,
  open,
  onOpenChange,
  onSearch,
  onSelect,
  renderExtra,
}: {
  value?: string
  placeholder: string
  searchPlaceholder: string
  items: T[]
  loading?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onSearch: (term: string) => void
  onSelect: (item: T) => void
  renderExtra?: React.ReactNode
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-between rounded-2xl border-slate-200 bg-white"
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[420px] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} onValueChange={onSearch} />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching..." : "No results found."}
            </CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onSelect(item)
                    onOpenChange(false)
                  }}
                >
                  <span className="truncate">{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {renderExtra ? <div className="border-t p-2">{renderExtra}</div> : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default function QuotationForm({
  mode,
  initialValues,
  onSubmit,
  submitting = false,
}: Props) {
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [removedLineIds, setRemovedLineIds] = React.useState<number[]>([])

  const [templates, setTemplates] = React.useState<Template[]>([])
  const [customerSearchOpen, setCustomerSearchOpen] = React.useState(false)
  const [productOpenIndex, setProductOpenIndex] = React.useState<number | null>(null)

  const [customerSearch, setCustomerSearch] = React.useState("")
  const [customerResults, setCustomerResults] = React.useState<Customer[]>([])
  const [customerLoading, setCustomerLoading] = React.useState(false)

  const [productSearch, setProductSearch] = React.useState<Record<number, string>>({})
  const [productResults, setProductResults] = React.useState<Record<number, Product[]>>({})
  const [productLoading, setProductLoading] = React.useState<Record<number, boolean>>({})

  const [customerDialogOpen, setCustomerDialogOpen] = React.useState(false)
  const [productDialogOpen, setProductDialogOpen] = React.useState(false)
  const [productDialogLineIndex, setProductDialogLineIndex] = React.useState<number | null>(null)

  const [manualCustomer, setManualCustomer] = React.useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
  })

  const [manualProduct, setManualProduct] = React.useState({
    name: "",
    description: "",
    sku: "",
    default_price: "0.00",
  })

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: initialValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  })

  const lines = form.watch("lines")
  const customerMode = form.watch("customerMode")
  const selectedCustomerId = form.watch("existingCustomerId")
  const taxMode = form.watch("tax_mode")
  const taxRateValue = Number(form.watch("tax_rate") || 0)

  React.useEffect(() => {
    const loadTemplates = async () => {
      const data = await listQuotationTemplates({
        company: initialValues.companyId,
      })
      setTemplates(data.results)
    }

    loadTemplates().catch(console.error)
  }, [initialValues.companyId])

  React.useEffect(() => {
    const timeout = window.setTimeout(async () => {
      if (customerMode !== "existing") return
      try {
        setCustomerLoading(true)
        const data = await listCustomers({
          company: initialValues.companyId,
          search: customerSearch,
          limit: 8,
          offset: 0,
        })
        setCustomerResults(data.results)
      } catch (error) {
        console.error(error)
      } finally {
        setCustomerLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [customerMode, customerSearch, initialValues.companyId])

  React.useEffect(() => {
    if (customerMode === "existing" && selectedCustomerId && !customerResults.some((c) => c.id === selectedCustomerId)) {
      listCustomers({
        company: initialValues.companyId,
        limit: 8,
        offset: 0,
      })
        .then((data) => setCustomerResults(data.results))
        .catch(console.error)
    }
  }, [customerMode, selectedCustomerId, customerResults, initialValues.companyId])

  React.useEffect(() => {
    if (productOpenIndex === null) return
    const term = productSearch[productOpenIndex] || ""

    const timeout = window.setTimeout(async () => {
      try {
        setProductLoading((prev) => ({ ...prev, [productOpenIndex]: true }))
        const data = await listProducts({
          company: initialValues.companyId,
          search: term,
          limit: 8,
          offset: 0,
        })
        setProductResults((prev) => ({ ...prev, [productOpenIndex]: data.results }))
      } catch (error) {
        console.error(error)
      } finally {
        setProductLoading((prev) => ({ ...prev, [productOpenIndex]: false }))
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [productOpenIndex, productSearch, initialValues.companyId])

  const selectedCustomer = customerResults.find((item) => item.id === selectedCustomerId) || null

  const subtotalRaw = lines.reduce((sum, line) => {
    const qty = Number(line.quantity || 0)
    const unit = Number(line.unit_price || 0)
    return sum + qty * unit
  }, 0)

  const taxRateFraction = taxRateValue / 100

  const totals = React.useMemo(() => {
    if (taxMode === "inclusive") {
      const subtotal = taxRateFraction > 0 ? subtotalRaw / (1 + taxRateFraction) : subtotalRaw
      const taxTotal = subtotalRaw - subtotal
      return {
        subtotal: subtotal,
        taxTotal,
        grandTotal: subtotalRaw,
      }
    }

    const taxTotal = subtotalRaw * taxRateFraction
    return {
      subtotal: subtotalRaw,
      taxTotal,
      grandTotal: subtotalRaw + taxTotal,
    }
  }, [subtotalRaw, taxMode, taxRateFraction])

  const handleRemoveLine = (index: number) => {
    const line = form.getValues(`lines.${index}`)
    if (line?.id) {
      setRemovedLineIds((prev) => [...prev, line.id])
    }
    remove(index)
  }

  const handleSubmit = async (values: QuotationFormValues) => {
    try {
      setSubmitError(null)
      await onSubmit(values, removedLineIds)
    } catch (error) {
      console.error(error)
      setSubmitError(error instanceof Error ? error.message : "Failed to save quotation.")
    }
  }

  const createCustomerInline = async () => {
    try {
      const customer = await createCustomer({
        company: initialValues.companyId,
        name: manualCustomer.name.trim(),
        email: manualCustomer.email.trim(),
        phone_number: manualCustomer.phone_number.trim(),
        address: manualCustomer.address.trim(),
      })

      setCustomerResults((prev) => [customer, ...prev])
      form.setValue("customerMode", "existing")
      form.setValue("existingCustomerId", customer.id)
      setCustomerDialogOpen(false)
      setManualCustomer({ name: "", email: "", phone_number: "", address: "" })
    } catch (error) {
      console.error(error)
    }
  }

  const createProductInline = async () => {
    if (productDialogLineIndex === null) return

    try {
      const product = await createProduct({
        company: initialValues.companyId,
        name: manualProduct.name.trim(),
        description: manualProduct.description.trim(),
        sku: manualProduct.sku.trim(),
        default_price: manualProduct.default_price,
      })

      form.setValue(`lines.${productDialogLineIndex}.product`, product.id)
      form.setValue(
        `lines.${productDialogLineIndex}.description`,
        product.description?.trim() || product.name
      )
      form.setValue(`lines.${productDialogLineIndex}.unit_price`, product.default_price)
      setProductDialogOpen(false)
      setManualProduct({ name: "", description: "", sku: "", default_price: "0.00" })
      setProductDialogLineIndex(null)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {submitError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Customer</h2>
          </div>

          <div className="mb-4 flex gap-3">
            <Button
              type="button"
              variant={customerMode === "existing" ? "default" : "outline"}
              className="rounded-2xl"
              onClick={() => form.setValue("customerMode", "existing")}
            >
              Select customer
            </Button>
            <Button
              type="button"
              variant={customerMode === "manual" ? "default" : "outline"}
              className="rounded-2xl"
              onClick={() => form.setValue("customerMode", "manual")}
            >
              Add manually
            </Button>
          </div>

          {customerMode === "existing" ? (
            <div className="space-y-3">
              <Field>
                <FieldLabel>Customer</FieldLabel>
                <SearchSelect<Customer>
                  value={selectedCustomer ? selectedCustomer.name : undefined}
                  placeholder="Search customer..."
                  searchPlaceholder="Search customers..."
                  items={customerResults}
                  loading={customerLoading}
                  open={customerSearchOpen}
                  onOpenChange={setCustomerSearchOpen}
                  onSearch={setCustomerSearch}
                  onSelect={(customer) => {
                    form.setValue("existingCustomerId", customer.id)
                  }}
                  renderExtra={
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start rounded-xl"
                      onClick={() => {
                        setCustomerDialogOpen(true)
                        setCustomerSearchOpen(false)
                      }}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add new customer
                    </Button>
                  }
                />
                {form.formState.errors.existingCustomerId ? (
                  <FieldError errors={[form.formState.errors.existingCustomerId]} />
                ) : null}
              </Field>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="manualCustomerName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Customer name</FieldLabel>
                    <Input {...field} className="rounded-2xl" placeholder="Acme Ltd" />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                name="manualCustomerEmail"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Email</FieldLabel>
                    <Input {...field} className="rounded-2xl" placeholder="billing@acme.com" />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                name="manualCustomerPhone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Phone</FieldLabel>
                    <Input {...field} className="rounded-2xl" placeholder="+90 555 000 00 00" />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
              <Controller
                name="manualCustomerAddress"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="md:col-span-2">
                    <FieldLabel>Address</FieldLabel>
                    <Textarea {...field} className="min-h-[100px] rounded-2xl" />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Quotation setup</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Quotation title</FieldLabel>
                  <Input {...field} className="rounded-2xl" placeholder="Website redesign proposal" />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              name="quote_number"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Quote number</FieldLabel>
                  <div className="flex gap-2">
                    <Input {...field} className="rounded-2xl" placeholder="QUO-20260416-100" />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => form.setValue("quote_number", makeQuoteNumber())}
                    >
                      Generate
                    </Button>
                  </div>
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              name="currency"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Currency</FieldLabel>
                  <Input {...field} className="rounded-2xl" placeholder="USD" />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />

            <Controller
              name="issue_date"
              control={form.control}
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
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Valid until</FieldLabel>
                  <Input {...field} type="date" className="rounded-2xl" />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
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
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">Default quotation template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            />

            {mode === "edit" ? (
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <select
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value as QuotationStatus)}
                    >
                      <option value="draft">draft</option>
                      <option value="sent">sent</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                      <option value="expired">expired</option>
                    </select>
                  </Field>
                )}
              />
            ) : null}

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="xl:col-span-3">
                  <FieldLabel>Description / client notes</FieldLabel>
                  <Textarea
                    {...field}
                    className="min-h-[110px] rounded-2xl"
                    placeholder="Visible notes, proposal summary, deliverables, or commercial terms."
                  />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Taxation</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Controller
              name="tax_mode"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Tax handling</FieldLabel>
                  <select
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value as QuotationTaxMode)}
                  >
                    <option value="exclusive">Tax added on top</option>
                    <option value="inclusive">Prices include tax</option>
                  </select>
                  <FieldDescription>
                    Standard business mode for VAT/GST calculation.
                  </FieldDescription>
                </Field>
              )}
            />

            <Controller
              name="tax_label"
              control={form.control}
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
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tax rate (%)</FieldLabel>
                  <Input {...field} className="rounded-2xl" placeholder="16.00" />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {taxMode === "inclusive"
              ? "Prices entered in line items already include tax. The tax amount will be extracted from the total."
              : "Tax will be added on top of the line subtotal."}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Package2 className="h-5 w-5 text-slate-700" />
              <h2 className="text-lg font-semibold text-slate-900">Line items</h2>
            </div>

            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
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

          <div className="space-y-4">
            {fields.map((fieldItem, index) => {
              const currentProducts = productResults[index] || []
              const selectedProductId = form.watch(`lines.${index}.product`)
              const selectedProduct =
                currentProducts.find((item) => item.id === selectedProductId) || null

              return (
                <div
                  key={fieldItem.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <Badge className="rounded-full border border-slate-200 bg-white text-slate-700">
                      Line {index + 1}
                    </Badge>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-rose-600 hover:text-rose-700"
                      onClick={() => handleRemoveLine(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-12">
                    <div className="xl:col-span-4">
                      <Field>
                        <FieldLabel>Product or service</FieldLabel>
                        <SearchSelect<Product>
                          value={selectedProduct ? selectedProduct.name : undefined}
                          placeholder="Search product..."
                          searchPlaceholder="Search products..."
                          items={currentProducts}
                          loading={productLoading[index]}
                          open={productOpenIndex === index}
                          onOpenChange={(open) => setProductOpenIndex(open ? index : null)}
                          onSearch={(term) =>
                            setProductSearch((prev) => ({ ...prev, [index]: term }))
                          }
                          onSelect={(product) => {
                            form.setValue(`lines.${index}.product`, product.id)
                            form.setValue(
                              `lines.${index}.description`,
                              product.description?.trim() || product.name
                            )
                            form.setValue(`lines.${index}.unit_price`, product.default_price)
                          }}
                          renderExtra={
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start rounded-xl"
                              onClick={() => {
                                setProductDialogLineIndex(index)
                                setProductDialogOpen(true)
                                setProductOpenIndex(null)
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add new product
                            </Button>
                          }
                        />
                      </Field>
                    </div>

                    <div className="xl:col-span-4">
                      <Controller
                        name={`lines.${index}.description`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Description</FieldLabel>
                            <Input
                              {...field}
                              className="rounded-2xl"
                              placeholder="Line description"
                            />
                            {fieldState.invalid ? (
                              <FieldError errors={[fieldState.error]} />
                            ) : null}
                          </Field>
                        )}
                      />
                    </div>

                    <div className="xl:col-span-2">
                      <Controller
                        name={`lines.${index}.quantity`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Quantity</FieldLabel>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              className="rounded-2xl"
                            />
                            {fieldState.invalid ? (
                              <FieldError errors={[fieldState.error]} />
                            ) : null}
                          </Field>
                        )}
                      />
                    </div>

                    <div className="xl:col-span-2">
                      <Controller
                        name={`lines.${index}.unit_price`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel>Unit price</FieldLabel>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              className="rounded-2xl"
                            />
                            {fieldState.invalid ? (
                              <FieldError errors={[fieldState.error]} />
                            ) : null}
                          </Field>
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-4 text-right text-sm text-slate-500">
                    Line total:{" "}
                    <span className="font-medium text-slate-900">
                      {money(
                        Number(form.watch(`lines.${index}.quantity`) || 0) *
                          Number(form.watch(`lines.${index}.unit_price`) || 0)
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Totals</h2>
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
                <span className="text-base font-semibold text-slate-900">
                  {taxMode === "inclusive" ? "Total (tax included)" : "Grand total"}
                </span>
                <span className="text-xl font-semibold text-slate-900">
                  {money(totals.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={submitting} className="rounded-2xl">
            {submitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Create quotation"
              : "Save changes"}
          </Button>
        </div>
      </form>

      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="rounded-3xl bg-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add customer</DialogTitle>
            <DialogDescription>
              Quickly create a customer without leaving the quotation flow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Input
              value={manualCustomer.name}
              onChange={(e) => setManualCustomer((v) => ({ ...v, name: e.target.value }))}
              placeholder="Customer name"
              className="rounded-2xl"
            />
            <Input
              value={manualCustomer.email}
              onChange={(e) => setManualCustomer((v) => ({ ...v, email: e.target.value }))}
              placeholder="Email"
              className="rounded-2xl"
            />
            <Input
              value={manualCustomer.phone_number}
              onChange={(e) =>
                setManualCustomer((v) => ({ ...v, phone_number: e.target.value }))
              }
              placeholder="Phone"
              className="rounded-2xl"
            />
            <Textarea
              value={manualCustomer.address}
              onChange={(e) =>
                setManualCustomer((v) => ({ ...v, address: e.target.value }))
              }
              className="rounded-2xl"
              placeholder="Address"
            />

            <div className="flex justify-end">
              <Button onClick={createCustomerInline} className="rounded-2xl">
                Create customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="rounded-3xl bg-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add product</DialogTitle>
            <DialogDescription>
              Create a reusable product or service and apply it to this line item.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Input
              value={manualProduct.name}
              onChange={(e) => setManualProduct((v) => ({ ...v, name: e.target.value }))}
              placeholder="Product or service name"
              className="rounded-2xl"
            />
            <Input
              value={manualProduct.sku}
              onChange={(e) => setManualProduct((v) => ({ ...v, sku: e.target.value }))}
              placeholder="SKU"
              className="rounded-2xl"
            />
            <Input
              value={manualProduct.default_price}
              onChange={(e) =>
                setManualProduct((v) => ({ ...v, default_price: e.target.value }))
              }
              placeholder="Default price"
              className="rounded-2xl"
            />
            <Textarea
              value={manualProduct.description}
              onChange={(e) =>
                setManualProduct((v) => ({ ...v, description: e.target.value }))
              }
              className="rounded-2xl"
              placeholder="Description"
            />

            <div className="flex justify-end">
              <Button onClick={createProductInline} className="rounded-2xl">
                Create product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}