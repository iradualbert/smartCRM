import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, PencilLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import QuotationForm, { type QuotationFormValues } from "./QuotationForm"
import {
  getQuotation,
  updateQuotationWithLines,
  type Quotation,
} from "./api"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

function buildInitialValues(quotation: Quotation): QuotationFormValues {
  return {
    companyId: quotation.company ?? 0,

    customerMode: "existing",
    existingCustomerId: quotation.customer ?? null,
    manualCustomerName: "",
    manualCustomerEmail: "",
    manualCustomerPhone: "",
    manualCustomerAddress: "",

    name: quotation.name || "",
    quote_number: quotation.quote_number || "",
    description: quotation.description || "",
    currency: quotation.currency || "USD",
    selected_template: quotation.selected_template ?? null,
    status: quotation.status || "draft",
    issue_date: quotation.issue_date || "",
    valid_until: quotation.valid_until || "",

    tax_mode: quotation.tax_mode ?? "exclusive",
    tax_label: quotation.tax_label ?? "VAT",
    tax_rate: quotation.tax_rate ?? "0.00",

    lines:
      quotation.lines?.length
        ? quotation.lines.map((line) => ({
            id: line.id,
            product: line.product ?? null,
            description: line.description || "",
            quantity: String(line.quantity ?? "1"),
            unit_price: String(line.unit_price ?? "0.00"),
          }))
        : [
            {
              product: null,
              description: "",
              quantity: "1",
              unit_price: "0.00",
            },
          ],
  }
}

export default function UpdateQuotationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [quotation, setQuotation] = React.useState<Quotation | null>(null)
  const [initialValues, setInitialValues] = React.useState<QuotationFormValues | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { currentOrganizationId } = useOrganizations()

  const hasLoadedRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!id || !currentOrganizationId) {
      setError("Missing quotation id or organization id.")
      setLoading(false)
      return
    }

    if (hasLoadedRef.current === id) return
    hasLoadedRef.current = id

    let isCancelled = false

    const run = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await getQuotation(id, currentOrganizationId)

        if (isCancelled) return

        setQuotation(data)
        setInitialValues(buildInitialValues(data))
      } catch (err) {
        console.error(err)
        if (!isCancelled) {
          setError("Failed to load quotation.")
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    run()

    return () => {
      isCancelled = true
    }
  }, [id, currentOrganizationId])

  const handleSubmit = async (
    values: QuotationFormValues,
    removedLineIds: number[]
  ) => {
    if (!id || !quotation) return

    try {
      setSubmitting(true)
      setError(null)

      const quotationPayload = {
        customer: values.existingCustomerId ?? quotation.customer,
        name: values.name,
        description: values.description || "",
        quote_number: values.quote_number || "",
        currency: values.currency || "USD",
        selected_template: values.selected_template ?? null,
        status: values.status,
        issue_date: values.issue_date || null,
        valid_until: values.valid_until || null,
        tax_mode: values.tax_mode,
        tax_label: values.tax_label,
        tax_rate: values.tax_rate,
      }

      const updated = await updateQuotationWithLines({
        quotationId: id as unknown as number,
        companyId: currentOrganizationId as string,
        quotation: quotationPayload,
        lines: values.lines.map((line) => ({
          id: line.id,
          product: line.product ?? null,
          description: line.description || "",
          quantity: String(line.quantity),
          unit_price: String(line.unit_price),
        })),
        removedLineIds,
      })

      navigate(`/quotations/${updated.id}`)
    } catch (err) {
      console.error(err)
      setError("Failed to update quotation.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading quotation...
        </div>
      </div>
    )
  }

  if (error || !initialValues) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error || "Quotation not found."}
        </div>

        <div className="mt-4">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/quotations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to quotations
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            Update quotation
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
                Update customer, line items, tax settings, and document details.
              </p>
            </div>
          </div>
        </div>

        <Button asChild variant="outline" className="rounded-2xl">
          <Link to={`/quotations/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to quotation
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <QuotationForm
        key={quotation?.id}
        mode="edit"
        initialValues={initialValues}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  )
}