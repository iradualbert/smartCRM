import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useOrganizations } from "@/redux/hooks/useOrganizations"
import ReceiptForm, { type ReceiptFormValues } from "./ReceiptForm"
import { getReceipt, updateReceipt, type Receipt, type ReceiptStatus } from "./api"

export default function UpdateReceiptPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()
  const [receipt, setReceipt] = React.useState<Receipt | null>(null)

  React.useEffect(() => {
    const run = async () => {
      if (!id) return
      const data = await getReceipt(id)
      setReceipt(data)
    }
    run()
  }, [id])

  const handleSubmit = async (values: ReceiptFormValues) => {
    if (!id) return
    const updated = await updateReceipt(id, {
      company: values.companyId,
      invoice: values.invoice,
      receipt_number: values.receipt_number,
      amount_paid: values.amount_paid,
      currency: values.currency || "USD",
      selected_template: values.selected_template ?? null,
      status: values.status as ReceiptStatus,
    })
    navigate(`/receipts/${updated.id}`)
  }

  if (!receipt) return <div className="mx-auto max-w-7xl p-6">Loading...</div>

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Update Receipt</h1>
      <p className="mb-6 text-sm text-slate-600">Edit receipt fields and status.</p>

      <ReceiptForm
        mode="edit"
        companyId={receipt.company ?? Number(currentOrganizationId) ?? 0}
        initialReceipt={receipt}
        initialValues={{
          companyId: receipt.company ?? Number(currentOrganizationId) ?? 0,
          invoice: receipt.invoice,
          receipt_number: receipt.receipt_number,
          amount_paid: receipt.amount_paid,
          currency: receipt.currency ?? "USD",
          selected_template: receipt.selected_template ?? null,
          status: receipt.status,
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/receipts/${receipt.id}`)}
      />
    </div>
  )
}
