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
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { listTemplates, type Template } from "./api"

function TypeBadge({ type }: { type: Template["document_type"] }) {
  return (
    <Badge className="rounded-full border border-slate-200 bg-slate-50 text-slate-700">
      {type}
    </Badge>
  )
}

export default function TemplateListPage() {
  const navigate = useNavigate()

  const [data, setData] = React.useState<Template[]>([])
  const [count, setCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const response = await listTemplates()
        setData(response.results)
        setCount(response.count)
      } catch (err) {
        console.error(err)
        setError("Failed to load templates.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  const filteredData = React.useMemo(() => {
    const q = globalFilter.trim().toLowerCase()
    if (!q) return data

    return data.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.document_type.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q)
      )
    })
  }, [data, globalFilter])

  const columns = React.useMemo<ColumnDef<Template>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="px-0 font-medium text-slate-600 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Template
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-900">{row.original.name}</div>
            <div className="mt-1 text-xs text-slate-500">
              {row.original.description || "No description"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "document_type",
        header: "Document Type",
        cell: ({ row }) => <TypeBadge type={row.original.document_type} />,
      },
      {
        accessorKey: "is_active",
        header: "Active",
        cell: ({ row }) => (
          <Badge
            className={`rounded-full border ${
              row.original.is_active
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-zinc-100 text-zinc-700"
            }`}
          >
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorKey: "is_default",
        header: "Default",
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">
            {row.original.is_default ? "Yes" : "No"}
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
              onClick={() => navigate(`/templates/${row.original.id}`)}
            >
              <Eye className="h-4 w-4" />
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
                <DropdownMenuItem onClick={() => navigate(`/templates/${row.original.id}`)}>
                  Open template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/templates/${row.original.id}/edit`)}>
                  Edit template
                </DropdownMenuItem>
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

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm text-sky-700">
            <FileText className="mr-2 h-4 w-4" />
            Templates workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Templates
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            Upload, inspect, and manage document templates for every document type.
          </p>

          {!loading && !error ? (
            <p className="mt-2 text-xs text-slate-500">
              {count} total template{count === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <Button asChild className="rounded-2xl">
            <Link to="/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              New template
            </Link>
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/70">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-slate-900">Template list</CardTitle>
              <CardDescription>
                Search and open saved templates.
              </CardDescription>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search template name, type, or description..."
                className="rounded-2xl border-slate-200 bg-white pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading templates...</div>
          ) : error ? (
            <div className="p-6">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            </div>
          ) : table.getRowModel().rows.length === 0 ? (
            <div className="p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="font-semibold text-slate-900">No templates found</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Try a different search or create a new template.
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