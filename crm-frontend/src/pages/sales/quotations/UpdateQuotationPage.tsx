import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, PencilLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import QuotationForm, { type QuotationFormValues } from "./QuotationForm"
import { getQuotation, updateQuotationWithLines, type Quotation } from "./api"

export default function UpdateQuotationPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quotation, setQuotation] = React.useState<Quotation | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    const run = async () => {
      if (!id) return

      try {
        setLoading(true)
        setSubmitError(null)
        const data = await getQuotation(id)
        setQuotation(data)
      } catch (error) {
        console.error(error)
        setSubmitError("Failed to load quotation.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6 md:p-8 text-sm text-slate-500">
        Loading quotation editor...
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="mx-auto max-w-5xl p-6 md:p-8 text-sm text-rose-700">
        {submitError || "Quotation not found."}
      </div>
    )
  }

  const initialValues: QuotationFormValues = {
    companyId: quotation.company ?? 0,
    customerMode: "existing",
    existingCustomerId: quotation.customer,
    manualCustomerName: "",
    manualCustomerEmail: "",
    manualCustomerPhone: "",
    manualCustomerAddress: "",

    name: quotation.name || "",
    quote_number: quotation.quote_number || "",
    description: quotation.description || "",
    currency: quotation.currency || "USD",
    selected_template: quotation.selected_template ?? null,
    status: quotation.status,
    issue_date: quotation.issue_date || "",
    valid_until: quotation.valid_until || "",

    tax_mode: quotation.tax_mode ?? "exclusive",
    tax_label: quotation.tax_label ?? "VAT",
    tax_rate: quotation.tax_rate ?? "0.00",

    lines: (quotation.lines ?? []).map((line) => ({
      id: line.id,
      product: line.product ?? null,
      description: line.description || "",
      quantity: line.quantity,
      unit_price: line.unit_price,
    })),
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            Quotation revision
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <PencilLine className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Edit quotation
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Refine the customer, structure, tax settings, and line items before sending.
              </p>
            </div>
          </div>
        </div>

        <Button asChild variant="outline" className="rounded-2xl">
          <Link to={`/quotations/${quotation.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to quotation
          </Link>
        </Button>
      </div>

      <QuotationForm
        mode="edit"
        initialValues={initialValues}
        submitting={submitting}
        onSubmit={async (values, removedLineIds) => {
          try {
            setSubmitting(true)
            setSubmitError(null)

            const updated = await updateQuotationWithLines({
              quotationId: quotation.id,
              quotation: {
                name: values.name,
                quote_number: values.quote_number,
                description: values.description || "",
                currency: values.currency || "USD",
                selected_template: values.selected_template ?? null,
                status: values.status,
                issue_date: values.issue_date || null,
                valid_until: values.valid_until || null,
                tax_mode: values.tax_mode,
                tax_label: values.tax_label,
                tax_rate: values.tax_rate,
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
          } finally {
            setSubmitting(false)
          }
        }}
      />

      {submitError ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      ) : null}
    </div>
  )
}