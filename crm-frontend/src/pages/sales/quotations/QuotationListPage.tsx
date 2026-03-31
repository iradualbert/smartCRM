import * as React from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { listQuotations, type Quotation } from "./api"

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    expired: "bg-amber-100 text-amber-700",
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  )
}

const QuotationListPage = () => {
  const [quotations, setQuotations] = React.useState<Quotation[]>([])
  const [count, setCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await listQuotations()
        setQuotations(data.results)
        setCount(data.count)
      } catch (error) {
        console.error(error)
        setError("Failed to load quotations.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const filteredQuotations = quotations.filter((quotation) => {
    const q = search.trim().toLowerCase()
    if (!q) return true

    return (
      quotation.quote_number.toLowerCase().includes(q) ||
      quotation.name.toLowerCase().includes(q) ||
      quotation.status.toLowerCase().includes(q) ||
      (quotation.currency || "").toLowerCase().includes(q)
    )
  })

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quotations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, browse, and manage quotation records.
          </p>
          {!loading && !error ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {count} total quotation{count === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/sales">Sales Dashboard</Link>
          </Button>
          <Button asChild>
            <Link to="/quotations/new">Create Quotation</Link>
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search quotations by number, name, status, or currency..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          Loading quotations...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div className="rounded-xl border p-6">
          <h2 className="font-semibold">No quotations found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or create a new quotation.
          </p>

          <div className="mt-4">
            <Button asChild>
              <Link to="/quotations/new">Create Quotation</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Quote #</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Currency</th>
                <th className="px-4 py-3 font-medium">Subtotal</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">PDF</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredQuotations.map((quotation) => (
                <tr key={quotation.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{quotation.quote_number}</td>
                  <td className="px-4 py-3">{quotation.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={quotation.status} />
                  </td>
                  <td className="px-4 py-3">{quotation.currency || "—"}</td>
                  <td className="px-4 py-3">{quotation.subtotal}</td>
                  <td className="px-4 py-3 font-medium">{quotation.total}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        quotation.pdf_needs_regeneration
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {quotation.pdf_needs_regeneration ? "Needs refresh" : "Up to date"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(quotation.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/quotations/${quotation.id}`}>Open</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/quotations/${quotation.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default QuotationListPage