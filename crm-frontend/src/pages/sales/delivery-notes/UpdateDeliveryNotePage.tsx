import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
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
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Update Delivery Note</h1>
      <p className="mb-6 text-sm text-slate-600">Edit delivery note fields and lines.</p>

      <DeliveryNoteForm
        mode="edit"
        initialDeliveryNote={deliveryNote}
        initialValues={{
          companyId: deliveryNote.company ?? 0,
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