import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PdfActionsMenu from "@/shared/PdfActionsMenu"
import ActivityTimeline from "@/components/ActivityTimeline"

import { Mail, Pencil } from "lucide-react"
import type { Invoice, InvoiceStatus } from "./api"
import { getInvoice, updateInvoice } from "./api"

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  partially_paid: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-zinc-100 text-zinc-700",
}

const STATUS_TRANSITIONS: InvoiceStatus[] = ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"]

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()

  const [invoice, setInvoice] = React.useState<Invoice | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [busyStatus, setBusyStatus] = React.useState<string | null>(null)
  const [activityKey, setActivityKey] = React.useState(0)

  const loadInvoice = React.useCallback(async () => {
    if (!id) return
    const data = await getInvoice(id)
    setInvoice(data)
  }, [id])

  React.useEffect(() => {
    if (!id) return
    setLoading(true)
    loadInvoice().finally(() => setLoading(false))
  }, [id, loadInvoice])

  const handleStatusChange = async (s: InvoiceStatus) => {
    if (!invoice || busyStatus) return
    try {
      setBusyStatus(s)
      const updated = await updateInvoice(invoice.id, { status: s })
      setInvoice(updated)
      setActivityKey((k) => k + 1)
    } finally {
      setBusyStatus(null)
    }
  }

  const handleAfterPdf = async () => {
    await loadInvoice()
    setActivityKey((k) => k + 1)
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading invoice...</div>
  }

  if (!invoice) {
    return <div className="p-6 text-sm text-red-500">Invoice not found.</div>
  }

  const hasPdf = Boolean(invoice.pdf_generated_at || invoice.document)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{invoice.invoice_number}</h1>
            <Badge className={`px-3 py-1 text-xs capitalize ${statusColor[invoice.status] || ""}`}>
              {invoice.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
            <span>Currency: {invoice.currency || "—"}</span>
            {invoice.pdf_generated_at && (
              <span>PDF: {new Date(invoice.pdf_generated_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => navigate(`/invoices/${id}/email`)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send by Email
          </Button>

          <PdfActionsMenu
            entityLabel="PDF"
            hasPdf={hasPdf}
            pdfUrl={`/invoices/${id}/pdf/?company=${currentOrganizationId}`}
            generateUrl={`/invoices/${id}/generate_pdf/?company=${currentOrganizationId}`}
            regenerateUrl={`/invoices/${id}/regenerate_pdf/?company=${currentOrganizationId}`}
            onAfterGenerate={handleAfterPdf}
          />

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate(`/invoices/${id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Invoice
          </Button>
        </div>
      </div>

      {/* Status transitions */}
      <div className="flex flex-wrap gap-2 px-1">
        {STATUS_TRANSITIONS.map((s) => (
          <Button
            key={s}
            variant={invoice.status === s ? "default" : "outline"}
            size="sm"
            className="rounded-xl capitalize"
            onClick={() => handleStatusChange(s)}
            disabled={invoice.status === s || !!busyStatus}
          >
            {busyStatus === s ? "Saving…" : `Mark ${s.replace(/_/g, " ")}`}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Line Items */}
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="p-4 text-left">Description</th>
                  <th className="text-left">Qty</th>
                  <th className="text-left">Unit Price</th>
                  <th className="pr-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.lines ?? []).map((line) => (
                  <tr key={line.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{line.description || "—"}</td>
                    <td>{line.quantity}</td>
                    <td>{line.unit_price}</td>
                    <td className="pr-4 text-right font-medium">{line.line_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-800">Activity</h3>
            <ActivityTimeline
              key={activityKey}
              activityUrl={`/invoices/${id}/activity/?company=${currentOrganizationId}`}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">Amounts</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{invoice.subtotal}</span>
            </div>

            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{invoice.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
