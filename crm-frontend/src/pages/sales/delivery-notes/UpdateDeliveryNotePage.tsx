import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, PencilLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import DeliveryNoteForm, { type DeliveryNoteFormValues } from "./DeliveryNoteForm"
import {
  getDeliveryNote,
  updateDeliveryNoteWithLines,
  type DeliveryNote,
  type DeliveryNoteStatus,
} from "./api"

export default function UpdateDeliveryNotePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deliveryNote, setDeliveryNote] = React.useState<DeliveryNote | null>(null)
  const companyId = deliveryNote?.company ?? 0

  React.useEffect(() => {
    const run = async () => {
      if (!id) return
      const data = await getDeliveryNote(id)
      setDeliveryNote(data)
    }
    run()
  }, [id])

  const handleSubmit = async (values: DeliveryNoteFormValues, removedLineIds: number[]) => {
    if (!id) return
    const updated = await updateDeliveryNoteWithLines({
      deliveryNoteId: Number(id),
      deliveryNote: {
        invoice: values.invoice,
        delivery_note_number: values.delivery_note_number,
        delivery_date: values.delivery_date,
        currency: values.currency || "USD",
        selected_template: values.selected_template ?? null,
        status: values.status as DeliveryNoteStatus,
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
    navigate(`/delivery-notes/${updated.id}`)
  }

  if (!deliveryNote) return <div className="mx-auto max-w-7xl p-6">Loading...</div>

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            Update delivery note
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <PencilLine className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Edit delivery note
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Update invoice linkage, delivery date, and line items without leaving the standard document flow.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={() => navigate(`/delivery-notes/${deliveryNote.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to delivery note
        </Button>
      </div>

      <DeliveryNoteForm
        mode="edit"
        initialDeliveryNote={deliveryNote}
        initialValues={{
          companyId,
          invoice: deliveryNote.invoice,
          delivery_note_number: deliveryNote.delivery_note_number,
          delivery_date: deliveryNote.delivery_date,
          currency: deliveryNote.currency ?? "USD",
          selected_template: deliveryNote.selected_template ?? null,
          status: deliveryNote.status,
          lines: (deliveryNote.lines ?? []).map((line) => ({
            id: line.id,
            product: line.product ?? null,
            description: line.description || "",
            quantity: line.quantity,
            unit_price: line.unit_price,
          })),
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/delivery-notes/${deliveryNote.id}`)}
      />
    </div>
  )
}
