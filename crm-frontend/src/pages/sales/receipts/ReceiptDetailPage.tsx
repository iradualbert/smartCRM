import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Mail, Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ActivityTimeline from "@/components/ActivityTimeline"
import PdfActionsMenu from "@/shared/PdfActionsMenu"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

import {
  getReceipt,
  updateReceipt,
  type Receipt,
  type ReceiptStatus,
} from "./api"

const statusColor: Record<string, string> = {
  issued: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-zinc-100 text-zinc-700",
}

export default function ReceiptDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()
  const [receipt, setReceipt] = React.useState<Receipt | null>(null)
  const [activityKey, setActivityKey] = React.useState(0)
  const [busyStatus, setBusyStatus] = React.useState<ReceiptStatus | null>(null)

  const load = React.useCallback(async () => {
    if (!id) return
    const data = await getReceipt(id)
    setReceipt(data)
  }, [id])

  React.useEffect(() => {
    void load()
  }, [load])

  const handleStatusChange = async (status: ReceiptStatus) => {
    if (!receipt || busyStatus) return
    try {
      setBusyStatus(status)
      const updated = await updateReceipt(receipt.id, { status })
      setReceipt(updated)
      setActivityKey((current) => current + 1)
    } finally {
      setBusyStatus(null)
    }
  }

  if (!receipt) {
    return <div className="mx-auto max-w-7xl p-6 text-sm text-slate-500">Loading receipt...</div>
  }

  const hasPdf = Boolean(receipt.pdf_generated_at || receipt.document)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{receipt.receipt_number}</h1>
            <Badge className={`px-3 py-1 text-xs capitalize ${statusColor[receipt.status] || ""}`}>
              {receipt.status}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
            {receipt.customer_name && <span className="font-medium text-gray-700">{receipt.customer_name}</span>}
            <span>Currency: {receipt.currency || "—"}</span>
            <span>Amount paid: {receipt.amount_paid || "—"}</span>
            {receipt.pdf_generated_at ? (
              <span>PDF: {new Date(receipt.pdf_generated_at).toLocaleDateString()}</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => navigate(`/receipts/${id}/email`)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send by Email
          </Button>

          <PdfActionsMenu
            entityLabel="PDF"
            hasPdf={hasPdf}
            pdfUrl={`/receipts/${id}/pdf/?company=${currentOrganizationId}`}
            generateUrl={`/receipts/${id}/generate_pdf/?company=${currentOrganizationId}`}
            regenerateUrl={`/receipts/${id}/regenerate_pdf/?company=${currentOrganizationId}`}
            onAfterGenerate={async () => {
              await load()
              setActivityKey((current) => current + 1)
            }}
          />

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate(`/receipts/${id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Receipt
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-1">
        {(["issued", "cancelled"] as ReceiptStatus[]).map((status) => (
          <Button
            key={status}
            variant={receipt.status === status ? "default" : "outline"}
            size="sm"
            className="rounded-xl capitalize"
            onClick={() => void handleStatusChange(status)}
            disabled={receipt.status === status || Boolean(busyStatus)}
          >
            {busyStatus === status ? "Saving..." : `Mark ${status}`}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {receipt.customer_name && (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs uppercase tracking-wide text-gray-500">Customer</h3>
              <p className="text-base font-semibold text-gray-900">{receipt.customer_name}</p>
            </div>
          )}

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs uppercase tracking-wide text-gray-500">Receipt Summary</h3>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-gray-500">Invoice</div>
                <div className="mt-1 font-medium text-gray-900">{receipt.invoice}</div>
              </div>
              <div>
                <div className="text-gray-500">Amount paid</div>
                <div className="mt-1 font-medium text-gray-900">{receipt.amount_paid}</div>
              </div>
              <div>
                <div className="text-gray-500">Currency</div>
                <div className="mt-1 font-medium text-gray-900">{receipt.currency || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Template</div>
                <div className="mt-1 font-medium text-gray-900">
                  {receipt.selected_template || "Default"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-800">Activity</h3>
            <ActivityTimeline
              key={activityKey}
              activityUrl={`/receipts/${id}/activity/?company=${currentOrganizationId}`}
            />
          </div>
        </div>

        <div className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">PDF Status</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Needs regeneration</span>
              <span>{receipt.pdf_needs_regeneration ? "Yes" : "No"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Generated at</span>
              <span>
                {receipt.pdf_generated_at
                  ? new Date(receipt.pdf_generated_at).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
