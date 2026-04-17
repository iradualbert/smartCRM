import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import CustomerForm from "./CustomerForm"
import { createCustomer, type CustomerFormValues } from "./api"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: number
  onCreated: () => Promise<void> | void
}

export default function CreateCustomer({
  open,
  onOpenChange,
  companyId,
  onCreated,
}: Props) {
  const initialValues: CustomerFormValues = {
    company: companyId,
    name: "",
    email: "",
    phone_number: "",
    address: "",
  }

  const handleSubmit = async (values: CustomerFormValues) => {
    await createCustomer(values)
    await onCreated()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create customer</DialogTitle>
          <DialogDescription>
            Add a customer for the current organization.
          </DialogDescription>
        </DialogHeader>

        <CustomerForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Create customer" />
      </DialogContent>
    </Dialog>
  )
}