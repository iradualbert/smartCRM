import * as React from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, FileText, Package2, Plus, Users } from "lucide-react"

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
          <DashboardUsageCard usage={data.usage} subscription={data.subscription} />
        </div>
      </div>
    </div>
  )
}
