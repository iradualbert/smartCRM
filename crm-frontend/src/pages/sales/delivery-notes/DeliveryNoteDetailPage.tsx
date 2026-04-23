import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Mail, Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ActivityTimeline from "@/components/ActivityTimeline"
import PdfActionsMenu from "@/shared/PdfActionsMenu"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

import {
  getDeliveryNote,
  updateDeliveryNote,
  type DeliveryNote,
  type DeliveryNoteStatus,
} from "./api"

const statusColor: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  dispatched: "bg-sky-100 text-sky-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-zinc-100 text-zinc-700",
}

export default function DeliveryNoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()
  const [deliveryNote, setDeliveryNote] = React.useState<DeliveryNote | null>(null)
  const [activityKey, setActivityKey] = React.useState(0)
  const [busyStatus, setBusyStatus] = React.useState<DeliveryNoteStatus | null>(null)

  const load = React.useCallback(async () => {
    if (!id) return
    const data = await getDeliveryNote(id)
    setDeliveryNote(data)
  }, [id])

  React.useEffect(() => {
    void load()
  }, [load])

  const handleStatusChange = async (status: DeliveryNoteStatus) => {
    if (!deliveryNote || busyStatus) return
    try {
      setBusyStatus(status)
      const updated = await updateDeliveryNote(deliveryNote.id, { status })
      setDeliveryNote(updated)
      setActivityKey((current) => current + 1)
    } finally {
      setBusyStatus(null)
    }
  }

  if (!deliveryNote) {
    return (
      <div className="mx-auto max-w-7xl p-6 text-sm text-slate-500">
        Loading delivery note...
      </div>
    )
  }

  const hasPdf = Boolean(deliveryNote.pdf_generated_at || deliveryNote.document)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {deliveryNote.delivery_note_number}
            </h1>
            <Badge
              className={`px-3 py-1 text-xs capitalize ${statusColor[deliveryNote.status] || ""}`}
            >
              {deliveryNote.status}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
            <span>Delivery date: {deliveryNote.delivery_date || "—"}</span>
            <span>Currency: {deliveryNote.currency || "—"}</span>
            {deliveryNote.pdf_generated_at ? (
              <span>PDF: {new Date(deliveryNote.pdf_generated_at).toLocaleDateString()}</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => navigate(`/delivery-notes/${id}/email`)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send by Email
          </Button>

          <PdfActionsMenu
            entityLabel="PDF"
            hasPdf={hasPdf}
            pdfUrl={`/delivery-notes/${id}/pdf/?company=${currentOrganizationId}`}
            generateUrl={`/delivery-notes/${id}/generate_pdf/?company=${currentOrganizationId}`}
            regenerateUrl={`/delivery-notes/${id}/regenerate_pdf/?company=${currentOrganizationId}`}
            onAfterGenerate={async () => {
              await load()
              setActivityKey((current) => current + 1)
            }}
          />

          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate(`/delivery-notes/${id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Delivery Note
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-1">
        {(["draft", "dispatched", "delivered", "cancelled"] as DeliveryNoteStatus[]).map(
          (status) => (
            <Button
              key={status}
              variant={deliveryNote.status === status ? "default" : "outline"}
              size="sm"
              className="rounded-xl capitalize"
              onClick={() => void handleStatusChange(status)}
              disabled={deliveryNote.status === status || Boolean(busyStatus)}
            >
              {busyStatus === status ? "Saving..." : `Mark ${status}`}
            </Button>
          )
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs uppercase tracking-wide text-gray-500">
              Delivery Summary
            </h3>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-gray-500">Invoice</div>
                <div className="mt-1 font-medium text-gray-900">{deliveryNote.invoice}</div>
              </div>
              <div>
                <div className="text-gray-500">Delivery date</div>
                <div className="mt-1 font-medium text-gray-900">
                  {deliveryNote.delivery_date || "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Currency</div>
                <div className="mt-1 font-medium text-gray-900">
                  {deliveryNote.currency || "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Template</div>
                <div className="mt-1 font-medium text-gray-900">
                  {deliveryNote.selected_template || "Default"}
                </div>
              </div>
            </div>
          </div>

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
                {(deliveryNote.lines || []).map((line) => (
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

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-800">Activity</h3>
            <ActivityTimeline
              key={activityKey}
              activityUrl={`/delivery-notes/${id}/activity/?company=${currentOrganizationId}`}
            />
          </div>
        </div>

        <div className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">PDF Status</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Needs regeneration</span>
              <span>{deliveryNote.pdf_needs_regeneration ? "Yes" : "No"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Generated at</span>
              <span>
                {deliveryNote.pdf_generated_at
                  ? new Date(deliveryNote.pdf_generated_at).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
