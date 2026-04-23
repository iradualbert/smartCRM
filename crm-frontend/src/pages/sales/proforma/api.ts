import type { PaginatedResponse } from "@/lib/api"
import axios  from "axios"  

export type Product = {
  id: number
  company: number | null
  name: string
  description: string | null
  sku: string | null
  default_price: string
  created_at: string
  updated_at: string
}

export type Template = {
  id: number
  company: number | null
  name: string
  document_type: "invoice" | "quotation" | "proforma" | "delivery_note" | "receipt"
  is_active: boolean
  is_default: boolean
}

export type Customer = {
  id: number
  company: number | null
  name: string
  email: string | null
  phone_number: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export type Quotation = {
  id: number
  company: number | null
  customer: number
  selected_template: number | null
  document: number | null
  currency: string | null
  pdf_generated_at: string | null
  pdf_needs_regeneration: boolean
  name: string
  description: string | null
  quote_number: string
  status: "draft" | "sent" | "approved" | "rejected" | "expired"
  subtotal: string
  total: string
  created_at: string
  updated_at: string
}

export type ProformaStatus =
  | "draft"
  | "sent"
  | "paid"
  | "cancelled"

export type ProformaLine = {
  id: number
  proforma: number
  product: number | null
  description: string | null
  quantity: string
  unit_price: string
  line_total: string
  created_at: string
  updated_at: string
}

export type Proforma = {
  id: number
  company: number | null
  quotation: number | null
  customer: number | null
  selected_template: number | null
  document: number | null
  currency: string | null
  pdf_generated_at: string | null
  pdf_needs_regeneration: boolean
  proforma_number: string
  status: ProformaStatus
  subtotal: string
  total: string
  created_at: string
  updated_at: string
  lines?: ProformaLine[]
}

export type ProformaPayload = {
  company: number
  quotation?: number | null
  customer?: number | null
  selected_template?: number | null
  currency?: string
  proforma_number: string
  status?: ProformaStatus
}

export type ProformaLinePayload = {
  proforma: number
  product?: number | null
  description?: string
  quantity: string
  unit_price: string
}

export async function listProducts(params?: {
  company?: string | number
  limit?: number
  offset?: number
  search?: string
}) {
  const response = await axios.get<PaginatedResponse<Product>>("/products/", { params })
  return response.data
}

export async function listCustomers(params?: { company?: string | number; limit?: number; offset?: number; search?: string }) {
  const response = await axios.get<PaginatedResponse<Customer>>("/customers/", { params })
  return response.data
}

export async function listQuotations(params?: { company?: string | number; limit?: number; offset?: number; search?: string }) {
  const response = await axios.get<PaginatedResponse<Quotation>>("/quotations/", { params })
  return response.data
}

export async function listProformaTemplates(params?: { company?: string | number }) {
  const response = await axios.get<PaginatedResponse<Template>>("/templates/", { params })
  return {
    ...response.data,
    results: response.data.results.filter(
      (item) => item.document_type === "proforma" && item.is_active
    ),
  }
}

export async function listProformas(params?: { company?: string | number; limit?: number; offset?: number; search?: string; status?: string }) {
  const response = await axios.get<PaginatedResponse<Proforma>>("/proformas/", { params })
  return response.data
}

export async function getProforma(id: number | string) {
  const response = await axios.get<Proforma>(`/proformas/${id}/`)
  return response.data
}

export async function createProforma(payload: ProformaPayload) {
  const response = await axios.post<Proforma>("/proformas/", payload)
  return response.data
}

export async function updateProforma(
  id: number | string,
  payload: Partial<ProformaPayload>
) {
  const response = await axios.patch<Proforma>(`/proformas/${id}/`, payload)
  return response.data
}

export async function deleteProforma(id: number | string) {
  await axios.delete(`/proformas/${id}/`)
}

export async function createProformaLine(payload: ProformaLinePayload) {
  const response = await axios.post<ProformaLine>("/proforma-lines/", payload)
  return response.data
}

export async function updateProformaLine(
  id: number | string,
  payload: Partial<ProformaLinePayload>
) {
  const response = await axios.patch<ProformaLine>(`/proforma-lines/${id}/`, payload)
  return response.data
}

export async function deleteProformaLine(id: number | string) {
  await axios.delete(`/proforma-lines/${id}/`)
}

export async function generateProformaPdf(id: number | string) {
  const response = await axios.post(`/proformas/${id}/generate_pdf/`)
  return response.data
}

export async function regenerateProformaPdf(id: number | string) {
  const response = await axios.post(`/proformas/${id}/regenerate_pdf/`)
  return response.data
}

export function proformaPdfUrl(id: number | string) {
  return `/proformas/${id}/pdf/`
}

export async function createProformaWithLines(input: {
  companyId: number
  proforma: {
    quotation?: number | null
    customer?: number | null
    proforma_number: string
    currency?: string
    selected_template?: number | null
    status?: ProformaStatus
  }
  lines: Array<{
    product?: number | null
    description?: string
    quantity: string
    unit_price: string
  }>
}) {
  const proforma = await createProforma({
    company: input.companyId,
    quotation: input.proforma.quotation ?? null,
    customer: input.proforma.customer ?? null,
    proforma_number: input.proforma.proforma_number.trim(),
    currency: input.proforma.currency || undefined,
    selected_template: input.proforma.selected_template ?? null,
    status: input.proforma.status ?? "draft",
  })

  for (const line of input.lines) {
    await createProformaLine({
      proforma: proforma.id,
      product: line.product ?? null,
      description: line.description?.trim() || "",
      quantity: line.quantity,
      unit_price: line.unit_price,
    })
  }

  return proforma
}

export async function updateProformaWithLines(input: {
  proformaId: number
  proforma: {
    quotation?: number | null
    customer?: number | null
    proforma_number: string
    currency?: string
    selected_template?: number | null
    status?: ProformaStatus
  }
  lines: Array<{
    id?: number
    product?: number | null
    description?: string
    quantity: string
    unit_price: string
  }>
  removedLineIds: number[]
}) {
  await updateProforma(input.proformaId, {
    quotation: input.proforma.quotation ?? null,
    customer: input.proforma.customer ?? null,
    proforma_number: input.proforma.proforma_number.trim(),
    currency: input.proforma.currency || undefined,
    selected_template: input.proforma.selected_template ?? null,
    status: input.proforma.status ?? "draft",
  })

  for (const lineId of input.removedLineIds) {
    await deleteProformaLine(lineId)
  }

  for (const line of input.lines) {
    if (line.id) {
      await updateProformaLine(line.id, {
        product: line.product ?? null,
        description: line.description?.trim() || "",
        quantity: line.quantity,
        unit_price: line.unit_price,
      })
    } else {
      await createProformaLine({
        proforma: input.proformaId,
        product: line.product ?? null,
        description: line.description?.trim() || "",
        quantity: line.quantity,
        unit_price: line.unit_price,
      })
    }
  }

  return getProforma(input.proformaId)
}
