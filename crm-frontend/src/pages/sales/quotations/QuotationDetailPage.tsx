import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Download,
  Mail,
  FileText,
  ArrowRight,
  Printer,
  RefreshCcw,
  Pencil,
} from "lucide-react"
import axios from "axios"

const api = axios

const statusColor: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-amber-100 text-amber-700",
}

export default function QuotationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    const res = await api.get(`/quotations/${id}/`)
    setData(res.data)
    setLoading(false)
  }

  const generatePDF = async (force = false) => {
    try {
      setBusyAction(force ? "regenerate" : "generate")
      await api.post(`/quotations/${id}/${force ? "regenerate_pdf" : "generate_pdf"}/`)
      window.open(`/api/quotations/${id}/pdf/`, "_blank")
      await fetchData()
    } finally {
      setBusyAction(null)
    }
  }

  const createInvoice = async () => {
    try {
      setBusyAction("invoice")
      const res = await api.post(`/quotations/${id}/create-invoice/`)
      navigate(`/invoices/${res.data.invoice_id}`)
    } finally {
      setBusyAction(null)
    }
  }

  const createProforma = async () => {
    try {
      setBusyAction("proforma")
      const res = await api.post(`/quotations/${id}/create-proforma/`)
      navigate(`/proformas/${res.data.proforma_id}`)
    } finally {
      setBusyAction(null)
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading quotation...</div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{data.quote_number}</h1>
            <Badge className={`px-3 py-1 text-xs capitalize ${statusColor[data.status]}`}>
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

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            className="justify-start rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => navigate(`/quotations/${id}/email`)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send by Email
          </Button>

          <Button
            variant="outline"
            className="justify-start rounded-xl"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Quotation
          </Button>

          <Button
            variant="outline"
            className="justify-start rounded-xl"
            onClick={() => generatePDF(false)}
            disabled={busyAction === "generate"}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>

          <Button
            variant="outline"
            className="justify-start rounded-xl"
            onClick={() => generatePDF(true)}
            disabled={busyAction === "regenerate"}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerate PDF
          </Button>

          <Button
            variant="outline"
            className="justify-start rounded-xl"
            onClick={() => navigate(`/quotations/${id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Quotation
          </Button>

          <Button
            variant="outline"
            className="justify-start rounded-xl"
            onClick={createProforma}
            disabled={busyAction === "proforma" || Boolean(data.proforma)}
          >
            <FileText className="mr-2 h-4 w-4" />
            {data.proforma ? "Proforma Created" : "Create Proforma"}
          </Button>

          <Button
            variant="outline"
            className="justify-start rounded-xl"
            onClick={createInvoice}
            disabled={busyAction === "invoice" || Boolean(data.invoice)}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            {data.invoice ? "Invoice Created" : "Create Invoice"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs uppercase tracking-wide text-gray-500">Bill To</h3>

            <div className="space-y-1">
              <p className="text-base font-semibold text-gray-900">{data.customer_name}</p>
              {data.customer_email ? <p className="text-sm text-gray-600">{data.customer_email}</p> : null}
              {data.customer_phone_number ? <p className="text-sm text-gray-600">{data.customer_phone_number}</p> : null}
              {data.customer_address ? (
                <p className="whitespace-pre-line text-sm text-gray-600">{data.customer_address}</p>
              ) : null}
            </div>
          </div>

          {(data.invoice || data.proforma) && (
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-medium text-gray-700">Related Documents</h3>

              <div className="flex flex-wrap gap-3">
                {data.proforma ? (
                  <Button variant="secondary" onClick={() => navigate(`/proformas/${data.proforma}`)}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Proforma
                  </Button>
                ) : null}

                {data.invoice ? (
                  <Button variant="secondary" onClick={() => navigate(`/invoices/${data.invoice}`)}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Invoice
                  </Button>
                ) : null}
              </div>
            </div>
          )}

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
        </div>

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