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
  customerSchema,
  type CustomerFormValues,
  type ApiValidationError,
} from "./api"

type Props = {
  initialValues: CustomerFormValues
  onSubmit: (values: CustomerFormValues) => Promise<void>
  submitLabel?: string
}

export default function CustomerForm({
  initialValues,
  onSubmit,
  submitLabel = "Save customer",
}: Props) {
  const [nonFieldError, setNonFieldError] = React.useState<string | null>(null)

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialValues,
  })

  const handleSubmit = async (values: CustomerFormValues) => {
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

          form.setError(key as keyof CustomerFormValues, {
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
            <Input {...field} className="rounded-2xl" placeholder="Acme Ltd" />
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
            <Input {...field} type="email" className="rounded-2xl" placeholder="billing@acme.com" />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="phone_number"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Phone number</FieldLabel>
            <Input {...field} className="rounded-2xl" placeholder="+90 555 000 00 00" />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="address"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Address</FieldLabel>
            <Textarea
              {...field}
              className="min-h-[110px] rounded-2xl"
              placeholder="Client billing or business address"
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