import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, ImagePlus, ReceiptIcon as ReceiptText, Wallet } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import {
  companySchema,
  type CompanyFormValues,
  type ApiValidationError,
} from "./api"

type Props = {
  mode: "create" | "edit"
  initialValues?: CompanyFormValues
  onSubmit: (values: CompanyFormValues) => Promise<void>
}

const defaultValues: CompanyFormValues = {
  name: "",
  legal_name: "",
  tax_number: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  supported_currencies: ["USD"],
  default_currency: "USD",
  invoice_prefix: "INV",
  quotation_prefix: "QUO",
  proforma_prefix: "PRO",
  receipt_prefix: "REC",
  delivery_note_prefix: "DN",
  is_active: true,
  logo_file: null,
  logo_url: null,
}

const prefixFields = [
  { name: "invoice_prefix", label: "Invoice" },
  { name: "quotation_prefix", label: "Quotation" },
  { name: "proforma_prefix", label: "Proforma" },
  { name: "receipt_prefix", label: "Receipt" },
  { name: "delivery_note_prefix", label: "Delivery Note" },
] as const

const supportedCurrencySuggestions = ["USD", "EUR", "GBP", "TRY", "KES", "UGX", "TZS"]

const SectionHeader = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) => (
  <div className="mb-5 flex items-start gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
      {icon}
    </div>
    <div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  </div>
)

const CompanyForm = ({ mode, initialValues, onSubmit }: Props) => {
  const [nonFieldError, setNonFieldError] = React.useState<string | null>(null)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: initialValues ?? defaultValues,
  })
  const watchedLogoFile = form.watch("logo_file")
  const watchedLogoUrl = form.watch("logo_url")
  const [logoPreview, setLogoPreview] = React.useState<string | null>(watchedLogoUrl ?? null)

  React.useEffect(() => {
    if (watchedLogoFile instanceof File) {
      const nextUrl = URL.createObjectURL(watchedLogoFile)
      setLogoPreview(nextUrl)
      return () => URL.revokeObjectURL(nextUrl)
    }
    setLogoPreview(watchedLogoUrl ?? null)
  }, [watchedLogoFile, watchedLogoUrl])

  const handleSubmit = async (values: CompanyFormValues) => {
    setNonFieldError(null)

    try {
      await onSubmit(values)
    } catch (error) {
      const apiError = error as ApiValidationError

      if (apiError?.type === "validation") {
        Object.entries(apiError.errors).forEach(([key, messages]) => {
          const message = messages[0]

          if (key === "non_field_errors") {
            setNonFieldError(message)
            return
          }

          form.setError(key as keyof CompanyFormValues, {
            type: "server",
            message,
          })
        })
        return
      }

      setNonFieldError("Something went wrong.")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      {nonFieldError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {nonFieldError}
        </div>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<Building2 className="h-5 w-5" />}
          title="Organization identity"
          description="Core business details shown across your workspace and generated documents."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="logo_file"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="md:col-span-2">
                <FieldLabel>Logo</FieldLabel>
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Organization logo preview" className="h-full w-full object-contain" />
                    ) : (
                      <Building2 className="h-8 w-8 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                      <ImagePlus className="h-4 w-4" />
                      <span>{logoPreview ? "Replace logo" : "Upload logo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null
                          field.onChange(file)
                        }}
                      />
                    </label>
                  </div>
                </div>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Organization Name</FieldLabel>
                <Input {...field} placeholder="Modura" className="rounded-2xl" />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="legal_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Legal Name</FieldLabel>
                <Input
                  {...field}
                  placeholder="Modura Group Ltd."
                  className="rounded-2xl"
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Email</FieldLabel>
                <Input
                  {...field}
                  type="email"
                  placeholder="sales@modura.com"
                  className="rounded-2xl"
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Phone</FieldLabel>
                <Input
                  {...field}
                  placeholder="+90 555 123 45 67"
                  className="rounded-2xl"
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="website"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Website</FieldLabel>
                <Input
                  {...field}
                  placeholder="https://example.com"
                  className="rounded-2xl"
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="tax_number"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Tax Number</FieldLabel>
                <Input
                  {...field}
                  placeholder="Enter tax number"
                  className="rounded-2xl"
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <div className="mt-4">
          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Address</FieldLabel>
                <Textarea
                  {...field}
                  placeholder="Street, city, region, country"
                  className="min-h-[110px] rounded-2xl"
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<Wallet className="h-5 w-5" />}
          title="Currency defaults"
          description="Choose your default currency and the set of supported currencies for this organization."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="default_currency"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Default Currency</FieldLabel>
                <Input {...field} placeholder="USD" className="rounded-2xl" />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            name="supported_currencies"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Supported Currencies</FieldLabel>
                <Input
                  value={field.value.join(", ")}
                  onChange={(e) => {
                    const values = e.target.value
                      .split(",")
                      .map((v) => v.trim().toUpperCase())
                      .filter(Boolean)
                    field.onChange(values)
                  }}
                  placeholder="USD, EUR, GBP"
                  className="rounded-2xl"
                />
                <FieldDescription>
                  Comma separated. Default currency must be included.
                </FieldDescription>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {supportedCurrencySuggestions.map((currency) => {
            const selected = form.watch("supported_currencies").includes(currency)

            return (
              <button
                key={currency}
                type="button"
                onClick={() => {
                  const current = form.getValues("supported_currencies")
                  if (current.includes(currency)) {
                    form.setValue(
                      "supported_currencies",
                      current.filter((item) => item !== currency),
                      { shouldValidate: true }
                    )
                  } else {
                    form.setValue(
                      "supported_currencies",
                      [...current, currency],
                      { shouldValidate: true }
                    )
                  }
                }}
                className="transition"
              >
                <Badge
                  className={
                    selected
                      ? "rounded-full border border-slate-900 bg-slate-900 text-white"
                      : "rounded-full border border-slate-200 bg-slate-50 text-slate-700"
                  }
                >
                  {currency}
                </Badge>
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          icon={<ReceiptText className="h-5 w-5" />}
          title="Document numbering"
          description="Set the prefixes used when numbering the documents generated by this workspace."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {prefixFields.map(({ name, label }) => (
            <Controller
              key={name}
              name={name}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{label} Prefix</FieldLabel>
                  <Input {...field} className="rounded-2xl" />
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="rounded-2xl px-6"
        >
          {form.formState.isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
            ? "Create organization"
            : "Save changes"}
        </Button>
      </div>
    </form>
  )
}

export default CompanyForm
