import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardAttentionItem } from "./api"

type Props = {
  items: DashboardAttentionItem[]
}

export default function DashboardAttentionPanel({ items }: Props) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-slate-900">Attention needed</h2>
        </div>

        <div className="mt-5 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              No urgent issues right now. The team can stay focused on current work.
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={`${item.type}-${index}`}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                {item.label}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
