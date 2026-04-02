import { useNavigate } from "react-router-dom"
import DeliveryNoteForm, { type DeliveryNoteFormValues } from "./DeliveryNoteForm"
import { createDeliveryNoteWithLines, type DeliveryNoteStatus } from "./api"

export default function CreateDeliveryNotePage() {
  const navigate = useNavigate()

  const handleSubmit = async (values: DeliveryNoteFormValues) => {
    const deliveryNote = await createDeliveryNoteWithLines({
      companyId: values.companyId,
      deliveryNote: {
        invoice: values.invoice,
        delivery_note_number: values.delivery_note_number,
        delivery_date: values.delivery_date,
        currency: values.currency || "USD",
        selected_template: values.selected_template ?? null,
        status: values.status as DeliveryNoteStatus,
      },
      lines: values.lines.map((line) => ({
        product: line.product ?? null,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
      })),
    })
    navigate(`/delivery-notes/${deliveryNote.id}`)
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Create Delivery Note</h1>
      <p className="mb-6 text-sm text-slate-600">Create a delivery note linked to an invoice.</p>

      <DeliveryNoteForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/delivery-notes")}
      />
    </div>
  )
}