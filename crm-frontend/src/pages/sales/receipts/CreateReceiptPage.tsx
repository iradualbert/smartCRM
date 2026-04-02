import { useNavigate } from "react-router-dom"
import ReceiptForm, { type ReceiptFormValues } from "./ReceiptForm"
import { createReceipt, type ReceiptStatus } from "./api"

export default function CreateReceiptPage() {
  const navigate = useNavigate()

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

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Create Receipt</h1>
      <p className="mb-6 text-sm text-slate-600">Create a receipt linked to an invoice.</p>

      <ReceiptForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/receipts")}
      />
    </div>
  )
}