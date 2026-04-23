import { Clock3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardActivityItem } from "./api"

type Props = {
  items: DashboardActivityItem[]
}

export default function DashboardActivityFeed({ items }: Props) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
        </div>

        <div className="mt-5 space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Activity will appear here as documents are created, sent, converted, and paid.
            </div>
          ) : (
            items.map((item, index) => (
              <div key={`${item.type}-${index}`} className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-600" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">
                    {item.label}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
