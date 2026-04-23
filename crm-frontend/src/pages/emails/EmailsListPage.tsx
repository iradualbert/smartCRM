import * as React from "react"
import { Link } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MailCheck,
  MoreHorizontal,
  RefreshCcw,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useOrganizations } from "@/redux/hooks/useOrganizations"
import {
  listDocumentEmails,
  retryDocumentEmail,
  type DocumentEmail,
  type DocumentEmailStatus,
} from "./api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function EmailStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    sent: "border-emerald-200 bg-emerald-50 text-emerald-700",
    failed: "border-rose-200 bg-rose-50 text-rose-700",
    cancelled: "border-slate-200 bg-slate-100 text-slate-700",
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  )
}

function SourceModelBadge({ sourceModel }: { sourceModel: string }) {
  const labelMap: Record<string, string> = {
    quotation: "Quotation",
    invoice: "Invoice",
    proforma: "Proforma",
    receipt: "Receipt",
    delivery_note: "Delivery Note",
    deliverynote: "Delivery Note",
  }

  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      {labelMap[sourceModel] ?? sourceModel}
    </span>
  )
}

function getDocumentUrl(email: DocumentEmail) {
  const id = email.source_object_id
  switch (email.source_model) {
    case "quotation":
      return `/quotations/${id}`
    case "invoice":
      return `/invoices/${id}`
    case "proforma":
      return `/proformas/${id}`
    case "receipt":
      return `/receipts/${id}`
    case "delivery_note":
    case "deliverynote":
      return `/delivery-notes/${id}`
    default:
      return "#"
  }
}

function getDisplayIdentifier(email: DocumentEmail) {
  return email.source_identifier || "—"
}

export default function EmailsListPage() {
  const { currentOrganizationId } = useOrganizations()

  const [emails, setEmails] = React.useState<DocumentEmail[]>([])
  const [count, setCount] = React.useState(0)
  const [limit] = React.useState(10)
  const [offset, setOffset] = React.useState(0)

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [retryingId, setRetryingId] = React.useState<string | null>(null)

  const [search, setSearch] = React.useState("")
  const [appliedSearch, setAppliedSearch] = React.useState("")

  const [statusFilter, setStatusFilter] = React.useState<DocumentEmailStatus | "all">("all")
  const [documentTypeFilter, setDocumentTypeFilter] = React.useState<string | "all">("all")
  const [receiverFilter, setReceiverFilter] = React.useState("")
  const [appliedReceiverFilter, setAppliedReceiverFilter] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")

  const load = React.useCallback(async () => {
    if (!currentOrganizationId) {
      setError("No current organization selected.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const emailRes = await listDocumentEmails({
        company: currentOrganizationId,
        limit,
        offset,
        search: appliedSearch,
        status: statusFilter,
        source_model: documentTypeFilter,
        recipient: appliedReceiverFilter,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      })

      setEmails(emailRes.results)
      setCount(emailRes.count)
    } catch (err) {
      console.error(err)
      setError("Failed to load sent emails.")
    } finally {
      setLoading(false)
    }
  }, [
    currentOrganizationId,
    limit,
    offset,
    appliedSearch,
    statusFilter,
    documentTypeFilter,
    appliedReceiverFilter,
    dateFrom,
    dateTo,
  ])

  React.useEffect(() => {
    load()
  }, [load])

  const handleApplyFilters = () => {
    setOffset(0)
    setAppliedSearch(search.trim())
    setAppliedReceiverFilter(receiverFilter.trim())
  }

  const handleRetry = async (emailId: string) => {
    try {
      setRetryingId(emailId)
      await retryDocumentEmail(emailId)
      await load()
    } catch (err) {
      console.error(err)
      setError("Failed to retry email.")
    } finally {
      setRetryingId(null)
    }
  }

  const page = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(count / limit))

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            Email activity
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Sent Emails
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Track sent, pending, and failed emails by organization, document type, recipient, and date.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/settings/email">Email Configuration</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 grid gap-3 xl:grid-cols-[1.2fr_220px_220px_1fr_180px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search subject or document..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-2xl pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as DocumentEmailStatus | "all")
            }
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">pending</option>
            <option value="sent">sent</option>
            <option value="failed">failed</option>
            <option value="cancelled">cancelled</option>
          </select>

          <select
            value={documentTypeFilter}
            onChange={(e) => setDocumentTypeFilter(e.target.value)}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="all">All document types</option>
            <option value="quotation">Quotation</option>
            <option value="invoice">Invoice</option>
            <option value="proforma">Proforma</option>
            <option value="receipt">Receipt</option>
            <option value="delivery_note">Delivery Note</option>
          </select>

          <Input
            placeholder="Filter by receiver email..."
            value={receiverFilter}
            onChange={(e) => setReceiverFilter(e.target.value)}
            className="rounded-2xl"
          />

          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-2xl"
          />

          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-2xl"
          />

          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={handleApplyFilters}
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
            Loading sent emails...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {error}
          </div>
        ) : emails.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
              <MailCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No emails found
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Try changing your filters or send an email from a document page.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="px-6 py-3 font-medium text-slate-700">Document</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Type</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Receiver</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Subject</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Sent</th>
                    <th className="px-6 py-3 text-right font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email) => (
                    <tr
                      key={email.id}
                      className="border-t border-slate-200 hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <Link to={getDocumentUrl(email)} className="hover:underline">
                          {getDisplayIdentifier(email)}
                        </Link>
                      </td>

                      <td className="px-4 py-4">
                        <SourceModelBadge sourceModel={email.source_model} />
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {email.to_emails?.length ? email.to_emails.join(", ") : "—"}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        <div className="max-w-[320px] truncate">{email.subject}</div>
                      </td>

                      <td className="px-4 py-4">
                        <EmailStatusBadge status={email.status} />
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {email.sent_at
                          ? new Date(email.sent_at).toLocaleDateString()
                          : email.queued_at
                          ? new Date(email.queued_at).toLocaleDateString()
                          : "—"}
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
                              <Link to={getDocumentUrl(email)}>Open document</Link>
                            </DropdownMenuItem>

                            {email.status === "failed" ? (
                              <DropdownMenuItem
                                onClick={() => handleRetry(email.id)}
                                disabled={retryingId === email.id}
                              >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                {retryingId === email.id ? "Retrying..." : "Retry send"}
                              </DropdownMenuItem>
                            ) : null}
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