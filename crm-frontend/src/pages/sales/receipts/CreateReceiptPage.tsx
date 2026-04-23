import { useNavigate } from "react-router-dom"
import { ArrowLeft, ReceiptIcon as ReceiptText } from "lucide-react"
import { useOrganizations } from "@/redux/hooks/useOrganizations"
import { Button } from "@/components/ui/button"
import ReceiptForm, { type ReceiptFormValues } from "./ReceiptForm"
import { createReceipt, type ReceiptStatus } from "./api"

export default function CreateReceiptPage() {
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()

  const handleSubmit = async (values: ReceiptFormValues) => {
    const receipt = await createReceipt({
      company: values.companyId,
      invoice: values.invoice,
      receipt_number: values.receipt_number,
      amount_paid: values.amount_paid,
      currency: values.currency || "USD",
      selected_template: values.selected_template ?? null,
      status: values.status as ReceiptStatus,
    })
    navigate(`/receipts/${receipt.id}`)
  }

  if (!currentOrganizationId) {
    return <div className="p-6 text-sm text-gray-500">Loading organization...</div>
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            Payment confirmation workflow
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <ReceiptText className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Create receipt
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Link a payment receipt to an invoice, keep numbering consistent, and send the PDF when it is ready.
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" className="rounded-2xl" onClick={() => navigate("/receipts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to receipts
        </Button>
      </div>

      <ReceiptForm
        mode="create"
        companyId={Number(currentOrganizationId)}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/receipts")}
      />
    </div>
  )
}
