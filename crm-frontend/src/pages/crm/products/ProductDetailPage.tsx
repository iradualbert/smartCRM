import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { Box, Pencil, ReceiptIcon as ReceiptText, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getProduct, updateProduct, type Product, type ProductFormValues } from "./api"
import ProductForm from "./ProductForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = React.useState<Product | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)

  const loadProduct = React.useCallback(async () => {
    if (!id) return
    const data = await getProduct(id)
    setProduct(data)
  }, [id])

  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        await loadProduct()
      } catch (err) {
        console.error(err)
        setError("Failed to load product.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [loadProduct])

  if (loading) {
    return <div className="mx-auto max-w-5xl p-6 md:p-8 text-sm text-slate-500">Loading product...</div>
  }

  if (error || !product) {
    return <div className="mx-auto max-w-5xl p-6 md:p-8 text-sm text-rose-700">{error || "Product not found."}</div>
  }

  const initialValues: ProductFormValues = {
    company: product.company ?? 0,
    name: product.name,
    description: product.description ?? "",
    sku: product.sku ?? "",
    default_price: Number(product.default_price),
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Box className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Reusable pricing and service definition for this workspace.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/products">Back</Link>
          </Button>
          <Button onClick={() => setEditOpen(true)} className="rounded-2xl">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <Tag className="h-4 w-4 text-slate-500" />
            Product information
          </div>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-900">{product.name}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">SKU</span>
              <span className="font-medium text-slate-900">{product.sku || "—"}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Default price</span>
              <span className="font-medium text-slate-900">{product.default_price}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <ReceiptText className="h-4 w-4 text-slate-500" />
            Description
          </div>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {product.description || "No description added yet."}
          </p>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-3xl bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
            <DialogDescription>
              Update product details for this organization.
            </DialogDescription>
          </DialogHeader>

          <ProductForm
            initialValues={initialValues}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await updateProduct(product.id, values)
              await loadProduct()
              setEditOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}