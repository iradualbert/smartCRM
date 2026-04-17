import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { Mail, MapPin, Pencil, Phone, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCustomer, updateCustomer, type Customer, type CustomerFormValues } from "./api"
import CustomerForm from "./CustomerForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CustomerDetailPage() {
  const { id } = useParams()
  const [customer, setCustomer] = React.useState<Customer | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)

  const loadCustomer = React.useCallback(async () => {
    if (!id) return
    const data = await getCustomer(id)
    setCustomer(data)
  }, [id])

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        await loadCustomer()
      } catch (err) {
        console.error(err)
        setError("Failed to load customer.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [loadCustomer])

  if (loading) {
    return <div className="mx-auto max-w-5xl p-6 md:p-8 text-sm text-slate-500">Loading customer...</div>
  }

  if (error || !customer) {
    return <div className="mx-auto max-w-5xl p-6 md:p-8 text-sm text-rose-700">{error || "Customer not found."}</div>
  }

  const initialValues: CustomerFormValues = {
    company: customer.company ?? 0,
    name: customer.name,
    email: customer.email ?? "",
    phone_number: customer.phone_number ?? "",
    address: customer.address ?? "",
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {customer.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Customer profile for quotations, invoices, and ongoing client work.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/customers">Back</Link>
          </Button>
          <Button onClick={() => setEditOpen(true)} className="rounded-2xl">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-900">Contact information</div>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center gap-3 text-slate-700">
              <Mail className="h-4 w-4 text-slate-400" />
              {customer.email || "No email"}
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Phone className="h-4 w-4 text-slate-400" />
              {customer.phone_number || "No phone"}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-900">Address</div>
          <div className="mt-5 flex items-start gap-3 text-sm text-slate-700">
            <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
            <span className="whitespace-pre-wrap">
              {customer.address || "No address added yet."}
            </span>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-3xl bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit customer</DialogTitle>
            <DialogDescription>
              Update customer information for this organization.
            </DialogDescription>
          </DialogHeader>

          <CustomerForm
            initialValues={initialValues}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await updateCustomer(customer.id, values)
              await loadCustomer()
              setEditOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}