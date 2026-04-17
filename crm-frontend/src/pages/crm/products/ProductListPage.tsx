import * as React from "react"
import { Link } from "react-router-dom"
import {
  Box,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
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

import CreateProduct from "./CreateProduct"
import {
  deleteProduct,
  getCurrentOrganizationId,
  listProducts,
  updateProduct,
  type Product,
  type ProductFormValues,
} from "./api"
import ProductForm from "./ProductForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ProductListPage() {
  const companyId = getCurrentOrganizationId()

  const [products, setProducts] = React.useState<Product[]>([])
  const [count, setCount] = React.useState(0)
  const [offset, setOffset] = React.useState(0)
  const [limit] = React.useState(10)
  const [search, setSearch] = React.useState("")
  const [appliedSearch, setAppliedSearch] = React.useState("")

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)

  const loadProducts = React.useCallback(async () => {
    if (!companyId) {
      setError("No current organization selected.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await listProducts({
        companyId,
        limit,
        offset,
        search: appliedSearch,
      })

      setProducts(data.results)
      setCount(data.count)
    } catch (err) {
      console.error(err)
      setError("Failed to load products.")
    } finally {
      setLoading(false)
    }
  }, [companyId, limit, offset, appliedSearch])

  React.useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const page = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(count / limit))

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            Lighter product catalog
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Products & services
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Keep a reusable catalog of services and products for faster quotation building.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)} className="rounded-2xl">
          <Plus className="mr-2 h-4 w-4" />
          New product
        </Button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, SKUs, or descriptions..."
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
            Loading products...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
              <Box className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No products yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Start with your most common services or catalog items so quotations are faster to build.
            </p>
            <div className="mt-5">
              <Button onClick={() => setCreateOpen(true)} className="rounded-2xl">
                Create first product
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
                    <TableHead>SKU</TableHead>
                    <TableHead>Default price</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[72px] pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-slate-50/70">
                      <TableCell className="pl-6 font-medium text-slate-900">
                        <Link to={`/products/${product.id}`} className="hover:underline">
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>{product.sku || "—"}</TableCell>
                      <TableCell>{product.default_price}</TableCell>
                      <TableCell className="max-w-[320px] truncate text-slate-600">
                        {product.description || "—"}
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
                              <Link to={`/products/${product.id}`}>Open</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProduct(product)
                                setEditOpen(true)
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-700"
                              onClick={async () => {
                                await deleteProduct(product.id)
                                await loadProducts()
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
        <CreateProduct
          open={createOpen}
          onOpenChange={setCreateOpen}
          companyId={companyId}
          onCreated={loadProducts}
        />
      ) : null}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-3xl bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
            <DialogDescription>
              Update this catalog item for the current organization.
            </DialogDescription>
          </DialogHeader>

          {selectedProduct ? (
            <ProductForm
              initialValues={{
                company: selectedProduct.company ?? 0,
                name: selectedProduct.name,
                description: selectedProduct.description ?? "",
                sku: selectedProduct.sku ?? "",
                default_price: Number(selectedProduct.default_price),
              }}
              submitLabel="Save changes"
              onSubmit={async (values: ProductFormValues) => {
                await updateProduct(selectedProduct.id, values)
                await loadProducts()
                setEditOpen(false)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}