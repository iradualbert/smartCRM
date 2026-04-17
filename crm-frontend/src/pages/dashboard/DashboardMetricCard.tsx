import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
  label: string
  value: string
  hint?: string
  icon?: React.ReactNode
}

export default function DashboardMetricCard({
  label,
  value,
  hint,
  icon,
}: Props) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {value}
            </div>
            {hint ? (
              <div className="mt-2 text-xs leading-5 text-slate-500">{hint}</div>
            ) : null}
          </div>

          {icon ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              {icon}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}