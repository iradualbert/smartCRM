import * as React from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import {
  BadgeCheck,
  Building2,
  Mail,
  Phone,
  Settings,
  Shield,
  Users2,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getCompany, type Company, type CompanyMembershipRole } from "./api"
import OrganizationMembersPanel from "./OrganizationMembersPanel"

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

function RoleBadge({ role }: { role?: CompanyMembershipRole | null }) {
  if (!role) return null

  const styles =
    role === "owner"
      ? "border border-violet-200 bg-violet-50 text-violet-700"
      : role === "admin"
      ? "border border-sky-200 bg-sky-50 text-sky-700"
      : role === "staff"
      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border border-amber-200 bg-amber-50 text-amber-700"

  return <Badge className={`rounded-full ${styles}`}>{role}</Badge>
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string
  value?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 break-words text-sm font-medium text-slate-900">
        {value || "—"}
      </div>
    </div>
  )
}

function MetaRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-slate-500">{label}</div>
      <div className="text-right font-medium text-slate-900">{value}</div>
    </div>
  )
}

const OrganizationDetailPage = () => {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get("tab") === "members" ? "members" : "overview"

  const [activeTab, setActiveTab] = React.useState<"overview" | "members">(
    initialTab as "overview" | "members"
  )
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
        setError("Failed to load organization.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [id])

  React.useEffect(() => {
    const next = searchParams.get("tab") === "members" ? "members" : "overview"
    setActiveTab(next)
  }, [searchParams])

  const handleTabChange = (value: string) => {
    const next = value === "members" ? "members" : "overview"
    setActiveTab(next)
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      if (next === "overview") {
        params.delete("tab")
      } else {
        params.set("tab", next)
      }
      return params
    })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading organization...
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

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-white md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge isActive={organization.is_active} />
                <RoleBadge role={organization.current_membership?.role} />
                {organization.member_count !== undefined ? (
                  <Badge className="rounded-full border border-white/15 bg-white/10 text-white">
                    {organization.member_count} member
                    {organization.member_count === 1 ? "" : "s"}
                  </Badge>
                ) : null}
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white shadow-sm backdrop-blur">
                  <Building2 className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-3xl font-semibold tracking-tight">
                    {organization.name}
                  </h1>
                  
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" className="rounded-2xl">
                <Link to="/settings/organizations">Back</Link>
              </Button>
              <Button asChild className="rounded-2xl bg-white text-slate-900 hover:bg-slate-100">
                <Link to={`/settings/organizations/${organization.id}/settings`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit organization
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 md:px-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="rounded-2xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-12">
                <div className="space-y-6 xl:col-span-8">
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                      <BadgeCheck className="h-5 w-5 text-slate-700" />
                      <h2 className="text-lg font-semibold text-slate-900">
                        Organization profile
                      </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoCard label="Legal Name" value={organization.legal_name} />
                      <InfoCard label="Tax Number" value={organization.tax_number} />
                      <InfoCard
                        label="Email"
                        value={organization.email}
                        icon={<Mail className="h-4 w-4 text-slate-500" />}
                      />
                      <InfoCard
                        label="Phone"
                        value={organization.phone}
                        icon={<Phone className="h-4 w-4 text-slate-500" />}
                      />
                      <InfoCard label="Website" value={organization.website} />
                      <InfoCard label="Address" value={organization.address} />
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-slate-700" />
                      <h2 className="text-lg font-semibold text-slate-900">
                        Document defaults
                      </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <InfoCard
                        label="Default Currency"
                        value={organization.default_currency}
                      />
                      <InfoCard
                        label="Currency Symbol"
                        value={organization.currency_symbol || "—"}
                      />
                      <InfoCard
                        label="Supported Currencies"
                        value={organization.supported_currencies?.join(", ")}
                      />
                      <InfoCard
                        label="Invoice Prefix"
                        value={organization.invoice_prefix}
                      />
                      <InfoCard
                        label="Quotation Prefix"
                        value={organization.quotation_prefix}
                      />
                      <InfoCard
                        label="Proforma Prefix"
                        value={organization.proforma_prefix}
                      />
                      <InfoCard
                        label="Receipt Prefix"
                        value={organization.receipt_prefix}
                      />
                      <InfoCard
                        label="Delivery Note Prefix"
                        value={organization.delivery_note_prefix}
                      />
                    </div>
                  </section>
                </div>

                <div className="space-y-6 xl:col-span-4">
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-slate-700" />
                      <h2 className="text-lg font-semibold text-slate-900">
                        Workspace metadata
                      </h2>
                    </div>

                    <div className="space-y-4 text-sm">
                      <MetaRow
                        label="Status"
                        value={<StatusBadge isActive={organization.is_active} />}
                      />
                      <MetaRow
                        label="Your role"
                        value={
                          organization.current_membership?.role ? (
                            <RoleBadge role={organization.current_membership.role} />
                          ) : (
                            "—"
                          )
                        }
                      />
                      <MetaRow
                        label="Members"
                        value={organization.member_count ?? "—"}
                      />
                      <MetaRow
                        label="Created"
                        value={new Date(organization.created_at).toLocaleString()}
                      />
                      <MetaRow
                        label="Updated"
                        value={new Date(organization.updated_at).toLocaleString()}
                      />
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-center gap-2">
                      <Users2 className="h-5 w-5 text-slate-700" />
                      <h2 className="text-lg font-semibold text-slate-900">
                        Team access
                      </h2>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Use the Members tab to invite people, update profiles, change
                      roles, deactivate access, and remove memberships.
                    </p>

                    <div className="mt-4">
                      <Button
                        onClick={() => handleTabChange("members")}
                        className="rounded-2xl"
                      >
                        Open members
                      </Button>
                    </div>
                  </section>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="members">
              <OrganizationMembersPanel companyId={organization.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default OrganizationDetailPage