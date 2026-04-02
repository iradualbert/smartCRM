import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProformaForm, { type ProformaFormValues } from "./ProformaForm"
import {
  getProforma,
  updateProformaWithLines,
  type Proforma,
  type ProformaStatus,
} from "./api"

export default function UpdateProformaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proforma, setProforma] = React.useState<Proforma | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const run = async () => {
      if (!id) return
      try {
        setLoading(true)
        const data = await getProforma(id)
        setProforma(data)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const handleSubmit = async (values: ProformaFormValues, removedLineIds: number[]) => {
    if (!id) return
    const updated = await updateProformaWithLines({
      proformaId: Number(id),
      proforma: {
        quotation: values.quotation ?? null,
        customer: values.customer ?? null,
        proforma_number: values.proforma_number,
        currency: values.currency || "USD",
        selected_template: values.selected_template ?? null,
        status: values.status as ProformaStatus,
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
    navigate(`/proformas/${updated.id}`)
  }

  if (loading) return <div className="mx-auto max-w-7xl p-6">Loading...</div>
  if (!proforma) return <div className="mx-auto max-w-7xl p-6">Proforma not found.</div>

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Update Proforma</h1>
          <p className="mt-2 text-sm text-slate-600">Edit details and line items.</p>
        </div>
        <Button variant="outline" className="rounded-2xl" onClick={() => navigate(`/proformas/${proforma.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <ProformaForm
        mode="edit"
        initialProforma={proforma}
        initialValues={{
          companyId: proforma.company ?? 1,
          quotation: proforma.quotation ?? null,
          customer: proforma.customer ?? null,
          proforma_number: proforma.proforma_number,
          currency: proforma.currency ?? "USD",
          selected_template: proforma.selected_template ?? null,
          status: proforma.status,
          lines: (proforma.lines ?? []).map((line) => ({
            id: line.id,
            product: line.product ?? null,
            description: line.description || "",
            quantity: line.quantity,
            unit_price: line.unit_price,
          })),
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/proformas/${proforma.id}`)}
      />
    </div>
  )
}