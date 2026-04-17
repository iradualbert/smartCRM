import { HardDrive, Mail, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
  usage: {
    documents_created: number
    emails_sent: number
    storage_mb: number
  }
  subscription: {
    plan: string
    status: string
    current_period_end: string | null
    auto_renew: boolean
  }
}

export default function DashboardUsageCard({ usage, subscription }: Props) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-900">Workspace health</h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4" />
              Emails sent
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {usage.emails_sent}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <HardDrive className="h-4 w-4" />
              Storage
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {usage.storage_mb} MB
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-500">Subscription</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {subscription.plan || "free"}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Status: {subscription.status || "inactive"}
          </div>
          {subscription.current_period_end ? (
            <div className="mt-1 text-sm text-slate-600">
              Period ends:{" "}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </div>
          ) : null}
          <div className="mt-1 text-sm text-slate-600">
            Auto renew: {subscription.auto_renew ? "On" : "Off"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}