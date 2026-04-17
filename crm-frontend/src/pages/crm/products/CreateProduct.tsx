import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ProductForm from "./ProductForm"
import { createProduct, type ProductFormValues } from "./api"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: number
  onCreated: () => Promise<void> | void
}

export default function CreateProduct({
  open,
  onOpenChange,
  companyId,
  onCreated,
}: Props) {
  const initialValues: ProductFormValues = {
    company: companyId,
    name: "",
    description: "",
    sku: "",
    default_price: 0,
  }

  const handleSubmit = async (values: ProductFormValues) => {
    await createProduct(values)
    await onCreated()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create product</DialogTitle>
          <DialogDescription>
            Add a reusable product or service for this organization.
          </DialogDescription>
        </DialogHeader>

        <ProductForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Create product" />
      </DialogContent>
    </Dialog>
  )
}