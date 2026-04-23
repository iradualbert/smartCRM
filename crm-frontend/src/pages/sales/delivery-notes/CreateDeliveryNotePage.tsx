import { useNavigate } from "react-router-dom"
import { ArrowLeft, Truck } from "lucide-react"
import { useOrganizations } from "@/redux/hooks/useOrganizations"
import { Button } from "@/components/ui/button"
import DeliveryNoteForm, { type DeliveryNoteFormValues } from "./DeliveryNoteForm"
import { createDeliveryNoteWithLines, type DeliveryNoteStatus } from "./api"

export default function CreateDeliveryNotePage() {
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()

  const handleSubmit = async (values: DeliveryNoteFormValues) => {
    const deliveryNote = await createDeliveryNoteWithLines({
      companyId: values.companyId,
      deliveryNote: {
        invoice: values.invoice,
        customer: values.customer ?? null,
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

  if (!currentOrganizationId) {
    return <div className="p-6 text-sm text-gray-500">Loading organization...</div>
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            Fulfilment workflow
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <Truck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Create delivery note
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Prepare a dispatch document linked to an invoice with searchable records and product-backed lines.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={() => navigate("/delivery-notes")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to delivery notes
        </Button>
      </div>

      <DeliveryNoteForm
        mode="create"
        initialValues={{ companyId: Number(currentOrganizationId) }}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/delivery-notes")}
      />
    </div>
  )
}
