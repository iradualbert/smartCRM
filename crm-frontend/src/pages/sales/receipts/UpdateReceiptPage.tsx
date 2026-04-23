import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, PencilLine } from "lucide-react"
import { useOrganizations } from "@/redux/hooks/useOrganizations"
import { Button } from "@/components/ui/button"
import ReceiptForm, { type ReceiptFormValues } from "./ReceiptForm"
import { getReceipt, updateReceipt, type Receipt, type ReceiptStatus } from "./api"

export default function UpdateReceiptPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()
  const [receipt, setReceipt] = React.useState<Receipt | null>(null)
  const companyId = receipt?.company ?? (currentOrganizationId ? Number(currentOrganizationId) : 0)

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
      customer: values.customer ?? null,
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
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            Update receipt
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <PencilLine className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Edit receipt
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Update linked invoice, payment amount, and receipt metadata in the same workflow used across your documents.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={() => navigate(`/receipts/${receipt.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to receipt
        </Button>
      </div>

      <ReceiptForm
        mode="edit"
        companyId={companyId}
        initialReceipt={receipt}
        initialValues={{
          companyId,
          invoice: receipt.invoice,
          customer: receipt.customer ?? null,
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
