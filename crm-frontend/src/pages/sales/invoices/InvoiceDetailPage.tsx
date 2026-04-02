import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Download,
  Mail,
  MoreHorizontal,
  PencilLine,
  Receipt,
  RefreshCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  generateInvoicePdf,
  getInvoice,
  invoicePdfUrl,
  regenerateInvoicePdf,
  updateInvoice,
  type Invoice,
  type InvoiceStatus,
} from "./api"

function statusTone(status: InvoiceStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "sent":
      return "bg-sky-50 text-sky-700 border-sky-200"
    case "overdue":
      return "bg-rose-50 text-rose-700 border-rose-200"
    case "partially_paid":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "cancelled":
      return "bg-zinc-100 text-zinc-700 border-zinc-200"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

const InvoiceDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [invoice, setInvoice] = React.useState<Invoice | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)

  const loadInvoice = React.useCallback(async () => {
    if (!id) return
    const data = await getInvoice(id)
    setInvoice(data)
  }, [id])

  React.useEffect(() => {
    const run = async () => {
      if (!id) {
        setError("Missing invoice id.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        await loadInvoice()
      } catch (err) {
        console.error(err)
        setError("Failed to load invoice.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [id, loadInvoice])

  const handleStatusChange = async (status: InvoiceStatus) => {
    if (!invoice) return
    try {
      setActionLoading(`status:${status}`)
      const updated = await updateInvoice(invoice.id, { status })
      setInvoice(updated)
    } catch (error) {
      console.error(error)
      setError("Failed to update invoice status.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleGeneratePdf = async (mode: "generate" | "regenerate") => {
    if (!invoice) return
    try {
      setActionLoading(mode)
      if (mode === "generate") {
        await generateInvoicePdf(invoice.id)
      } else {
        await regenerateInvoicePdf(invoice.id)
      }
      await loadInvoice()
    } catch (error) {
      console.error(error)
      setError("Failed to update PDF.")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6 text-sm text-slate-500">
        Loading invoice...
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
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button
            variant="ghost"
            className="mb-3 rounded-xl px-0 text-slate-500 hover:bg-transparent"
            onClick={() => navigate("/invoices")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to invoices
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {invoice.invoice_number}
            </h1>
            <Badge className={`rounded-full border ${statusTone(invoice.status)}`}>
              {invoice.status.replaceAll("_", " ")}
            </Badge>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            Invoice detail workspace with PDF lifecycle actions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to={`/invoices/${invoice.id}/edit`}>
              <PencilLine className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => handleGeneratePdf("generate")}
            disabled={actionLoading !== null}
          >
            <Receipt className="mr-2 h-4 w-4" />
            {actionLoading === "generate" ? "Generating..." : "Generate PDF"}
          </Button>

          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => handleGeneratePdf("regenerate")}
            disabled={actionLoading !== null}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {actionLoading === "regenerate" ? "Refreshing..." : "Regenerate PDF"}
          </Button>

          <Button asChild className="rounded-2xl">
            <a href={invoicePdfUrl(invoice.id)} target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Open PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          ["draft", "sent", "partially_paid", "paid", "overdue", "cancelled"] as InvoiceStatus[]
        ).map((status) => (
          <Button
            key={status}
            variant={invoice.status === status ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => handleStatusChange(status)}
            disabled={actionLoading !== null}
          >
            {actionLoading === `status:${status}`
              ? "Saving..."
              : `Mark ${status.replaceAll("_", " ")}`}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Invoice summary</CardTitle>
              <CardDescription>
                Core invoice information from the backend resource.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <div className="text-slate-500">Invoice Number</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {invoice.invoice_number}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500">Currency</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {invoice.currency || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500">Proforma</div>
                  <div className="mt-1 font-medium text-slate-900">{invoice.proforma}</div>
                </div>

                <div>
                  <div className="text-slate-500">Template</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {invoice.selected_template || "—"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Line items</CardTitle>
              <CardDescription>
                Detailed invoice lines with quantities and totals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-slate-600">
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Qty</th>
                      <th className="px-4 py-3 font-medium">Unit Price</th>
                      <th className="px-4 py-3 font-medium">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice.lines ?? []).map((line, index) => (
                      <tr key={line.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                        <td className="px-4 py-3 text-slate-900">
                          {line.description || "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">
                          {line.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">
                          {line.unit_price}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {line.line_total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-900">{invoice.subtotal}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total</span>
                <span className="text-lg font-semibold text-slate-900">{invoice.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">PDF status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Needs regeneration</span>
                <span className="font-medium text-slate-900">
                  {invoice.pdf_needs_regeneration ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Generated at</span>
                <span className="font-medium text-slate-900">
                  {invoice.pdf_generated_at
                    ? new Date(invoice.pdf_generated_at).toLocaleString()
                    : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start rounded-2xl">
                <Mail className="mr-2 h-4 w-4" />
                Send by email
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start rounded-2xl">
                    <MoreHorizontal className="mr-2 h-4 w-4" />
                    More actions
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Duplicate invoice</DropdownMenuItem>
                  <DropdownMenuItem>Mark as sent</DropdownMenuItem>
                  <DropdownMenuItem>Download PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetailPage