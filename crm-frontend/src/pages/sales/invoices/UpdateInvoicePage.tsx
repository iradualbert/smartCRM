import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, PencilLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getInvoice,
  updateInvoiceWithLines,
  type Invoice,
  type InvoiceStatus,
} from "./api"
import InvoiceForm, { type InvoiceFormValues } from "./InvoiceForm"

const UpdateInvoicePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [invoice, setInvoice] = React.useState<Invoice | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const run = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        const data = await getInvoice(id)
        setInvoice(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load invoice.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [id])

  const handleSubmit = async (values: InvoiceFormValues, removedLineIds: number[]) => {
    if (!id) return

    const updated = await updateInvoiceWithLines({
      invoiceId: Number(id),
      invoice: {
        proforma: values.proforma,
        invoice_number: values.invoice_number,
        currency: values.currency || "USD",
        selected_template: values.selected_template ?? null,
        status: values.status as InvoiceStatus,
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

    navigate(`/invoices/${updated.id}`)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6 text-sm text-slate-500">
        Loading invoice editor...
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error || "Invoice not found."}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700 ring-1 ring-indigo-200">
            <PencilLine className="mr-2 h-4 w-4" />
            Edit invoice
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Update Invoice
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Update status, line items, template, and totals.
          </p>
        </div>

        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={() => navigate(`/invoices/${invoice.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to detail
        </Button>
      </div>

      <InvoiceForm
        mode="edit"
        initialInvoice={invoice}
        initialValues={{
          companyId: invoice.company ?? 0,
          proforma: invoice.proforma,
          invoice_number: invoice.invoice_number,
          currency: invoice.currency ?? "USD",
          selected_template: invoice.selected_template ?? null,
          status: invoice.status,
          lines: (invoice.lines ?? []).map((line) => ({
            id: line.id,
            product: line.product ?? null,
            description: line.description || "",
            quantity: line.quantity,
            unit_price: line.unit_price,
          })),
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/invoices/${invoice.id}`)}
      />
    </div>
  )
}

export default UpdateInvoicePage