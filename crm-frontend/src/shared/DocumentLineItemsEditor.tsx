import * as React from "react"
import { Controller, Control, UseFormReturn } from "react-hook-form"
import { Package2, Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import SearchSelect from "@/pages/sales/shared-components/SearchSelect"

export type LineItemFormValue = {
  id?: number
  product?: number | null
  description: string
  quantity: string
  unit_price: string
}

type ProductOption = {
  id: number
  name: string
  description: string | null
  default_price: string
}

type ProductSearchResult = {
  results: ProductOption[]
  next?: string | null
}

type DocumentLineItemsEditorProps<TFormValues extends { lines: LineItemFormValue[] }> = {
  form: UseFormReturn<TFormValues>
  control: Control<TFormValues>
  fields: Array<{ id: string }>
  appendLine: () => void
  removeLine: (index: number) => void
  title?: string
  description?: string
  searchProducts: (params: {
    search: string
    offset: number
    limit: number
  }) => Promise<ProductSearchResult>
}

function money(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00"
}

export default function DocumentLineItemsEditor<
  TFormValues extends { lines: LineItemFormValue[] }
>({
  form,
  control,
  fields,
  appendLine,
  removeLine,
  title = "Line items",
  description,
  searchProducts,
}: DocumentLineItemsEditorProps<TFormValues>) {
  const lines = form.watch("lines" as never)

  const [productOpenIndex, setProductOpenIndex] = React.useState<number | null>(null)
  const [productSearch, setProductSearch] = React.useState<Record<number, string>>({})
  const [productResults, setProductResults] = React.useState<Record<number, ProductOption[]>>({})
  const [productLoading, setProductLoading] = React.useState<Record<number, boolean>>({})
  const [productLoadingMore, setProductLoadingMore] = React.useState<Record<number, boolean>>({})
  const [productHasMore, setProductHasMore] = React.useState<Record<number, boolean>>({})
  const [productOffsets, setProductOffsets] = React.useState<Record<number, number>>({})

  const loadProducts = React.useCallback(
    async (index: number, search: string, offset: number, appendResults: boolean) => {
      if (appendResults) {
        setProductLoadingMore((prev) => ({ ...prev, [index]: true }))
      } else {
        setProductLoading((prev) => ({ ...prev, [index]: true }))
      }

      try {
        const data = await searchProducts({
          search,
          offset,
          limit: 8,
        })

        setProductResults((prev) => ({
          ...prev,
          [index]: appendResults
            ? [
                ...(prev[index] ?? []),
                ...data.results.filter(
                  (item) => !(prev[index] ?? []).some((existing) => existing.id === item.id)
                ),
              ]
            : data.results,
        }))
        setProductOffsets((prev) => ({
          ...prev,
          [index]: offset + data.results.length,
        }))
        setProductHasMore((prev) => ({
          ...prev,
          [index]: Boolean(data.next),
        }))
      } catch (error) {
        console.error(error)
      } finally {
        if (appendResults) {
          setProductLoadingMore((prev) => ({ ...prev, [index]: false }))
        } else {
          setProductLoading((prev) => ({ ...prev, [index]: false }))
        }
      }
    },
    [searchProducts]
  )

  React.useEffect(() => {
    if (productOpenIndex === null) return

    const term = productSearch[productOpenIndex] ?? ""
    const timeout = window.setTimeout(() => {
      void loadProducts(productOpenIndex, term, 0, false)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [loadProducts, productOpenIndex, productSearch])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-slate-700" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </div>
        </div>

        <Button type="button" variant="outline" className="rounded-2xl" onClick={appendLine}>
          <Plus className="mr-2 h-4 w-4" />
          Add line
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((item, index) => {
          const currentLine = lines?.[index] as LineItemFormValue | undefined
          const selectedProductId = currentLine?.product ?? null
          const currentProducts = productResults[index] ?? []
          const selectedProduct =
            currentProducts.find((product) => product.id === selectedProductId) ?? null

          return (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <Badge className="rounded-full border border-slate-200 bg-white text-slate-700">
                  Line {index + 1}
                </Badge>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-rose-600 hover:text-rose-700"
                  onClick={() => removeLine(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-4">
                  <Field>
                    <FieldLabel>Product or service</FieldLabel>
                    <SearchSelect<ProductOption>
                      valueLabel={
                        selectedProduct?.name ??
                        (selectedProductId ? `Selected product #${selectedProductId}` : null)
                      }
                      placeholder="Search product..."
                      searchPlaceholder="Search products..."
                      items={currentProducts}
                      open={productOpenIndex === index}
                      loading={productLoading[index]}
                      loadingMore={productLoadingMore[index]}
                      hasMore={productHasMore[index]}
                      onOpenChange={(open) => setProductOpenIndex(open ? index : null)}
                      onSearch={(term) =>
                        setProductSearch((prev) => ({ ...prev, [index]: term }))
                      }
                      onLoadMore={() =>
                        void loadProducts(
                          index,
                          productSearch[index] ?? "",
                          productOffsets[index] ?? (currentProducts?.length ?? 0),
                          true
                        )
                      }
                      onSelect={(product) => {
                        form.setValue(`lines.${index}.product` as never, product.id as never)
                        form.setValue(
                          `lines.${index}.description` as never,
                          (product.description?.trim() || product.name) as never
                        )
                        form.setValue(
                          `lines.${index}.unit_price` as never,
                          (product.default_price || "0.00") as never
                        )
                        setProductResults((prev) => ({
                          ...prev,
                          [index]: prev[index]?.some((item) => item.id === product.id)
                            ? prev[index]
                            : [product, ...(prev[index] ?? [])],
                        }))
                      }}
                      getKey={(product) => product.id}
                      getLabel={(product) => product.name}
                      getDescription={(product) => product.description}
                    />
                  </Field>
                </div>

                <div className="xl:col-span-4">
                  <Controller
                    name={`lines.${index}.description` as never}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Description</FieldLabel>
                        <Input
                          {...field}
                          className="rounded-2xl"
                          placeholder="Line description"
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                </div>

                <div className="xl:col-span-2">
                  <Controller
                    name={`lines.${index}.quantity` as never}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Quantity</FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          className="rounded-2xl"
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                </div>

                <div className="xl:col-span-2">
                  <Controller
                    name={`lines.${index}.unit_price` as never}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Unit price</FieldLabel>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.01"
                          className="rounded-2xl"
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                </div>
              </div>

              <div className="mt-4 text-right text-sm text-slate-500">
                Line total:{" "}
                <span className="font-medium text-slate-900">
                  {money(
                    Number(currentLine?.quantity || 0) * Number(currentLine?.unit_price || 0)
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
