import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ScrollText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

import QuotationForm, { type QuotationFormValues } from "./QuotationForm"
import { createQuotationWithLines } from "./api"

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function plus14DaysIso() {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toISOString().slice(0, 10)
}

export default function CreateQuotationPage() {
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()
  const [submitting, setSubmitting] = React.useState(false)

  if (!currentOrganizationId) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-sm text-rose-700 md:p-8">
        No current organization selected.
      </div>
    )
  }

  const initialValues: QuotationFormValues = {
    companyId: String(currentOrganizationId),
    customerMode: "existing",
    existingCustomerId: null,
    manualCustomerName: "",
    manualCustomerEmail: "",
    manualCustomerPhone: "",
    manualCustomerAddress: "",

    name: "",
    quote_number: "",
    description: "",
    currency: "USD",
    selected_template: null,
    status: "draft",
    issue_date: todayIso(),
    valid_until: plus14DaysIso(),

    tax_mode: "exclusive",
    tax_label: "VAT",
    tax_rate: "0.00",

    lines: [
      {
        product: null,
        description: "",
        quantity: "1",
        unit_price: "0.00",
      },
    ],
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            Professional quotation workflow
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <ScrollText className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Create quotation
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Build a professional quotation with searchable customers, product-backed
                line items, and clear tax handling.
              </p>
            </div>
          </div>
        </div>

        <Button asChild variant="outline" className="rounded-2xl">
          <Link to="/quotations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to quotations
          </Link>
        </Button>
      </div>

      <QuotationForm
        mode="create"
        initialValues={initialValues}
        submitting={submitting}
        onSubmit={async (values) => {
          try {
            setSubmitting(true)

            const quotationPayload: Record<string, unknown> = {
              name: values.name,
              description: values.description || "",
              currency: values.currency || "USD",
              selected_template: values.selected_template ?? null,
              status: "draft",
              issue_date: values.issue_date || null,
              valid_until: values.valid_until || null,
              tax_mode: values.tax_mode,
              tax_label: values.tax_label,
              tax_rate: values.tax_rate,
            }

            if (values.quote_number?.trim()) {
              quotationPayload.quote_number = values.quote_number.trim()
            }

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
              quotation: quotationPayload,
              lines: values.lines.map((line) => ({
                product: line.product ?? null,
                description: line.description,
                quantity: line.quantity,
                unit_price: line.unit_price,
              })),
            })

            navigate(`/quotations/${quotation.id}`)
          } finally {
            setSubmitting(false)
          }
        }}
      />
    </div>
  )
}