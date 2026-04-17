import * as React from "react"
import { Link } from "react-router-dom"
import { Plus, Receipt, ScrollText, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useOrganizations } from "@/redux/hooks/useOrganizations"
import { getSalesDashboard } from "./api"
import DashboardMetricCard from "@/pages/dashboard/DashboardMetricCard"
import DashboardRecentQuotations from "@/pages/dashboard/DashboardRecentQuotations"
import DashboardAttentionPanel from "@/pages/dashboard/DashboardAttentionPanel"
import SalesMoneyPanel from "./SalesMoneyPanel"
import SalesStatusPanel from "./SalesStatusPanel"

export default function SalesDashboardPage() {
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
        const response = await getSalesDashboard(currentOrganizationId)
        setData(response)
      } catch (err) {
        console.error(err)
        setError("Failed to load sales dashboard.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [currentOrganizationId])

  if (loading) {
    return <div className="mx-auto max-w-7xl p-6 md:p-8 text-sm text-slate-500">Loading sales dashboard...</div>
  }

  if (error || !data) {
    return <div className="mx-auto max-w-7xl p-6 md:p-8 text-sm text-rose-700">{error || "Failed to load sales dashboard."}</div>
  }

  const metricIcons = [<ScrollText className="h-5 w-5" />, <ScrollText className="h-5 w-5" />, <Receipt className="h-5 w-5" />, <Wallet className="h-5 w-5" />]

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            Revenue workflow
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Sales Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Track quotations, invoice movement, collections, and revenue workflow health.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/dashboard">Dashboard</Link>
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

      <div className="mt-6">
        <SalesMoneyPanel
          money={data.money}
          currencySymbol={data.company.currency_symbol}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <DashboardRecentQuotations items={data.recent_quotations} />
        </div>

        <div className="space-y-6 xl:col-span-4">
          <DashboardAttentionPanel items={data.attention} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SalesStatusPanel title="Quotations" items={data.status_breakdown.quotations} />
        <SalesStatusPanel title="Invoices" items={data.status_breakdown.invoices} />
        <SalesStatusPanel title="Proformas" items={data.status_breakdown.proformas} />
        <SalesStatusPanel title="Delivery notes" items={data.status_breakdown.delivery_notes} />
      </div>
    </div>
  )
}