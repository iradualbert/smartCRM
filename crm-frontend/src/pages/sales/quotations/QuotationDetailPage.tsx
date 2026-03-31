import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  createProformaFromQuotation,
  generateQuotationPdf,
  getQuotation,
  quotationPdfUrl,
  regenerateQuotationPdf,
  updateQuotation,
  type Quotation,
  type QuotationStatus,
} from "./api"

function StatusBadge({ status }: { status: QuotationStatus }) {
  const classes: Record<QuotationStatus, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    expired: "bg-amber-100 text-amber-700",
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classes[status]}`}>
      {status}
    </span>
  )
}

function createProformaNumberFromQuote(quoteNumber: string) {
  if (!quoteNumber) return `PRO-${Date.now()}`
  return quoteNumber.replace(/^QUO/i, "PRO")
}

const QuotationDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quotation, setQuotation] = React.useState<Quotation | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  const loadQuotation = React.useCallback(async () => {
    if (!id) return
    const data = await getQuotation(id)
    setQuotation(data)
  }, [id])

  React.useEffect(() => {
    const run = async () => {
      if (!id) {
        setError("Missing quotation id.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        await loadQuotation()
      } catch (err) {
        console.error(err)
        setError("Failed to load quotation.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [id, loadQuotation])

  const handleStatusChange = async (status: QuotationStatus) => {
    if (!quotation) return
    try {
      setActionLoading(`status:${status}`)
      const updated = await updateQuotation(quotation.id, { status })
      setQuotation(updated)
    } catch (error) {
      console.error(error)
      setError("Failed to update status.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleGeneratePdf = async (mode: "generate" | "regenerate") => {
    if (!quotation) return
    try {
      setActionLoading(mode)
      if (mode === "generate") {
        await generateQuotationPdf(quotation.id)
      } else {
        await regenerateQuotationPdf(quotation.id)
      }
      await loadQuotation()
    } catch (error) {
      console.error(error)
      setError("Failed to update PDF.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateProforma = async () => {
    if (!quotation) return
    try {
      setActionLoading("proforma")
      await createProformaFromQuotation({
        quotation: quotation.id,
        company: quotation.company ?? 1,
        customer: quotation.customer,
        proforma_number: createProformaNumberFromQuote(quotation.quote_number),
        currency: quotation.currency ?? undefined,
      })
    } catch (error) {
      console.error(error)
      setError("Failed to create proforma.")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          Loading quotation...
        </div>
      </div>
    )
  }

  if (error || !quotation) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || "Quotation not found."}
        </div>
      </div>
    )
  }

  const lines = quotation.lines ?? []

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold">{quotation.name}</h1>
            <StatusBadge status={quotation.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Quotation {quotation.quote_number}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={`/quotations/${quotation.id}/edit`}>Edit</Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleGeneratePdf("generate")}
            disabled={actionLoading !== null}
          >
            {actionLoading === "generate" ? "Generating..." : "Generate PDF"}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleGeneratePdf("regenerate")}
            disabled={actionLoading !== null}
          >
            {actionLoading === "regenerate" ? "Regenerating..." : "Regenerate PDF"}
          </Button>

          <Button asChild variant="outline">
            <a href={quotationPdfUrl(quotation.id)} target="_blank" rel="noreferrer">
              Open PDF
            </a>
          </Button>

          <Button
            variant="outline"
            onClick={handleCreateProforma}
            disabled={actionLoading !== null}
          >
            {actionLoading === "proforma" ? "Creating..." : "Create Proforma"}
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["draft", "sent", "approved", "rejected", "expired"] as QuotationStatus[]).map(
          (status) => (
            <Button
              key={status}
              variant={quotation.status === status ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange(status)}
              disabled={actionLoading !== null}
            >
              {actionLoading === `status:${status}` ? "Saving..." : `Mark ${status}`}
            </Button>
          )
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Quotation Summary</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-1 text-sm text-muted-foreground">Quote Number</div>
                <div className="font-medium">{quotation.quote_number}</div>
              </div>

              <div>
                <div className="mb-1 text-sm text-muted-foreground">Currency</div>
                <div className="font-medium">{quotation.currency || "—"}</div>
              </div>

              <div>
                <div className="mb-1 text-sm text-muted-foreground">Customer Id</div>
                <div className="font-medium">{quotation.customer}</div>
              </div>

              <div>
                <div className="mb-1 text-sm text-muted-foreground">Template</div>
                <div className="font-medium">{quotation.selected_template || "—"}</div>
              </div>

              <div className="md:col-span-2">
                <div className="mb-1 text-sm text-muted-foreground">Description</div>
                <div className="font-medium">{quotation.description || "—"}</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Line Items</h2>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="w-14 px-3 py-3 font-medium">#</th>
                    <th className="px-3 py-3 font-medium">Description</th>
                    <th className="w-[120px] px-3 py-3 font-medium">Qty</th>
                    <th className="w-[140px] px-3 py-3 font-medium">Unit Price</th>
                    <th className="w-[140px] px-3 py-3 font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={line.id} className="border-t">
                      <td className="px-3 py-3 text-muted-foreground">{index + 1}</td>
                      <td className="px-3 py-3">{line.description || "—"}</td>
                      <td className="px-3 py-3 text-right">{line.quantity}</td>
                      <td className="px-3 py-3 text-right">{line.unit_price}</td>
                      <td className="px-3 py-3 text-right font-medium">{line.line_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">Totals</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{quotation.subtotal}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{quotation.total}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">PDF Status</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Needs Regeneration</span>
                <span className="font-medium">
                  {quotation.pdf_needs_regeneration ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Generated At</span>
                <span className="font-medium">
                  {quotation.pdf_generated_at
                    ? new Date(quotation.pdf_generated_at).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">Metadata</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(quotation.created_at).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">
                  {new Date(quotation.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default QuotationDetailPage