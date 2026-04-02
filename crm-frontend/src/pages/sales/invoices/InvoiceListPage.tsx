import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Filter,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  AlertCircle,
  Clock3,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { listInvoices, type Invoice, type InvoiceStatus } from "./api"

function statusConfig(status: InvoiceStatus) {
  switch (status) {
    case "paid":
      return {
        label: "Paid",
        icon: CheckCircle2,
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      }
    case "sent":
      return {
        label: "Sent",
        icon: Mail,
        className: "border-sky-200 bg-sky-50 text-sky-700",
      }
    case "overdue":
      return {
        label: "Overdue",
        icon: AlertCircle,
        className: "border-rose-200 bg-rose-50 text-rose-700",
      }
    case "partially_paid":
      return {
        label: "Partially paid",
        icon: Clock3,
        className: "border-amber-200 bg-amber-50 text-amber-700",
      }
    case "cancelled":
      return {
        label: "Cancelled",
        icon: XCircle,
        className: "border-zinc-200 bg-zinc-100 text-zinc-700",
      }
    default:
      return {
        label: "Draft",
        icon: FileText,
        className: "border-slate-200 bg-slate-100 text-slate-700",
      }
  }
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig(status)
  const Icon = config.icon

  return (
    <Badge className={`rounded-full border px-2.5 py-1 ${config.className}`}>
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  )
}

export default function InvoiceListPage() {
  const navigate = useNavigate()

  const [data, setData] = React.useState<Invoice[]>([])
  const [count, setCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"all" | InvoiceStatus>("all")
  const [sorting, setSorting] = React.useState<SortingState>([])

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await listInvoices()
        setData(response.results)
        setCount(response.count)
      } catch (err) {
        console.error(err)
        setError("Failed to load invoices.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const filteredData = React.useMemo(() => {
    return data.filter((invoice) => {
      const matchesTab = activeTab === "all" ? true : invoice.status === activeTab
      if (!matchesTab) return false

      const q = globalFilter.trim().toLowerCase()
      if (!q) return true

      return (
        invoice.invoice_number.toLowerCase().includes(q) ||
        invoice.status.toLowerCase().includes(q) ||
        (invoice.currency || "").toLowerCase().includes(q) ||
        String(invoice.proforma).includes(q)
      )
    })
  }, [data, activeTab, globalFilter])

  const columns = React.useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoice_number",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-medium text-slate-600 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Invoice
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-900">{row.original.invoice_number}</div>
            <div className="mt-1 text-xs text-slate-500">
              Proforma #{row.original.proforma}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">{row.original.currency || "—"}</span>
        ),
      },
      {
        accessorKey: "subtotal",
        header: "Subtotal",
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">{row.original.subtotal}</span>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900">{row.original.total}</span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-sm text-slate-500">
            {new Date(row.original.created_at).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => navigate(`/invoices/${row.original.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <Mail className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <Download className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44 rounded-xl">
                <DropdownMenuItem onClick={() => navigate(`/invoices/${row.original.id}`)}>
                  Open invoice
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/invoices/${row.original.id}/edit`)}>
                  Edit invoice
                </DropdownMenuItem>
                <DropdownMenuItem>Email invoice</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [navigate]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const metrics = React.useMemo(() => {
    const outstanding = filteredData
      .filter((item) => item.status !== "paid" && item.status !== "cancelled")
      .reduce((sum, item) => sum + Number(item.total || 0), 0)

    const collected = filteredData
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + Number(item.total || 0), 0)

    const overdue = filteredData
      .filter((item) => item.status === "overdue")
      .reduce((sum, item) => sum + Number(item.total || 0), 0)

    return { outstanding, collected, overdue }
  }, [filteredData])

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm text-sky-700">
            <FileText className="mr-2 h-4 w-4" />
            Billing workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Invoices
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            Review invoice status, manage payment flow, and move quickly between
            create, edit, email, and PDF actions.
          </p>

          {!loading && !error ? (
            <p className="mt-2 text-xs text-slate-500">
              {count} total invoice{count === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <Button asChild className="rounded-2xl">
            <Link to="/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              New invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Total invoices</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">
              {filteredData.length}
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Visible under current filters
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Outstanding</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">
              {metrics.outstanding.toFixed(2)}
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Unpaid and partially paid
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Overdue</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">
              {metrics.overdue.toFixed(2)}
            </div>
            <div className="mt-2 text-sm text-slate-500">Needs follow-up</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Collected</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">
              {metrics.collected.toFixed(2)}
            </div>
            <div className="mt-2 text-sm text-slate-500">Paid invoices total</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/70">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-slate-900">Invoice list</CardTitle>
              <CardDescription>
                TanStack Table powered invoice view with a cleaner light SaaS feel.
              </CardDescription>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search invoice number, status, currency, or proforma..."
                className="rounded-2xl border-slate-200 bg-white pl-10"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mt-4 h-auto flex-wrap rounded-2xl bg-slate-100 p-1">
              <TabsTrigger value="all" className="rounded-xl">
                All
              </TabsTrigger>
              <TabsTrigger value="draft" className="rounded-xl">
                Draft
              </TabsTrigger>
              <TabsTrigger value="sent" className="rounded-xl">
                Sent
              </TabsTrigger>
              <TabsTrigger value="partially_paid" className="rounded-xl">
                Partially paid
              </TabsTrigger>
              <TabsTrigger value="paid" className="rounded-xl">
                Paid
              </TabsTrigger>
              <TabsTrigger value="overdue" className="rounded-xl">
                Overdue
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-xl">
                Cancelled
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading invoices...</div>
          ) : error ? (
            <div className="p-6">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            </div>
          ) : table.getRowModel().rows.length === 0 ? (
            <div className="p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="font-semibold text-slate-900">No invoices found</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Try a different search or create a new invoice.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-slate-200 text-left">
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-4 py-3 font-medium text-slate-600">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}