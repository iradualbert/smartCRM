import { Card, CardContent } from "@/components/ui/card"

type Props = {
  title: string
  items: Record<string, number>
}

export default function SalesStatusPanel({ title, items }: Props) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

        <div className="mt-5 space-y-3">
          {Object.entries(items).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="capitalize text-slate-600">
                {key.replace(/_/g, " ")}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-sm font-medium text-slate-900">
                {value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
