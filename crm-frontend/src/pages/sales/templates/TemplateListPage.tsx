import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useOrganizations } from "@/redux/hooks/useOrganizations"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  downloadDefaultTemplate,
  listTemplates,
  type Template,
  type TemplateDocumentType,
} from "./api"

function TypeBadge({ type }: { type: Template["document_type"] }) {
  return (
    <Badge className="rounded-full border border-slate-200 bg-slate-50 text-slate-700">
      {type}
    </Badge>
  )
}

export default function TemplateListPage() {
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()

  const [templates, setTemplates] = React.useState<Template[]>([])
  const [count, setCount] = React.useState(0)
  const [limit] = React.useState(10)
  const [offset, setOffset] = React.useState(0)

  const [loading, setLoading] = React.useState(true)
  const [downloadingDefault, setDownloadingDefault] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [search, setSearch] = React.useState("")
  const [appliedSearch, setAppliedSearch] = React.useState("")
  const [documentTypeFilter, setDocumentTypeFilter] = React.useState<
    TemplateDocumentType | "all"
  >("all")

  const load = React.useCallback(async () => {
    if (!currentOrganizationId) {
      setTemplates([])
      setCount(0)
      setError("No current organization selected.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await listTemplates({
        company: currentOrganizationId,
        limit,
        offset,
        search: appliedSearch,
        document_type: documentTypeFilter === "all" ? undefined : documentTypeFilter,
      })

      setTemplates(response.results)
      setCount(response.count)
    } catch (err) {
      console.error(err)
      setError("Failed to load templates.")
    } finally {
      setLoading(false)
    }
  }, [appliedSearch, currentOrganizationId, documentTypeFilter, limit, offset])

  React.useEffect(() => {
    load()
  }, [load])

  const page = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(count / limit))

  const handleDownloadDefault = async () => {
    try {
      setDownloadingDefault(true)
      await downloadDefaultTemplate(
        documentTypeFilter === "all" ? "invoice" : documentTypeFilter,
        currentOrganizationId ? { company: currentOrganizationId } : undefined
      )
    } catch (err) {
      console.error(err)
      setError("Failed to download the default template.")
    } finally {
      setDownloadingDefault(false)
    }
  }

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
            Use the system defaults, download them to customize in Word, or manage your organization templates here.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => void handleDownloadDefault()}
            disabled={downloadingDefault}
          >
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            {downloadingDefault ? "Downloading..." : "Download default"}
          </Button>

          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/guides/how-to-create-and-customize-document-templates">
              Template guide
            </Link>
          </Button>

          <Button asChild className="rounded-2xl">
            <Link to="/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              New template
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 grid gap-3 xl:grid-cols-[1.2fr_240px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search template name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-2xl pl-10"
            />
          </div>

          <select
            value={documentTypeFilter}
            onChange={(e) =>
              setDocumentTypeFilter(e.target.value as TemplateDocumentType | "all")
            }
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="all">All document types</option>
            <option value="quotation">quotation</option>
            <option value="proforma">proforma</option>
            <option value="invoice">invoice</option>
            <option value="receipt">receipt</option>
            <option value="delivery_note">delivery_note</option>
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

        {!currentOrganizationId ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Loading organization...
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Loading templates...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {error}
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No templates found</h2>
            <p className="mt-2 text-sm text-slate-600">
              Try changing your filters or create a new template for this organization.
            </p>

            <div className="mt-5">
              <Button asChild className="rounded-2xl">
                <Link to="/templates/new">Create template</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="px-6 py-3 font-medium text-slate-700">Template</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Document Type</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Active</th>
                    <th className="px-4 py-3 font-medium text-slate-700">Default</th>
                    <th className="px-6 py-3 text-right font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr
                      key={template.id}
                      className="border-t border-slate-200 hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          <Link to={`/templates/${template.id}`} className="hover:underline">
                            {template.name}
                          </Link>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {template.description || "No description"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <TypeBadge type={template.document_type} />
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          className={`rounded-full border ${
                            template.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-zinc-200 bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {template.is_default ? "Yes" : "No"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => navigate(`/templates/${template.id}`)}
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

                            <DropdownMenuContent align="end" className="rounded-2xl">
                              <DropdownMenuItem
                                onClick={() => navigate(`/templates/${template.id}`)}
                              >
                                Open template
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/templates/${template.id}/edit`)}
                              >
                                Edit template
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
