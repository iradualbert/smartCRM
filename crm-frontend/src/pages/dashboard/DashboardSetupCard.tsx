import { CheckCircle2, CircleDashed } from "lucide-react"
import { Link } from "react-router-dom"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { DashboardSetupItem } from "./api"

type Props = {
  items: DashboardSetupItem[]
}

export default function DashboardSetupCard({ items }: Props) {
  const readyCount = items.filter((item) => item.ready).length
  const allReady = items.length > 0 && readyCount === items.length

  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Workspace readiness</h2>
            <p className="mt-1 text-sm text-slate-600">
              Keep the basics in place so the team can create, send, and follow up without friction.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
            {readyCount}/{items.length} ready
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex min-w-0 gap-3">
                <div className="mt-0.5">
                  {item.ready ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <CircleDashed className="h-5 w-5 text-slate-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium text-slate-900">{item.label}</div>
                    <div className="text-sm text-slate-500">{item.value}</div>
                  </div>
                  {item.detail ? (
                    <div className="mt-1 text-sm text-slate-600">{item.detail}</div>
                  ) : null}
                </div>
              </div>

              {item.action_href && item.action_label ? (
                <Button asChild variant="outline" className="rounded-xl">
                  <Link to={item.action_href}>{item.action_label}</Link>
                </Button>
              ) : null}
            </div>
          ))}
        </div>

        {allReady ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            The workspace basics are in place. The team can move straight into document work.
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
