import * as React from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Building2,
  Plus,
  Search,
  Shield,
  Sparkles,
  Users2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { listCompanies, type Company, type CompanyMembershipRole } from "./api"

type OrganizationRecord = Company & {
  role?: CompanyMembershipRole | null
  is_current?: boolean
}

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
  if (!role) {
    return (
      <Badge className="rounded-full border border-slate-200 bg-slate-100 text-slate-600">
        member
      </Badge>
    )
  }

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

const OrganizationListPage = () => {
  const [organizations, setOrganizations] = React.useState<OrganizationRecord[]>([])
  const [count, setCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await listCompanies()
        const mapped = (data.results || []).map((item, index) => ({
          ...item,
          role: item.current_membership?.role ?? null,
          is_current: index === 0,
        }))

        setOrganizations(mapped)
        setCount(data.count)
      } catch (err) {
        console.error(err)
        setError("Failed to load organizations.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  const filteredOrganizations = organizations.filter((organization) => {
    const q = search.trim().toLowerCase()
    if (!q) return true

    return (
      organization.name.toLowerCase().includes(q) ||
      organization.legal_name?.toLowerCase().includes(q) ||
      organization.default_currency?.toLowerCase().includes(q) ||
      organization.current_membership?.role?.toLowerCase().includes(q)
    )
  })

  const currentOrganization =
    filteredOrganizations.find((org) => org.is_current) ??
    filteredOrganizations[0] ??
    null

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Workspace access
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Organizations
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            View the organizations you belong to, open workspaces, and manage the
            ones you administer.
          </p>

          {!loading && !error ? (
            <p className="mt-2 text-xs text-slate-500">
              {count} organization{count === 1 ? "" : "s"} available
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-2xl">
            <Link to="/settings/organizations/new">
              <Plus className="mr-2 h-4 w-4" />
              Create organization
            </Link>
          </Button>
        </div>
      </div>

      {currentOrganization && !loading && !error ? (
        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-slate-200 bg-slate-100 text-slate-700">
                  Current workspace
                </Badge>
                <RoleBadge role={currentOrganization.role} />
                <StatusBadge isActive={currentOrganization.is_active} />
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                  <Building2 className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
                    {currentOrganization.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {currentOrganization.legal_name || "No legal name added yet"}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Currency
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-900">
                        {currentOrganization.default_currency}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Members
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-900">
                        {currentOrganization.member_count ?? "—"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Joined / Created
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-900">
                        {new Date(currentOrganization.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <Shield className="h-4 w-4 text-slate-600" />
                  Access & administration
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Open this workspace, update organization details, manage members,
                  and configure its operational defaults.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button asChild className="rounded-2xl">
                  <Link to={`/settings/organizations/${currentOrganization.id}`}>
                    Open organization
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild variant="outline" className="rounded-2xl">
                  <Link
                    to={`/settings/organizations/${currentOrganization.id}/settings`}
                  >
                    Organization settings
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-2xl border-slate-200 bg-white pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading organizations...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
          {error}
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Users2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No organizations found
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Try changing your search, or create a new organization to start using
            the workspace.
          </p>

          <div className="mt-5">
            <Button asChild className="rounded-2xl">
              <Link to="/settings/organizations/new">Create organization</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrganizations.map((organization) => (
            <div
              key={organization.id}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                  <Building2 className="h-5 w-5" />
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  {organization.is_current ? (
                    <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                      Current
                    </Badge>
                  ) : null}
                  <RoleBadge role={organization.role} />
                </div>
              </div>

              <div>
                <h3 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                  {organization.name}
                </h3>
                <p className="mt-1 line-clamp-2 min-h-[40px] text-sm leading-6 text-slate-600">
                  {organization.legal_name || "No legal entity name provided yet."}
                </p>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  <StatusBadge isActive={organization.is_active} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Currency</span>
                  <span className="font-medium text-slate-900">
                    {organization.default_currency}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Members</span>
                  <span className="font-medium text-slate-900">
                    {organization.member_count ?? "—"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button asChild variant="outline" className="flex-1 rounded-2xl">
                  <Link to={`/settings/organizations/${organization.id}`}>Open</Link>
                </Button>
                <Button asChild className="flex-1 rounded-2xl">
                  <Link to={`/settings/organizations/${organization.id}/settings`}>
                    Manage
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrganizationListPage