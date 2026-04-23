import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PdfActionsMenu from "@/shared/PdfActionsMenu"
import ActivityTimeline from "@/components/ActivityTimeline"

import {
  ArrowRight,
  FileText,
  Mail,
  Pencil,
} from "lucide-react"

const api = axios

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

export default function QuotationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !currentOrganizationId) return
    fetchData()
  }, [id, currentOrganizationId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/quotations/${id}/?company=${currentOrganizationId}`, {
        withCredentials: true,
      })
      setData(res.data)
    } finally {
      setLoading(false)
    }
  }

  const createInvoice = async () => {
    try {
      setBusyAction("invoice")
      const res = await api.post(
        `/quotations/${id}/create-invoice/?company=${currentOrganizationId}`,
        {},
        { withCredentials: true }
      )
      navigate(`/invoices/${res.data.invoice_id}`)
    } finally {
      setBusyAction(null)
    }
  }

  const createProforma = async () => {
    try {
      setBusyAction("proforma")
      const res = await api.post(
        `/quotations/${id}/create-proforma/?company=${currentOrganizationId}`,
        {},
        { withCredentials: true }
      )
      navigate(`/proformas/${res.data.proforma_id}`)
    } finally {
      setBusyAction(null)
    }
  }

  const hasPdf = Boolean(data?.pdf_generated_at || data?.document)

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading quotation...</div>
  }

  if (!data) {
    return <div className="p-6 text-sm text-red-500">Quotation not found.</div>
  }

  const invoiceDetail = data.invoice_detail
  const proformaDetail = data.proforma_detail

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{data.quote_number}</h1>
            <Badge className={`px-3 py-1 text-xs capitalize ${statusColor[data.status] || ""}`}>
              {data.status}
            </Badge>
          </div>

          <p className="mt-2 text-sm text-gray-500">{data.name || "Quotation"}</p>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
            <span>Issue date: {data.issue_date || "—"}</span>
            <span>Valid until: {data.valid_until || "—"}</span>
            <span>Currency: {data.currency || "—"}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => navigate(`/quotations/${id}/email`)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send by Email
          </Button>

          <PdfActionsMenu
            entityLabel="PDF"
            hasPdf={hasPdf}
            pdfUrl={`/quotations/${id}/pdf/?company=${currentOrganizationId}`}
            generateUrl={`/quotations/${id}/generate_pdf/?company=${currentOrganizationId}`}
            regenerateUrl={`/quotations/${id}/regenerate_pdf/?company=${currentOrganizationId}`}
            onAfterGenerate={fetchData}
          />

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate(`/quotations/${id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Quotation
          </Button>

          {!proformaDetail && (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={createProforma}
              disabled={busyAction === "proforma"}
            >
              <FileText className="mr-2 h-4 w-4" />
              {busyAction === "proforma" ? "Creating…" : "Create Proforma"}
            </Button>
          )}

          {!invoiceDetail && (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={createInvoice}
              disabled={busyAction === "invoice"}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              {busyAction === "invoice" ? "Creating…" : "Create Invoice"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Bill To */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs uppercase tracking-wide text-gray-500">Bill To</h3>

            <div className="space-y-1">
              <p className="text-base font-semibold text-gray-900">{data.customer_name}</p>

              {data.customer_email ? (
                <p className="text-sm text-gray-600">{data.customer_email}</p>
              ) : null}

              {data.customer_phone_number ? (
                <p className="text-sm text-gray-600">{data.customer_phone_number}</p>
              ) : null}

              {data.customer_address ? (
                <p className="whitespace-pre-line text-sm text-gray-600">
                  {data.customer_address}
                </p>
              ) : null}
            </div>
          </div>

          {/* Related Documents */}
          {(invoiceDetail || proformaDetail) && (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-gray-800">Related Documents</h3>

              <div className="flex flex-wrap gap-4">
                {proformaDetail && (
                  <div className="flex flex-1 min-w-[200px] flex-col gap-2 rounded-xl border bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Proforma
                      </span>
                      <Badge className={`text-xs ${statusColor[proformaDetail.status] || "bg-gray-100 text-gray-700"}`}>
                        {proformaDetail.status}
                      </Badge>
                    </div>
                    <p className="font-semibold text-gray-900">{proformaDetail.number}</p>
                    <p className="text-sm text-gray-600">Total: {proformaDetail.total}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => navigate(`/proformas/${proformaDetail.id}`)}
                    >
                      <FileText className="mr-1.5 h-3.5 w-3.5" />
                      View Proforma
                    </Button>
                  </div>
                )}

                {invoiceDetail && (
                  <div className="flex flex-1 min-w-[200px] flex-col gap-2 rounded-xl border bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Invoice
                      </span>
                      <Badge className={`text-xs ${statusColor[invoiceDetail.status] || "bg-gray-100 text-gray-700"}`}>
                        {invoiceDetail.status}
                      </Badge>
                    </div>
                    <p className="font-semibold text-gray-900">{invoiceDetail.number}</p>
                    <p className="text-sm text-gray-600">Total: {invoiceDetail.total}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => navigate(`/invoices/${invoiceDetail.id}`)}
                    >
                      <FileText className="mr-1.5 h-3.5 w-3.5" />
                      View Invoice
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

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
                {(data.lines || []).map((line: any) => (
                  <tr key={line.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {line.product_name || line.description}
                      </div>

                      {line.product_sku ? (
                        <div className="text-xs text-gray-500">SKU: {line.product_sku}</div>
                      ) : null}

                      {line.description && line.product_name ? (
                        <div className="text-xs text-gray-500">{line.description}</div>
                      ) : null}
                    </td>

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
              activityUrl={`/quotations/${id}/activity/?company=${currentOrganizationId}`}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">Amounts</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{data.subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                {data.tax_label} ({data.tax_rate}%)
              </span>
              <span>{data.tax_total}</span>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
              {data.tax_mode === "inclusive"
                ? "Prices on this quotation are tax-inclusive."
                : "Tax is added on top of listed prices."}
            </div>

            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{data.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
