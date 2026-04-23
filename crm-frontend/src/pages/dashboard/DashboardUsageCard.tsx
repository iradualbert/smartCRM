import { HardDrive, Mail, ShieldCheck, FileText, AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardPlanLimits } from "./api"

type Props = {
  usage: {
    documents_created: number
    emails_sent: number
    storage_mb: number
  }
  planLimits: DashboardPlanLimits | null
  subscription: {
    plan: string
    status: string
    current_period_end: string | null
    auto_renew: boolean
  }
}

function UsageBar({ used, limit }: { used: number; limit: number | null }) {
  if (limit === null) return <div className="mt-2 text-xs text-slate-400">Unlimited</div>

  const pct = Math.min(100, Math.round((used / limit) * 100))
  const isWarning = pct >= 80
  const isOver = pct >= 100

  const barColor = isOver
    ? "bg-rose-500"
    : isWarning
    ? "bg-amber-400"
    : "bg-teal-500"

  const textColor = isOver ? "text-rose-700" : isWarning ? "text-amber-700" : "text-slate-500"

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className={`mt-1 text-xs ${textColor}`}>
        {used} / {limit} used
        {isOver ? " — limit reached" : isWarning ? " — nearing limit" : ""}
      </div>
    </div>
  )
}

export default function DashboardUsageCard({ usage, planLimits, subscription }: Props) {
  const docLimit = planLimits?.max_documents_per_month ?? null
  const emailLimit = planLimits?.max_emails_per_month ?? null
  const docPct = docLimit ? Math.round((usage.documents_created / docLimit) * 100) : 0
  const emailPct = emailLimit ? Math.round((usage.emails_sent / emailLimit) * 100) : 0
  const atLimit = docPct >= 100 || emailPct >= 100

  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-900">Plan and usage</h2>
        </div>

        {atLimit ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              You've reached a plan limit.{" "}
              <Link to="/settings/billing" className="font-medium underline">
                Upgrade your plan
              </Link>{" "}
              to continue.
            </span>
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileText className="h-4 w-4" />
              Documents this month
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{usage.documents_created}</div>
            <UsageBar used={usage.documents_created} limit={docLimit} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4" />
              Emails this month
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{usage.emails_sent}</div>
            <UsageBar used={usage.emails_sent} limit={emailLimit} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <HardDrive className="h-4 w-4" />
              Stored files
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{usage.storage_mb} MB</div>
            {planLimits?.max_storage_mb ? (
              <UsageBar used={usage.storage_mb} limit={planLimits.max_storage_mb} />
            ) : (
              <div className="mt-2 text-xs text-slate-400">Unlimited</div>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Subscription</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {subscription.plan || "Free"}
          </div>
          <div className="mt-1 text-sm text-slate-600 capitalize">
            Status: {subscription.status || "inactive"}
          </div>
          {subscription.current_period_end ? (
            <div className="mt-1 text-sm text-slate-600">
              Period ends: {new Date(subscription.current_period_end).toLocaleDateString()}
            </div>
          ) : null}
          <Link
            to="/settings/billing"
            className="mt-3 inline-block text-xs font-medium text-sky-700 hover:underline"
          >
            Manage billing →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
