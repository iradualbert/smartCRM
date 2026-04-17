import { Card, CardContent } from "@/components/ui/card"

type Props = {
  currencySymbol?: string
  money: {
    quotation_pipeline_total: string
    invoice_outstanding_total: string
    receipts_collected_this_month: string
  }
}

export default function SalesMoneyPanel({ money, currencySymbol = "" }: Props) {
  const cards = [
    {
      label: "Quotation pipeline",
      value: `${currencySymbol}${money.quotation_pipeline_total}`,
      hint: "Sent and approved quotation value",
    },
    {
      label: "Outstanding invoices",
      value: `${currencySymbol}${money.invoice_outstanding_total}`,
      hint: "Invoices still awaiting payment",
    },
    {
      label: "Receipts this month",
      value: `${currencySymbol}${money.receipts_collected_this_month}`,
      hint: "Collected in current period",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((item) => (
        <Card key={item.label} className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {item.value}
            </div>
            <div className="mt-2 text-xs text-slate-500">{item.hint}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}