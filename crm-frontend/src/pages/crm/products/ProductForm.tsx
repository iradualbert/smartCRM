import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

import {
  productSchema,
  type ProductFormValues,
  type ApiValidationError,
} from "./api"

type Props = {
  initialValues: ProductFormValues
  onSubmit: (values: ProductFormValues) => Promise<void>
  submitLabel?: string
}

export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel = "Save product",
}: Props) {
  const [nonFieldError, setNonFieldError] = React.useState<string | null>(null)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialValues,
  })

  const handleSubmit = async (values: ProductFormValues) => {
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

          form.setError(key as keyof ProductFormValues, {
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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      {nonFieldError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {nonFieldError}
        </div>
      ) : null}

      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Name</FieldLabel>
            <Input {...field} className="rounded-2xl" placeholder="Website Design" />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="sku"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>SKU</FieldLabel>
            <Input {...field} className="rounded-2xl" placeholder="WD-001" />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="default_price"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Default price</FieldLabel>
            <Input
              {...field}
              type="number"
              min="0"
              step="0.01"
              className="rounded-2xl"
              placeholder="0.00"
            />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              {...field}
              className="min-h-[110px] rounded-2xl"
              placeholder="Short product or service description"
            />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="rounded-2xl"
        >
          {form.formState.isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}