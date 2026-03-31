// src/pages/CompanyDetailPage.tsx
import * as React from "react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"

import { getCompany, type Company } from "./api"

function InfoRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-sm">{value || "—"}</div>
    </div>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  )
}

const CompanyDetailPage = () => {
  const { id } = useParams()
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
        setError("Failed to load company.")
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          Loading company...
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

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <StatusBadge isActive={company.is_active} />
          </div>
          <p className="text-sm text-muted-foreground">
            This company issues documents and owns customers, products, templates,
            and sales records.
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/companies">Back</Link>
          </Button>
          <Button asChild>
            <Link to={`/companies/${company.id}/settings`}>Settings</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Company Profile</h2>
              <p className="text-sm text-muted-foreground">
                Legal and contact details for this issuing company.
              </p>
            </div>

            <div className="divide-y">
              <InfoRow label="Company Name" value={company.name} />
              <InfoRow label="Legal Name" value={company.legal_name || "—"} />
              <InfoRow label="Tax Number" value={company.tax_number || "—"} />
              <InfoRow label="Email" value={company.email || "—"} />
              <InfoRow label="Phone" value={company.phone || "—"} />
              <InfoRow
                label="Website"
                value={
                  company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <InfoRow label="Address" value={company.address || "—"} />
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Document Defaults</h2>
              <p className="text-sm text-muted-foreground">
                Currency and numbering configuration for sales documents.
              </p>
            </div>

            <div className="divide-y">
              <InfoRow label="Default Currency" value={company.default_currency} />
              <InfoRow
                label="Supported Currencies"
                value={
                  company.supported_currencies?.length
                    ? company.supported_currencies.join(", ")
                    : "—"
                }
              />
              <InfoRow label="Invoice Prefix" value={company.invoice_prefix} />
              <InfoRow label="Quotation Prefix" value={company.quotation_prefix} />
              <InfoRow label="Proforma Prefix" value={company.proforma_prefix} />
              <InfoRow label="Receipt Prefix" value={company.receipt_prefix} />
              <InfoRow
                label="Delivery Note Prefix"
                value={company.delivery_note_prefix}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Status</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <div className="mb-1 text-muted-foreground">Company Status</div>
                <StatusBadge isActive={company.is_active} />
              </div>

              <div>
                <div className="mb-1 text-muted-foreground">Created At</div>
                <div>{new Date(company.created_at).toLocaleString()}</div>
              </div>

              <div>
                <div className="mb-1 text-muted-foreground">Updated At</div>
                <div>{new Date(company.updated_at).toLocaleString()}</div>
              </div>

              <div>
                <div className="mb-1 text-muted-foreground">Currency Symbol</div>
                <div>{company.currency_symbol || "—"}</div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Quick Actions</h2>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild variant="outline">
                <Link to={`/companies/${company.id}/settings`}>Edit Company</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/customers/new">Create Customer</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/products/new">Create Product</Link>
              </Button>
              <Button asChild>
                <Link to="/quotations/new">Create Quotation</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default CompanyDetailPage