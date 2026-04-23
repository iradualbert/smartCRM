import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { Download, PencilLine, RefreshCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useOrganizations } from "@/redux/hooks/useOrganizations"
import ActivityTimeline from "@/components/ActivityTimeline"
import {
  deliveryNotePdfUrl,
  generateDeliveryNotePdf,
  getDeliveryNote,
  regenerateDeliveryNotePdf,
  updateDeliveryNote,
  type DeliveryNote,
  type DeliveryNoteStatus,
} from "./api"

export default function DeliveryNoteDetailPage() {
  const { id } = useParams()
  const { currentOrganizationId } = useOrganizations()
  const [deliveryNote, setDeliveryNote] = React.useState<DeliveryNote | null>(null)
  const [activityKey, setActivityKey] = React.useState(0)

  const load = React.useCallback(async () => {
    if (!id) return
    const data = await getDeliveryNote(id)
    setDeliveryNote(data)
  }, [id])

  React.useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = async (status: DeliveryNoteStatus) => {
    if (!deliveryNote) return
    const updated = await updateDeliveryNote(deliveryNote.id, { status })
    setDeliveryNote(updated)
  }

  const handlePdf = async (mode: "generate" | "regenerate") => {
    if (!deliveryNote) return
    if (mode === "generate") await generateDeliveryNotePdf(deliveryNote.id)
    else await regenerateDeliveryNotePdf(deliveryNote.id)
    await load()
    setActivityKey((k) => k + 1)
  }

  if (!deliveryNote) return <div className="mx-auto max-w-7xl p-6">Loading...</div>

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{deliveryNote.delivery_note_number}</h1>
            <Badge className="rounded-full border bg-slate-100 text-slate-700">
              {deliveryNote.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-600">Delivery note detail and PDF lifecycle.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to={`/delivery-notes/${deliveryNote.id}/edit`}>
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
            <a href={deliveryNotePdfUrl(deliveryNote.id)} target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Open PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {(["draft", "dispatched", "delivered", "cancelled"] as DeliveryNoteStatus[]).map((status) => (
          <Button
            key={status}
            variant={deliveryNote.status === status ? "default" : "outline"}
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
            <CardHeader><CardTitle>Delivery note summary</CardTitle></CardHeader>
            <CardContent className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <div className="text-slate-500">Invoice</div>
                <div className="mt-1 font-medium">{deliveryNote.invoice}</div>
              </div>
              <div>
                <div className="text-slate-500">Delivery Date</div>
                <div className="mt-1 font-medium">{deliveryNote.delivery_date}</div>
              </div>
              <div>
                <div className="text-slate-500">Currency</div>
                <div className="mt-1 font-medium">{deliveryNote.currency || "—"}</div>
              </div>
              <div>
                <div className="text-slate-500">Template</div>
                <div className="mt-1 font-medium">{deliveryNote.selected_template || "—"}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Line items</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">#</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Qty</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Unit Price</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(deliveryNote.lines ?? []).map((line, index) => (
                      <tr key={line.id} className="border-t border-slate-100">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{line.description || "—"}</td>
                        <td className="px-4 py-3">{line.quantity}</td>
                        <td className="px-4 py-3">{line.unit_price}</td>
                        <td className="px-4 py-3 font-medium">{line.line_total}</td>
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
            <CardHeader><CardTitle>PDF status</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Needs regeneration</span>
                <span>{deliveryNote.pdf_needs_regeneration ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Generated at</span>
                <span>{deliveryNote.pdf_generated_at ? new Date(deliveryNote.pdf_generated_at).toLocaleString() : "—"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="text-sm">Activity</CardTitle></CardHeader>
            <CardContent>
              <ActivityTimeline
                key={activityKey}
                activityUrl={`/delivery-notes/${id}/activity/?company=${currentOrganizationId}`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}