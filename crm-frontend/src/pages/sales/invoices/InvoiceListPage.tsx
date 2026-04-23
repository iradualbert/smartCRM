import * as React from "react"
import { Link } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useOrganizations } from "@/redux/hooks/useOrganizations"
import { listInvoices, type Invoice, type InvoiceStatus } from "./api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "border-slate-200 bg-slate-100 text-slate-700",
    sent: "border-sky-200 bg-sky-50 text-sky-700",
    paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
    overdue: "border-rose-200 bg-rose-50 text-rose-700",
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  )
}

export default function InvoiceListPage() {
  const { currentOrganizationId } = useOrganizations()

  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [count, setCount] = React.useState(0)
  const [limit] = React.useState(10)
  const [offset, setOffset] = React.useState(0)

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [search, setSearch] = React.useState("")
  const [appliedSearch, setAppliedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<InvoiceStatus | "all">("all")

  const load = React.useCallback(async () => {
    if (!currentOrganizationId) {
      setError("No current organization selected.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await listInvoices({
        company: currentOrganizationId,
        limit,
        offset,
        search: appliedSearch,
        status: statusFilter,
      })

      setInvoices(res.results)
      setCount(res.count)
    } catch (err) {
      console.error(err)
      setError("Failed to load invoices.")
    } finally {
      setLoading(false)
    }
  }, [currentOrganizationId, limit, offset, appliedSearch, statusFilter])

  React.useEffect(() => {
    load()
  }, [load])

  const page = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(count / limit))

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            Billing workspace
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Invoices
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage invoices, track payment status, and send to customers.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-2xl">
            <Link to="/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              New invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 grid gap-3 xl:grid-cols-[1fr_200px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-2xl pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | "all")}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="draft">draft</option>
            <option value="sent">sent</option>
            <option value="paid">paid</option>
            <option value="overdue">overdue</option>
          </select>

          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => {
              setOffset(0)
              setAppliedSearch(search.trim())
            }}
          >
            <Filter className="mr-2 h-4 w-4" />
            Apply filters
          </Button>
        </div>

        <div className="mb-4">
          <Badge className="rounded-full border border-slate-200 bg-slate-100 text-slate-700">
            {count} total
          </Badge>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Loading invoices...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {error}
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
              <Receipt className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No invoices found</h2>
            <p className="mt-2 text-sm text-slate-600">
              Try changing your filters or create a new invoice.
            </p>
            <div className="mt-5">
              <Button asChild className="rounded-2xl">
                <Link to="/invoices/new">New invoice</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="px-6 py-3 font-medium text-slate-700">Invoice #</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Currency</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Total</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Created</th>
                    <th className="px-6 py-3 text-right font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-slate-200 hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <Link to={`/invoices/${invoice.id}`} className="hover:underline">
                          {invoice.invoice_number}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-4 text-slate-700">{invoice.currency || "—"}</td>
                      <td className="px-4 py-4 text-slate-700">{invoice.total}</td>
                      <td className="px-4 py-4 text-slate-700">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl">
                            <DropdownMenuItem asChild>
                              <Link to={`/invoices/${invoice.id}`}>Open</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/invoices/${invoice.id}/edit`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/invoices/${invoice.id}/email`}>Send email</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  disabled={offset === 0}
                  onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  disabled={offset + limit >= count}
                  onClick={() => setOffset((prev) => prev + limit)}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
