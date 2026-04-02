import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Download, PencilLine, RefreshCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  generateReceiptPdf,
  getReceipt,
  receiptPdfUrl,
  regenerateReceiptPdf,
  updateReceipt,
  type Receipt,
  type ReceiptStatus,
} from "./api"

export default function ReceiptDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receipt, setReceipt] = React.useState<Receipt | null>(null)

  const load = React.useCallback(async () => {
    if (!id) return
    const data = await getReceipt(id)
    setReceipt(data)
  }, [id])

  React.useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = async (status: ReceiptStatus) => {
    if (!receipt) return
    const updated = await updateReceipt(receipt.id, { status })
    setReceipt(updated)
  }

  const handlePdf = async (mode: "generate" | "regenerate") => {
    if (!receipt) return
    if (mode === "generate") await generateReceiptPdf(receipt.id)
    else await regenerateReceiptPdf(receipt.id)
    await load()
  }

  if (!receipt) return <div className="mx-auto max-w-7xl p-6">Loading...</div>

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{receipt.receipt_number}</h1>
            <Badge className="rounded-full border bg-slate-100 text-slate-700">
              {receipt.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-600">Receipt detail and PDF actions.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to={`/receipts/${receipt.id}/edit`}>
              <PencilLine className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" className="rounded-2xl" onClick={() => handlePdf("generate")}>
            Generate PDF
          </Button>
          <Button variant="outline" className="rounded-2xl" onClick={() => handlePdf("regenerate")}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerate PDF
          </Button>
          <Button asChild className="rounded-2xl">
            <a href={receiptPdfUrl(receipt.id)} target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Open PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {(["issued", "cancelled"] as ReceiptStatus[]).map((status) => (
          <Button
            key={status}
            variant={receipt.status === status ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => handleStatusChange(status)}
          >
            Mark {status}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Receipt summary</CardTitle></CardHeader>
            <CardContent className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <div className="text-slate-500">Invoice</div>
                <div className="mt-1 font-medium">{receipt.invoice}</div>
              </div>
              <div>
                <div className="text-slate-500">Amount Paid</div>
                <div className="mt-1 font-medium">{receipt.amount_paid}</div>
              </div>
              <div>
                <div className="text-slate-500">Currency</div>
                <div className="mt-1 font-medium">{receipt.currency || "—"}</div>
              </div>
              <div>
                <div className="text-slate-500">Template</div>
                <div className="mt-1 font-medium">{receipt.selected_template || "—"}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader><CardTitle>PDF status</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Needs regeneration</span>
                <span>{receipt.pdf_needs_regeneration ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Generated at</span>
                <span>{receipt.pdf_generated_at ? new Date(receipt.pdf_generated_at).toLocaleString() : "—"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}