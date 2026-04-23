import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOrganizations } from "@/redux/hooks/useOrganizations"
import ProformaForm, { type ProformaFormValues } from "./ProformaForm"
import { createProformaWithLines, type ProformaStatus } from "./api"

type CreateProformaLocationState = {
  defaults?: Partial<ProformaFormValues>
}

export default function CreateProformaPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentOrganizationId } = useOrganizations()
  const state = (location.state as CreateProformaLocationState | null) ?? null

  const initialValues = React.useMemo<Partial<ProformaFormValues>>(
    () => ({
      companyId: state?.defaults?.companyId ?? Number(currentOrganizationId) ?? 0,
      quotation: state?.defaults?.quotation ?? null,
      customer: state?.defaults?.customer ?? null,
      proforma_number: state?.defaults?.proforma_number,
      currency: state?.defaults?.currency ?? "USD",
      selected_template: state?.defaults?.selected_template ?? null,
      status: state?.defaults?.status ?? "draft",
      lines: state?.defaults?.lines ?? [
        { product: null, description: "", quantity: "1", unit_price: "0.00" },
      ],
    }),
    [state]
  )

  const handleSubmit = async (values: ProformaFormValues) => {
    const proforma = await createProformaWithLines({
      companyId: values.companyId,
      proforma: {
        quotation: values.quotation ?? null,
        customer: values.customer ?? null,
        proforma_number: values.proforma_number,
        currency: values.currency || "USD",
        selected_template: values.selected_template ?? null,
        status: values.status as ProformaStatus,
      },
      lines: values.lines.map((line) => ({
        product: line.product ?? null,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
      })),
    })

    navigate(`/proformas/${proforma.id}`)
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create Proforma</h1>
          <p className="mt-2 text-sm text-slate-600">Create a proforma from scratch or prefilled conversion data.</p>
        </div>
        <Button variant="outline" className="rounded-2xl" onClick={() => navigate("/proformas")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <ProformaForm
        mode="create"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/proformas")}
      />
    </div>
  )
}