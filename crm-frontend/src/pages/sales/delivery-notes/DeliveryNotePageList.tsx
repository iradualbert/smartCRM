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
  MoreHorizontal,
  Plus,
  Search,
  Truck,
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
import { listDeliveryNotes, type DeliveryNote, type DeliveryNoteStatus } from "./api"

function statusConfig(status: DeliveryNoteStatus) {
  switch (status) {
    case "delivered":
      return {
        label: "Delivered",
        icon: CheckCircle2,
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      }
    case "dispatched":
      return {
        label: "Dispatched",
        icon: Truck,
        className: "border-sky-200 bg-sky-50 text-sky-700",
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

function DeliveryNoteStatusBadge({ status }: { status: DeliveryNoteStatus }) {
  const config = statusConfig(status)
  const Icon = config.icon

  return (
    <Badge className={`rounded-full border px-2.5 py-1 ${config.className}`}>
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  )
}

export default function DeliveryNoteListPage() {
  const navigate = useNavigate()

  const [data, setData] = React.useState<DeliveryNote[]>([])
  const [count, setCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"all" | DeliveryNoteStatus>("all")
  const [sorting, setSorting] = React.useState<SortingState>([])

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await listDeliveryNotes()
        setData(response.results)
        setCount(response.count)
      } catch (err) {
        console.error(err)
        setError("Failed to load delivery notes.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const matchesTab = activeTab === "all" ? true : item.status === activeTab
      if (!matchesTab) return false

      const q = globalFilter.trim().toLowerCase()
      if (!q) return true

      return (
        item.delivery_note_number.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        (item.currency || "").toLowerCase().includes(q) ||
        String(item.invoice).includes(q) ||
        item.delivery_date.toLowerCase().includes(q)
      )
    })
  }, [data, activeTab, globalFilter])

  const columns = React.useMemo<ColumnDef<DeliveryNote>[]>(
    () => [
      {
        accessorKey: "delivery_note_number",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-medium text-slate-600 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Delivery note
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-900">{row.original.delivery_note_number}</div>
            <div className="mt-1 text-xs text-slate-500">
              Invoice #{row.original.invoice}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <DeliveryNoteStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "delivery_date",
        header: "Delivery date",
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.delivery_date}</span>,
      },
      {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.currency || "—"}</span>,
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
              onClick={() => navigate(`/delivery-notes/${row.original.id}`)}
            >
              <Eye className="h-4 w-4" />
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

              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem onClick={() => navigate(`/delivery-notes/${row.original.id}`)}>
                  Open delivery note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/delivery-notes/${row.original.id}/edit`)}>
                  Edit delivery note
                </DropdownMenuItem>
                <DropdownMenuItem>Download PDF</DropdownMenuItem>
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
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const metrics = React.useMemo(() => {
    const draft = filteredData.filter((item) => item.status === "draft").length
    const dispatched = filteredData.filter((item) => item.status === "dispatched").length
    const delivered = filteredData.filter((item) => item.status === "delivered").length
    const cancelled = filteredData.filter((item) => item.status === "cancelled").length
    return { draft, dispatched, delivered, cancelled }
  }, [filteredData])

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm text-sky-700">
            <Truck className="mr-2 h-4 w-4" />
            Fulfillment workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Delivery Notes
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            Track dispatch and delivery records tied to invoices and shipped goods.
          </p>

          {!loading && !error ? (
            <p className="mt-2 text-xs text-slate-500">
              {count} total delivery note{count === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <Button asChild className="rounded-2xl">
            <Link to="/delivery-notes/new">
              <Plus className="mr-2 h-4 w-4" />
              New delivery note
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Draft</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{metrics.draft}</div>
            <div className="mt-2 text-sm text-slate-500">Pending logistics action</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Dispatched</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{metrics.dispatched}</div>
            <div className="mt-2 text-sm text-slate-500">On the move</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Delivered</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{metrics.delivered}</div>
            <div className="mt-2 text-sm text-slate-500">Completed successfully</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Cancelled</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{metrics.cancelled}</div>
            <div className="mt-2 text-sm text-slate-500">Removed from workflow</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/70">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-slate-900">Delivery note list</CardTitle>
              <CardDescription>
                Search and track delivery progress in one table.
              </CardDescription>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search note number, status, date, currency, or invoice..."
                className="rounded-2xl border-slate-200 bg-white pl-10"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mt-4 h-auto flex-wrap rounded-2xl bg-slate-100 p-1">
              <TabsTrigger value="all" className="rounded-xl">All</TabsTrigger>
              <TabsTrigger value="draft" className="rounded-xl">Draft</TabsTrigger>
              <TabsTrigger value="dispatched" className="rounded-xl">Dispatched</TabsTrigger>
              <TabsTrigger value="delivered" className="rounded-xl">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-xl">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading delivery notes...</div>
          ) : error ? (
            <div className="p-6">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            </div>
          ) : table.getRowModel().rows.length === 0 ? (
            <div className="p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="font-semibold text-slate-900">No delivery notes found</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Try a different search or create a new delivery note.
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