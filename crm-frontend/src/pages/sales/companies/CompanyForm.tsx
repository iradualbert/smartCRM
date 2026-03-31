import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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
}

const prefixFields = [
  { name: "invoice_prefix", label: "Invoice" },
  { name: "quotation_prefix", label: "Quotation" },
  { name: "proforma_prefix", label: "Proforma" },
  { name: "receipt_prefix", label: "Receipt" },
  { name: "delivery_note_prefix", label: "Delivery Note" },
] as const

const CompanyForm = ({ mode, initialValues, onSubmit }: Props) => {
  const [nonFieldError, setNonFieldError] = React.useState<string | null>(null)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: initialValues ?? defaultValues,
  })

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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {nonFieldError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {nonFieldError}
        </div>
      )}

      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Company Name</FieldLabel>
            <Input {...field} placeholder="Modura" />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="legal_name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Legal Name</FieldLabel>
            <Input {...field} placeholder="Modura Group Ltd" />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Email</FieldLabel>
            <Input {...field} type="email" placeholder="sales@modura.com" />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="phone"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Phone</FieldLabel>
            <Input {...field} placeholder="+90 555 123 45 67" />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="website"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Website</FieldLabel>
            <Input {...field} placeholder="https://example.com" />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="address"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Address</FieldLabel>
            <Textarea {...field} />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="tax_number"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Tax Number</FieldLabel>
            <Input {...field} placeholder="Enter tax number" />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          name="default_currency"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Default Currency</FieldLabel>
              <Input {...field} placeholder="USD" />
            </Field>
          )}
        />

        <Controller
          name="supported_currencies"
          control={form.control}
          render={({ field }) => (
            <Field>
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
                placeholder="USD, EUR"
              />
              <FieldDescription>Comma separated</FieldDescription>
            </Field>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {prefixFields.map(({ name, label }) => (
          <Controller
            key={name}
            name={name}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{label} Prefix</FieldLabel>
                <Input {...field} />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Company"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}

export default CompanyForm