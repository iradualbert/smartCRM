import * as React from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, ArrowRight, FileText, Package2, Plus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useOrganizations } from "@/redux/hooks/useOrganizations"
import { getWorkspaceDashboard } from "./api"
import DashboardMetricCard from "./DashboardMetricCard"
import DashboardAttentionPanel from "./DashboardAttentionPanel"
import DashboardActivityFeed from "./DashboardActivityFeed"
import DashboardSetupCard from "./DashboardSetupCard"
import DashboardUsageCard from "./DashboardUsageCard"

export default function DashboardPage() {
  const { currentOrganizationId } = useOrganizations()
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const run = async () => {
      if (!currentOrganizationId) {
        setError("No current organization selected.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await getWorkspaceDashboard(currentOrganizationId)
        setData(response)
      } catch (err) {
        console.error(err)
        setError("Failed to load dashboard.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [currentOrganizationId])

  if (loading) {
    return <div className="mx-auto max-w-7xl p-6 md:p-8 text-sm text-slate-500">Loading dashboard...</div>
  }

  if (error || !data) {
    return <div className="mx-auto max-w-7xl p-6 md:p-8 text-sm text-rose-700">{error || "Failed to load dashboard."}</div>
  }

  const metricIcons = [<Users className="h-5 w-5" />, <Package2 className="h-5 w-5" />, <FileText className="h-5 w-5" />, <AlertTriangle className="h-5 w-5" />]

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            Workspace overview
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Keep an eye on workspace readiness, recent movement, and the few items that need attention.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/sales-dashboard">Sales Dashboard</Link>
          </Button>
          <Button asChild className="rounded-2xl">
            <Link to="/quotations/new">
              <Plus className="mr-2 h-4 w-4" />
              Create quotation
            </Link>
          </Button>
        </div>
      </div>

      {data.is_new_workspace ? (
        <div className="mb-8 overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white shadow-sm">
          <div className="p-6 md:p-8">
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
              Getting started
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              Welcome to Modura
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Create professional quotations, convert them to invoices, and send everything directly to your clients — all in one place.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { step: "1", title: "Add a customer", detail: "Add the client you'll be billing.", href: "/customers", cta: "Add customer" },
                { step: "2", title: "Create a quotation", detail: "Fill in line items, taxes, and send.", href: "/quotations/new", cta: "Create quotation" },
                { step: "3", title: "Convert & collect", detail: "Turn accepted quotations into invoices.", href: null, cta: null },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                    {item.step}
                  </div>
                  <div className="font-medium text-slate-900">{item.title}</div>
                  <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                  {item.href && item.cta ? (
                    <Button asChild variant="outline" className="mt-4 rounded-xl" size="sm">
                      <Link to={item.href}>
                        {item.cta}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button asChild className="rounded-2xl">
                <Link to="/quotations/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first quotation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((item: any, index: number) => (
          <DashboardMetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            icon={metricIcons[index]}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <DashboardSetupCard items={data.setup} />
          <DashboardActivityFeed items={data.activity} />
        </div>

        <div className="space-y-6 xl:col-span-4">
          <DashboardAttentionPanel items={data.attention} />
          <DashboardUsageCard usage={data.usage} planLimits={data.plan_limits} subscription={data.subscription} />
        </div>
      </div>
    </div>
  )
}
