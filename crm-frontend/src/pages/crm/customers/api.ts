import axios from "axios"
import * as z from "zod"

const api = axios

export const customerSchema = z.object({
  company: z.number(),
  name: z.string().min(2).max(255),
  email: z.string().email().optional().or(z.literal("")),
  phone_number: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

export type Customer = {
  id: number
  company: number | null
  name: string
  email: string | null
  phone_number: string | null
  address: string | null
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

function normalizeCustomerPayload(values: CustomerFormValues) {
  return {
    company: values.company,
    name: values.name,
    email: values.email || "",
    phone_number: values.phone_number || "",
    address: values.address || "",
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

export async function listCustomers(params: {
  companyId: number | string
  limit?: number
  offset?: number
  search?: string
}): Promise<PaginatedResponse<Customer>> {
  const response = await api.get("/customers/", {
    params: {
      company: params.companyId,
      limit: params.limit ?? 10,
      offset: params.offset ?? 0,
      search: params.search ?? "",
    },
  })
  return response.data
}

export async function getCustomer(customerId: number | string): Promise<Customer> {
  const response = await api.get(`/customers/${customerId}/`)
  return response.data
}

export async function createCustomer(values: CustomerFormValues): Promise<Customer> {
  try {
    const response = await api.post("/customers/", normalizeCustomerPayload(values))
    return response.data
  } catch (error) {
    normalizeValidationError(error)
  }
}

export async function updateCustomer(
  customerId: number | string,
  values: CustomerFormValues
): Promise<Customer> {
  try {
    const response = await api.put(
      `/customers/${customerId}/`,
      normalizeCustomerPayload(values)
    )
    return response.data
  } catch (error) {
    normalizeValidationError(error)
  }
}

export async function deleteCustomer(customerId: number | string): Promise<void> {
  await api.delete(`/customers/${customerId}/`)
}