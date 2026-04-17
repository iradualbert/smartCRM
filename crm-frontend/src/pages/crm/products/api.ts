import axios from "axios"
import * as z from "zod"

const api = axios

export const productSchema = z.object({
  company: z.number(),
  name: z.string().min(2).max(255),
  description: z.string().optional().or(z.literal("")),
  sku: z.string().max(100).optional().or(z.literal("")),
  default_price: z.coerce.number().min(0),
})

export type ProductFormValues = z.infer<typeof productSchema>

export type Product = {
  id: number
  company: number | null
  name: string
  description: string | null
  sku: string | null
  default_price: string
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type ApiValidationError = {
  type: "validation"
  errors: Record<string, string[]>
}



export function getCurrentOrganizationId(): number | null {
  const raw = localStorage.getItem("currentOrganizationId")
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function normalizeProductPayload(values: ProductFormValues) {
  return {
    company: values.company,
    name: values.name,
    description: values.description || "",
    sku: values.sku || "",
    default_price: values.default_price,
  }
}

function normalizeValidationError(error: unknown): never {
  if (axios.isAxiosError(error) && error.response?.status === 400) {
    throw {
      type: "validation",
      errors: (error.response.data as Record<string, string[]>) ?? {},
    } satisfies ApiValidationError
  }

  throw error
}

export async function listProducts(params: {
  companyId: number | string
  limit?: number
  offset?: number
  search?: string
}): Promise<PaginatedResponse<Product>> {
  const response = await api.get("/products/", {
    params: {
      company: params.companyId,
      limit: params.limit ?? 10,
      offset: params.offset ?? 0,
      search: params.search ?? "",
    },
  })
  return response.data
}

export async function getProduct(productId: number | string): Promise<Product> {
  const response = await api.get(`/products/${productId}/`)
  return response.data
}

export async function createProduct(values: ProductFormValues): Promise<Product> {
  try {
    const response = await api.post("/products/", normalizeProductPayload(values))
    return response.data
  } catch (error) {
    normalizeValidationError(error)
  }
}

export async function updateProduct(
  productId: number | string,
  values: ProductFormValues
): Promise<Product> {
  try {
    const response = await api.put(
      `/products/${productId}/`,
      normalizeProductPayload(values)
    )
    return response.data
  } catch (error) {
    normalizeValidationError(error)
  }
}

export async function deleteProduct(productId: number | string): Promise<void> {
  await api.delete(`/products/${productId}/`)
}