import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Building2, Settings2, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import OrganizationForm from "./OrganizationForm"
import {
  getCompany,
  updateCompany,
  type Company,
  type CompanyFormValues,
} from "./api"

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={
        isActive
          ? "rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "rounded-full border border-slate-200 bg-slate-100 text-slate-600"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}

const OrganizationSettingsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [organization, setOrganization] = React.useState<Company | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const run = async () => {
      if (!id) {
        setError("Missing organization id.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await getCompany(id)
        setOrganization(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load organization settings.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [id])

  const handleSubmit = async (values: CompanyFormValues) => {
    if (!id) return
    await updateCompany(id, values)
    navigate(`/settings/organizations/${id}`)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading organization settings...
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
          {error || "Organization not found."}
        </div>
      </div>
    )
  }

  const initialValues: CompanyFormValues = {
    name: organization.name ?? "",
    legal_name: organization.legal_name ?? "",
    tax_number: organization.tax_number ?? "",
    email: organization.email ?? "",
    phone: organization.phone ?? "",
    website: organization.website ?? "",
    address: organization.address ?? "",
    supported_currencies: organization.supported_currencies ?? ["USD"],
    default_currency: organization.default_currency ?? "USD",
    invoice_prefix: organization.invoice_prefix ?? "INV",
    quotation_prefix: organization.quotation_prefix ?? "QUO",
    proforma_prefix: organization.proforma_prefix ?? "PRO",
    receipt_prefix: organization.receipt_prefix ?? "REC",
    delivery_note_prefix: organization.delivery_note_prefix ?? "DN",
    is_active: organization.is_active ?? true,
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
            <Settings2 className="mr-1.5 h-3.5 w-3.5" />
            Workspace settings
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <Building2 className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Organization settings
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Update workspace identity, currencies, numbering rules, and business
                profile details.
              </p>
            </div>
          </div>
        </div>

        <Button asChild variant="outline" className="rounded-2xl">
          <Link to={`/settings/organizations/${organization.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to organization
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <OrganizationForm
            mode="edit"
            initialValues={initialValues}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="space-y-6 xl:col-span-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-700" />
              <h2 className="text-lg font-semibold text-slate-900">
                Workspace snapshot
              </h2>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Status</span>
                <StatusBadge isActive={organization.is_active} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Default currency</span>
                <span className="font-medium text-slate-900">
                  {organization.default_currency}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Members</span>
                <span className="font-medium text-slate-900">
                  {organization.member_count ?? "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Updated</span>
                <span className="text-right font-medium text-slate-900">
                  {new Date(organization.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Memberships moved out
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Membership management now lives on the organization detail page so
              access control is handled in one clean place.
            </p>

            <div className="mt-4">
              <Button asChild className="rounded-2xl">
                <Link to={`/settings/organizations/${organization.id}?tab=members`}>
                  Open members
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default OrganizationSettingsPage