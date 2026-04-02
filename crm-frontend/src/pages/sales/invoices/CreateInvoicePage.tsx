import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, Receipt } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createInvoiceWithLines, type InvoiceStatus } from "./api"
import InvoiceForm, { type InvoiceFormValues } from "./InvoiceForm"

type CreateInvoiceLocationState = {
  defaults?: Partial<InvoiceFormValues>
}

const CreateInvoicePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as CreateInvoiceLocationState | null) ?? null

  const initialValues = React.useMemo<Partial<InvoiceFormValues>>(
    () => ({
      companyId: state?.defaults?.companyId ?? 1,
      proforma: state?.defaults?.proforma ?? 0,
      invoice_number: state?.defaults?.invoice_number,
      currency: state?.defaults?.currency ?? "USD",
      selected_template: state?.defaults?.selected_template ?? null,
      status: state?.defaults?.status ?? "draft",
      internal_note: state?.defaults?.internal_note ?? "",
      lines: state?.defaults?.lines ?? [
        {
          product: null,
          description: "",
          quantity: "1",
          unit_price: "0.00",
        },
      ],
    }),
    [state]
  )

  const handleSubmit = async (values: InvoiceFormValues) => {
    const invoice = await createInvoiceWithLines({
      companyId: values.companyId,
      invoice: {
        proforma: values.proforma,
        invoice_number: values.invoice_number,
        currency: values.currency || "USD",
        selected_template: values.selected_template ?? null,
        status: values.status as InvoiceStatus,
      },
      lines: values.lines.map((line) => ({
        product: line.product ?? null,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
      })),
    })

    navigate(`/invoices/${invoice.id}`)
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700 ring-1 ring-sky-200">
            <Receipt className="mr-2 h-4 w-4" />
            Billing workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Create Invoice
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Build a new invoice from a proforma or prefilled conversion flow.
          </p>
        </div>

        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={() => navigate("/invoices")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to invoices
        </Button>
      </div>

      <InvoiceForm
        mode="create"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/invoices")}
      />
    </div>
  )
}

export default CreateInvoicePage