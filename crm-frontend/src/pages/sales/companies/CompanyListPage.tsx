import * as React from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { listCompanies, type Company } from "./api"

const CompanyListPage = () => {
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [count, setCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await listCompanies()
        setCompanies(data.results)
        setCount(data.count)
      } catch (err) {
        console.error(err)
        setError("Failed to load companies.")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const filteredCompanies = companies.filter((company) => {
    const q = search.trim().toLowerCase()

    if (!q) return true

    return (
      company.name.toLowerCase().includes(q) ||
      company.legal_name?.toLowerCase().includes(q) ||
      company.default_currency?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the organizations using your app.
          </p>
          {!loading && !error ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {count} total compan{count === 1 ? "y" : "ies"}
            </p>
          ) : null}
        </div>

        <Button asChild>
          <Link to="/companies/new">Create Company</Link>
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Loading companies...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold">No companies found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or create a new company.
          </p>

          <div className="mt-4">
            <Button asChild>
              <Link to="/companies/new">Create Company</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Legal Name</th>
                <th className="px-4 py-3 font-medium">Default Currency</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{company.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {company.legal_name || "—"}
                  </td>
                  <td className="px-4 py-3">{company.default_currency}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        company.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {company.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(company.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/companies/${company.id}`}>View</Link>
                    </Button>
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

export default CompanyListPage