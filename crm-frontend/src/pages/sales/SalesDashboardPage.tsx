import * as React from "react"
import { Link } from "react-router-dom"
import {
  FileText,
  Users,
  Package,
  FilePlus2,
  Receipt,
  Truck,
  FileCheck2,
  Files,
  ArrowRight,
  FolderOpen,
  Clock3,
  CircleDollarSign,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { listQuotations, type Quotation } from "./quotations/api"

type DocFilter =
  | "all"
  | "quotation"
  | "invoice"
  | "proforma"
  | "receipt"
  | "delivery-note"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function QuickCreateCard({
  title,
  description,
  to,
  icon: Icon,
  iconClassName,
}: {
  title: string
  description: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  iconClassName: string
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={cn(
          "mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white",
          iconClassName
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        Create
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function SideNavLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-muted"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  )
}

function QuickCreateLink({
  to,
  label,
  icon: Icon,
  colorClass,
}: {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium transition hover:bg-muted"
    >
      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-xl text-white",
          colorClass
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </Link>
  )
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-background hover:bg-muted"
      )}
    >
      {children}
    </button>
  )
}

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
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        styles[status] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {status}
    </span>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </span>
      </div>
    </div>
  )
}

const SalesDashboardPage = () => {
  const [quotations, setQuotations] = React.useState<Quotation[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<DocFilter>("all")

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const data = await listQuotations()
        setQuotations(data.results)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const filteredRows = quotations.filter((quotation) => {
    const matchesSearch = search.trim()
      ? [
          quotation.quote_number,
          quotation.name,
          quotation.status,
          quotation.currency ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      : true

    const matchesFilter =
      filter === "all" ? true : filter === "quotation"

    return matchesSearch && matchesFilter
  })

  const draftCount = quotations.filter((q) => q.status === "draft").length
  const approvedCount = quotations.filter((q) => q.status === "approved").length
  const needsPdfRefresh = quotations.filter((q) => q.pdf_needs_regeneration).length
  const totalValue = quotations.reduce((sum, q) => sum + Number(q.total || 0), 0)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-[1400px] p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-3xl border bg-card p-4 shadow-sm">
            <div className="mb-4 space-y-2">
              <SideNavLink to="/sales" label="Documents" icon={Files} active />
              <SideNavLink to="/customers" label="Customers" icon={Users} />
              <SideNavLink to="/products" label="Items" icon={Package} />
            </div>

            <div className="my-4 border-t" />

            <div>
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Create
              </p>

              <div className="space-y-1">
                <QuickCreateLink
                  to="/quotations/new"
                  label="Quotation"
                  icon={FileText}
                  colorClass="bg-blue-500"
                />
                <QuickCreateLink
                  to="/invoices/new"
                  label="Invoice"
                  icon={FileCheck2}
                  colorClass="bg-green-500"
                />
                <QuickCreateLink
                  to="/proformas/new"
                  label="Proforma"
                  icon={FilePlus2}
                  colorClass="bg-violet-500"
                />
                <QuickCreateLink
                  to="/receipts/new"
                  label="Receipt"
                  icon={Receipt}
                  colorClass="bg-orange-500"
                />
                <QuickCreateLink
                  to="/delivery-notes/new"
                  label="Delivery Note"
                  icon={Truck}
                  colorClass="bg-teal-500"
                />
              </div>
            </div>

            <div className="my-4 border-t" />

            <div className="space-y-3 rounded-2xl bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Workflow</p>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-xl bg-background px-3 py-2">
                  <span>Quotation</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-background px-3 py-2">
                  <span>Proforma</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-background px-3 py-2">
                  <span>Invoice</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create and manage quotations, proformas, invoices, receipts,
                  and delivery notes from one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/quotations/new">Create Quotation</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/quotations">View Quotations</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Draft Quotations"
                value={String(draftCount)}
                icon={Clock3}
              />
              <MetricCard
                label="Approved Quotations"
                value={String(approvedCount)}
                icon={FileCheck2}
              />
              <MetricCard
                label="PDF Refresh Needed"
                value={String(needsPdfRefresh)}
                icon={Files}
              />
              <MetricCard
                label="Quotation Value"
                value={totalValue.toFixed(2)}
                icon={CircleDollarSign}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <QuickCreateCard
                title="Create Quotation"
                description="Start a new quotation with editable line items."
                to="/quotations/new"
                icon={FileText}
                iconClassName="bg-blue-500"
              />

              <QuickCreateCard
                title="Create Invoice"
                description="Move billing forward when documents are ready."
                to="/invoices/new"
                icon={FileCheck2}
                iconClassName="bg-green-500"
              />

              <QuickCreateCard
                title="Create Proforma"
                description="Prepare a proforma from the sales workflow."
                to="/proformas/new"
                icon={FilePlus2}
                iconClassName="bg-violet-500"
              />

              <QuickCreateCard
                title="Create Receipt"
                description="Record payment acknowledgements."
                to="/receipts/new"
                icon={Receipt}
                iconClassName="bg-orange-500"
              />

              <QuickCreateCard
                title="Create Delivery Note"
                description="Track dispatch and delivery documents."
                to="/delivery-notes/new"
                icon={Truck}
                iconClassName="bg-teal-500"
              />
            </div>

            <section className="rounded-3xl border bg-card p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-2">
                  <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>
                    All Documents
                  </FilterTab>
                  <FilterTab
                    active={filter === "quotation"}
                    onClick={() => setFilter("quotation")}
                  >
                    Quotations
                  </FilterTab>
                  <FilterTab
                    active={filter === "invoice"}
                    onClick={() => setFilter("invoice")}
                  >
                    Invoices
                  </FilterTab>
                  <FilterTab
                    active={filter === "proforma"}
                    onClick={() => setFilter("proforma")}
                  >
                    Proformas
                  </FilterTab>
                  <FilterTab
                    active={filter === "receipt"}
                    onClick={() => setFilter("receipt")}
                  >
                    Receipts
                  </FilterTab>
                  <FilterTab
                    active={filter === "delivery-note"}
                    onClick={() => setFilter("delivery-note")}
                  >
                    Delivery Notes
                  </FilterTab>
                </div>

                <Input
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full xl:max-w-xs"
                />
              </div>

              {loading ? (
                <div className="rounded-2xl border p-8 text-sm text-muted-foreground">
                  Loading documents...
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="rounded-2xl border p-12 text-center text-muted-foreground">
                  <p className="text-base">No documents yet.</p>
                  <p className="mt-1 text-sm">
                    Create your first document to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-muted/50">
                      <tr className="text-left">
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Number</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((quotation) => (
                        <tr key={quotation.id} className="border-t">
                          <td className="px-4 py-3">Quotation</td>
                          <td className="px-4 py-3 font-medium">
                            {quotation.quote_number}
                          </td>
                          <td className="px-4 py-3">{quotation.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(quotation.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={quotation.status} />
                          </td>
                          <td className="px-4 py-3 font-medium">{quotation.total}</td>
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
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export default SalesDashboardPage