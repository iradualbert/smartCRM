import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import CompanyForm from "./CompanyForm"
import {
  getCompany,
  updateCompany,
  type Company,
  type CompanyFormValues,
} from "./api"

const CompanySettingsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [company, setCompany] = React.useState<Company | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        setError("Missing company id.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await getCompany(id)
        setCompany(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load company settings.")
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [id])

  const handleSubmit = async (values: CompanyFormValues) => {
    if (!id) return
    await updateCompany(id, values)
    navigate(`/companies/${id}`)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          Loading company settings...
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || "Company not found."}
        </div>
      </div>
    )
  }

  const initialValues: CompanyFormValues = {
    name: company.name ?? "",
    legal_name: company.legal_name ?? "",
    tax_number: company.tax_number ?? "",
    email: company.email ?? "",
    phone: company.phone ?? "",
    website: company.website ?? "",
    address: company.address ?? "",
    supported_currencies: company.supported_currencies ?? ["USD"],
    default_currency: company.default_currency ?? "USD",
    invoice_prefix: company.invoice_prefix ?? "INV",
    quotation_prefix: company.quotation_prefix ?? "QUO",
    proforma_prefix: company.proforma_prefix ?? "PRO",
    receipt_prefix: company.receipt_prefix ?? "REC",
    delivery_note_prefix: company.delivery_note_prefix ?? "DN",
    is_active: company.is_active ?? true,
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Company Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update legal details, contact info, currencies, and document numbering.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to={`/companies/${company.id}`}>Back</Link>
        </Button>
      </div>

      <CompanyForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default CompanySettingsPage