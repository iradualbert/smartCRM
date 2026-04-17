import * as React from "react"
import { Link } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import CreateCustomer from "./CreateCustomer"
import {
  deleteCustomer,
  getCurrentOrganizationId,
  listCustomers,
  updateCustomer,
  type Customer,
  type CustomerFormValues,
} from "./api"
import CustomerForm from "./CustomerForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CustomerListPage() {
  const companyId = getCurrentOrganizationId()

  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [count, setCount] = React.useState(0)
  const [offset, setOffset] = React.useState(0)
  const [limit] = React.useState(10)
  const [search, setSearch] = React.useState("")
  const [appliedSearch, setAppliedSearch] = React.useState("")

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)

  const loadCustomers = React.useCallback(async () => {
    if (!companyId) {
      setError("No current organization selected.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await listCustomers({
        companyId,
        limit,
        offset,
        search: appliedSearch,
      })

      setCustomers(data.results)
      setCount(data.count)
    } catch (err) {
      console.error(err)
      setError("Failed to load customers.")
    } finally {
      setLoading(false)
    }
  }, [companyId, limit, offset, appliedSearch])

  React.useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const page = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(count / limit))

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            Calm customer workspace
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Customers
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Keep customer records clear, lightweight, and ready for quotations and invoices.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)} className="rounded-2xl">
          <Plus className="mr-2 h-4 w-4" />
          New customer
        </Button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers by name, email, or phone..."
              className="rounded-2xl pl-10"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => {
                setOffset(0)
                setAppliedSearch(search.trim())
              }}
            >
              Search
            </Button>
            <Badge className="rounded-full border border-slate-200 bg-slate-100 text-slate-700">
              {count} total
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Loading customers...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {error}
          </div>
        ) : customers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
              <UserRound className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No customers yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Add your first customer so quoting and billing stay fast and consistent.
            </p>
            <div className="mt-5">
              <Button onClick={() => setCreateOpen(true)} className="rounded-2xl">
                Create first customer
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="w-[72px] pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-slate-50/70">
                      <TableCell className="pl-6 font-medium text-slate-900">
                        <Link to={`/customers/${customer.id}`} className="hover:underline">
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {customer.email ? (
                          <div className="flex items-center gap-2 text-slate-700">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {customer.email}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.phone_number ? (
                          <div className="flex items-center gap-2 text-slate-700">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {customer.phone_number}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate text-slate-600">
                        {customer.address || "—"}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl">
                            <DropdownMenuItem asChild>
                              <Link to={`/customers/${customer.id}`}>Open</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCustomer(customer)
                                setEditOpen(true)
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-700"
                              onClick={async () => {
                                await deleteCustomer(customer.id)
                                await loadCustomers()
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

      {companyId ? (
        <CreateCustomer
          open={createOpen}
          onOpenChange={setCreateOpen}
          companyId={companyId}
          onCreated={loadCustomers}
        />
      ) : null}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-3xl bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit customer</DialogTitle>
            <DialogDescription>
              Update customer information for the current organization.
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer ? (
            <CustomerForm
              initialValues={{
                company: selectedCustomer.company ?? 0,
                name: selectedCustomer.name,
                email: selectedCustomer.email ?? "",
                phone_number: selectedCustomer.phone_number ?? "",
                address: selectedCustomer.address ?? "",
              }}
              submitLabel="Save changes"
              onSubmit={async (values: CustomerFormValues) => {
                await updateCustomer(selectedCustomer.id, values)
                await loadCustomers()
                setEditOpen(false)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}