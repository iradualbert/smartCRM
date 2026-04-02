import { Controller, Control, UseFormReturn } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

type DocumentLineItemsEditorProps<TFormValues extends { lines: LineItemFormValue[] }> = {
  form: UseFormReturn<TFormValues>
  control: Control<TFormValues>
  fields: Array<{ id: string }>
  products: ProductOption[]
  loadingOptions?: boolean
  appendLine: () => void
  removeLine: (index: number) => void
  title?: string
  description?: string
}

export default function DocumentLineItemsEditor<
  TFormValues extends { lines: LineItemFormValue[] }
>({
  form,
  control,
  fields,
  products,
  loadingOptions,
  appendLine,
  removeLine,
  title = "Line items",
  description = "Choose products or enter custom lines manually.",
}: DocumentLineItemsEditorProps<TFormValues>) {
  const lines = form.watch("lines" as never)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>

        <Button type="button" variant="outline" className="rounded-xl" onClick={appendLine}>
          <Plus className="mr-2 h-4 w-4" />
          Add line
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Unit Price</th>
              <th className="px-4 py-3 font-medium">Line Total</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody> 
            {fields.map((item, index) => {
              const line = lines?.[index] as LineItemFormValue | undefined
              const quantity = Number(line?.quantity || 0)
              const unitPrice = Number(line?.unit_price || 0)
              const lineTotal = quantity * unitPrice

              return (
                <tr key={item.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 text-slate-500">{index + 1}</td>

                  <td className="min-w-[180px] px-4 py-3">
                    <Controller
                      name={`lines.${index}.product` as never}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const productId = e.target.value ? Number(e.target.value) : null
                            field.onChange(productId)

                            const selected = products.find((p) => p.id === productId)
                            if (selected) {
                              form.setValue(
                                `lines.${index}.description` as never,
                                (selected.description?.trim() || selected.name) as never
                              )
                              form.setValue(
                                `lines.${index}.unit_price` as never,
                                (selected.default_price || "0.00") as never
                              )
                            }
                          }}
                          disabled={loadingOptions}
                        >
                          <option value="">Manual</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </td>

                  <td className="min-w-[280px] px-4 py-3">
                    <Controller
                      name={`lines.${index}.description` as never}
                      control={control}
                      render={({ field, fieldState }) => (
                        <div>
                          <Input {...field} placeholder="Line description" className="rounded-xl" />
                          {fieldState.invalid ? (
                            <p className="mt-1 text-xs text-rose-600">
                              {fieldState.error?.message}
                            </p>
                          ) : null}
                        </div>
                      )}
                    />
                  </td>

                  <td className="w-[120px] px-4 py-3">
                    <Controller
                      name={`lines.${index}.quantity` as never}
                      control={control}
                      render={({ field, fieldState }) => (
                        <div>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            className="rounded-xl text-right"
                          />
                          {fieldState.invalid ? (
                            <p className="mt-1 text-xs text-rose-600">
                              {fieldState.error?.message}
                            </p>
                          ) : null}
                        </div>
                      )}
                    />
                  </td>

                  <td className="w-[140px] px-4 py-3">
                    <Controller
                      name={`lines.${index}.unit_price` as never}
                      control={control}
                      render={({ field, fieldState }) => (
                        <div>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            className="rounded-xl text-right"
                          />
                          {fieldState.invalid ? (
                            <p className="mt-1 text-xs text-rose-600">
                              {fieldState.error?.message}
                            </p>
                          ) : null}
                        </div>
                      )}
                    />
                  </td>

                  <td className="w-[140px] px-4 py-3">
                    <div className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right font-medium text-slate-900">
                      {lineTotal.toFixed(2)}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => removeLine(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}