import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { DashboardRecentQuotation } from "./api"

type Props = {
  items: DashboardRecentQuotation[]
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "sent"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : status === "rejected"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : status === "expired"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-100 text-slate-700"

  return <Badge className={`rounded-full border ${styles}`}>{status}</Badge>
}

export default function DashboardRecentQuotations({ items }: Props) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Recent quotations</h2>
          <Link
            to="/quotations"
            className="text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            View all
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="pl-6">Quote #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="pr-6">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    No quotations yet.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/70">
                    <TableCell className="pl-6 font-medium text-slate-900">
                      <Link to={`/quotations/${item.id}`} className="hover:underline">
                        {item.quote_number}
                      </Link>
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>{item.total}</TableCell>
                    <TableCell className="pr-6">
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}