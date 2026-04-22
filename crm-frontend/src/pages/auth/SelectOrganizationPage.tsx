import * as React from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { ArrowRight, Building2, Loader2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getMembershipOrganizations } from "@/redux/actions/userActions"

const ORG_STORAGE_KEY = "currentOrganizationId"

export default function SelectOrganizationPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { organizations, credentials } = useSelector((state: any) => state.user)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      await (dispatch as any)(getMembershipOrganizations())
      setLoading(false)
    }
    load()
  }, [dispatch])

  const handleSelect = (org: any) => {
    localStorage.setItem(ORG_STORAGE_KEY, org.id.toString())
    navigate("/dashboard")
  }

  const firstName = credentials?.first_name || credentials?.username || "there"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {loading
              ? "Loading your workspaces…"
              : organizations.length === 0
              ? "You don't have any organizations yet."
              : organizations.length === 1
              ? "Select your workspace to continue."
              : "Select a workspace to continue."}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {organizations.map((org: any) => (
              <button
                key={org.id}
                onClick={() => handleSelect(org)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                  <Building2 className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {org.name}
                    </span>
                    {org.current_membership?.role && (
                      <Badge className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0 text-xs text-slate-600">
                        {org.current_membership.role}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {[
                      org.default_currency,
                      org.member_count != null
                        ? `${org.member_count} member${org.member_count !== 1 ? "s" : ""}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-900" />
              </button>
            ))}

            <Link
              to="/settings/organizations/new"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm font-medium text-slate-500 shadow-sm transition hover:border-slate-400 hover:text-slate-900"
            >
              <Plus className="h-4 w-4" />
              Create new organization
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
