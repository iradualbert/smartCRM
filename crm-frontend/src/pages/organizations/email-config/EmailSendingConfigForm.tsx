import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

import type {
  EmailSendingConfig,
  EmailSendingConfigCreatePayload,
  EmailSendingConfigOwnerType,
  EmailSendingConfigSecurityType,
  EmailSendingConfigUpdatePayload,
  Id,
} from "./api"
import { applyApiFieldErrors, getApiErrorMessages } from "./errors"

const schema = z
  .object({
    owner_type: z.enum(["company", "user"]),
    company: z.string().nullable().optional(),

    name: z.string().min(1, "Configuration name is required"),
    from_name: z.string().optional(),
    from_email: z.string().email("Enter a valid from email"),

    smtp_host: z.string().min(1, "SMTP host is required"),
    smtp_port: z.coerce.number().int().positive("SMTP port must be a positive number"),
    smtp_username: z.string().min(1, "SMTP username is required"),
    smtp_password: z.string().optional(),

    security_type: z.enum(["tls", "ssl", "none"]),

    is_active: z.boolean(),
    is_default: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.owner_type === "company" && !data.company) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["company"],
        message: "Organization is required for organization configs.",
      })
    }

    if (data.owner_type === "user") {
      return
    }
  })

export type EmailSendingConfigFormValues = z.infer<typeof schema>

type Props = {
  mode: "create" | "edit"
  currentOrganizationId?: Id | null
  initialConfig?: EmailSendingConfig | null
  submitting?: boolean
  onSubmit: (
    payload: EmailSendingConfigCreatePayload | EmailSendingConfigUpdatePayload
  ) => Promise<void>
  onCancel?: () => void
}

function buildDefaultValues(
  mode: "create" | "edit",
  currentOrganizationId?: Id | null,
  initialConfig?: EmailSendingConfig | null
): EmailSendingConfigFormValues {
  if (mode === "edit" && initialConfig) {
    return {
      owner_type: initialConfig.owner_type,
      company: initialConfig.company ?? null,
      name: initialConfig.name,
      from_name: initialConfig.from_name ?? "",
      from_email: initialConfig.from_email,
      smtp_host: initialConfig.smtp_host,
      smtp_port: initialConfig.smtp_port,
      smtp_username: initialConfig.smtp_username,
      smtp_password: "",
      security_type: initialConfig.security_type,
      is_active: initialConfig.is_active,
      is_default: initialConfig.is_default,
    }
  }

  return {
    owner_type: currentOrganizationId ? "company" : "user",
    company: currentOrganizationId ?? null,
    name: "",
    from_name: "",
    from_email: "",
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    security_type: "tls",
    is_active: true,
    is_default: false,
  }
}

export default function EmailSendingConfigForm({
  mode,
  currentOrganizationId,
  initialConfig,
  submitting = false,
  onSubmit,
  onCancel,
}: Props) {
  const form = useForm<EmailSendingConfigFormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(mode, currentOrganizationId, initialConfig),
  })

  const ownerType = form.watch("owner_type")
  const [submitErrors, setSubmitErrors] = React.useState<string[]>([])

  React.useEffect(() => {
    if (ownerType === "company" && currentOrganizationId) {
      form.setValue("company", currentOrganizationId)
    }
    if (ownerType === "user") {
      form.setValue("company", null)
    }
  }, [ownerType, currentOrganizationId, form])

  const handleSubmit = async (values: EmailSendingConfigFormValues) => {
    try {
      setSubmitErrors([])
      form.clearErrors()

      if (mode === "create") {
        const payload: EmailSendingConfigCreatePayload = {
          owner_type: values.owner_type as EmailSendingConfigOwnerType,
          company: values.owner_type === "company" ? values.company ?? null : null,
          name: values.name.trim(),
          from_name: values.from_name?.trim() || "",
          from_email: values.from_email.trim(),
          smtp_host: values.smtp_host.trim(),
          smtp_port: values.smtp_port,
          smtp_username: values.smtp_username.trim(),
          smtp_password: values.smtp_password?.trim() || "",
          security_type: values.security_type as EmailSendingConfigSecurityType,
          is_active: values.is_active,
          is_default: values.is_default,
        }

        await onSubmit(payload)
        return
      }

      const payload: EmailSendingConfigUpdatePayload = {
        owner_type: values.owner_type as EmailSendingConfigOwnerType,
        company: values.owner_type === "company" ? values.company ?? null : null,
        name: values.name.trim(),
        from_name: values.from_name?.trim() || "",
        from_email: values.from_email.trim(),
        smtp_host: values.smtp_host.trim(),
        smtp_port: values.smtp_port,
        smtp_username: values.smtp_username.trim(),
        security_type: values.security_type as EmailSendingConfigSecurityType,
        is_active: values.is_active,
        is_default: values.is_default,
      }

      if (values.smtp_password?.trim()) {
        payload.smtp_password = values.smtp_password.trim()
      }

      await onSubmit(payload)
    } catch (error) {
      applyApiFieldErrors(error, form.setError)
      setSubmitErrors(getApiErrorMessages(error))
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {submitErrors.length ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <ul className="list-disc space-y-1 pl-5">
            {submitErrors.map((message, index) => (
              <li key={`${message}-${index}`}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          name="owner_type"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Scope</FieldLabel>
              <select
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="company">Organization</option>
                <option value="user">Personal</option>
              </select>
              <FieldDescription>
                Organization configs can be shared. Personal configs are only for you.
              </FieldDescription>
            </Field>
          )}
        />

        <Controller
          name="company"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Organization</FieldLabel>
              <Input
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
                className="rounded-2xl bg-slate-50"
                placeholder="Current organization id"
                readOnly={ownerType === "company" && Boolean(currentOrganizationId)}
                disabled={ownerType !== "company"}
              />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Configuration name</FieldLabel>
              <Input {...field} className="rounded-2xl" placeholder="Sales Gmail" />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          name="from_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>From name</FieldLabel>
              <Input {...field} className="rounded-2xl" placeholder="Acme Sales" />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          name="from_email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>From email</FieldLabel>
              <Input {...field} className="rounded-2xl" placeholder="sales@acme.com" />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          name="smtp_host"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>SMTP host</FieldLabel>
              <Input {...field} className="rounded-2xl" placeholder="smtp.gmail.com" />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          name="smtp_port"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>SMTP port</FieldLabel>
              <Input
                type="number"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="rounded-2xl"
                placeholder="587"
              />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          name="smtp_username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>SMTP username</FieldLabel>
              <Input {...field} className="rounded-2xl" placeholder="smtp-user" />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          name="smtp_password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{mode === "edit" ? "New SMTP password" : "SMTP password"}</FieldLabel>
              <Input
                {...field}
                type="password"
                className="rounded-2xl"
                placeholder={
                  mode === "edit"
                    ? "Leave blank to keep current password"
                    : "Enter SMTP password"
                }
              />
              <FieldDescription>
                {mode === "edit"
                  ? initialConfig?.masked_password
                    ? `Current password: ${initialConfig.masked_password}`
                    : "No password stored yet."
                  : "Stored securely by the backend."}
              </FieldDescription>
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />

        <Controller
          name="security_type"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Security</FieldLabel>
              <select
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </Field>
          )}
        />

        <Controller
          name="is_active"
          control={form.control}
          render={({ field }) => (
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <div>
                <div className="text-sm font-medium text-slate-900">Active</div>
                <div className="text-xs text-slate-500">Allow this config to be used for sending.</div>
              </div>
            </label>
          )}
        />

        <Controller
          name="is_default"
          control={form.control}
          render={({ field }) => (
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <div>
                <div className="text-sm font-medium text-slate-900">Default</div>
                <div className="text-xs text-slate-500">Prefer this config in email compose flows.</div>
              </div>
            </label>
          )}
        />
      </div>

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" className="rounded-2xl" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}

        <Button type="submit" className="rounded-2xl" disabled={submitting}>
          {submitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
            ? "Create configuration"
            : "Save changes"}
        </Button>
      </div>
    </form>
  )
}