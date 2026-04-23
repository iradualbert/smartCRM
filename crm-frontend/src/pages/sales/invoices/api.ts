import axios from "axios"
import type { PaginatedResponse } from "@lib/api"


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

export type ProformaStatus =
  | "draft"
  | "sent"
  | "paid"
  | "cancelled"

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"

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
  customer_name?: string | null
}

export type InvoiceLine = {
  id: number
  invoice: number
  product: number | null
  description: string | null
  quantity: string
  unit_price: string
  line_total: string
  created_at: string
  updated_at: string
}

export type Invoice = {
  id: number
  company: number | null
  proforma: number
  selected_template: number | null
  document: number | null
  currency: string | null
  pdf_generated_at: string | null
  pdf_needs_regeneration: boolean
  invoice_number: string
  status: InvoiceStatus
  subtotal: string
  total: string
  created_at: string
  updated_at: string
  lines?: InvoiceLine[]
  customer_name?: string | null
}

export type InvoicePayload = {
  company: number
  proforma: number
  selected_template?: number | null
  currency?: string
  invoice_number: string
  status?: InvoiceStatus
}

export type InvoiceLinePayload = {
  invoice: number
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
  const response = await axios.get<PaginatedResponse<Product>>("/products/", {
    params,
  })
  return response.data
}

export async function listInvoiceTemplates(params?: { company?: string | number }) {
  const response = await axios.get<PaginatedResponse<Template>>("/templates/", {
    params,
  })
  return {
    ...response.data,
    results: response.data.results.filter(
      (item) => item.document_type === "invoice" && item.is_active
    ),
  }
}

export async function listProformas(params?: { company?: string | number; limit?: number; offset?: number; search?: string; status?: string }) {
  const response = await axios.get<PaginatedResponse<Proforma>>("/proformas/", {
    params,
  })
  return response.data
}

export async function getProforma(id: number | string) {
  const response = await axios.get<Proforma>(`/proformas/${id}/`)
  return response.data
}

export async function listInvoices(params?: { company?: string | number; limit?: number; offset?: number; search?: string; status?: string }) {
  const response = await axios.get<PaginatedResponse<Invoice>>("/invoices/", {
    params,
  })
  return response.data
}

export async function getInvoice(id: number | string) {
  const response = await axios.get<Invoice>(`/invoices/${id}/`)
  return response.data
}

export async function createInvoice(payload: InvoicePayload) {
  const response = await axios.post<Invoice>("/invoices/", payload)
  return response.data
}

export async function updateInvoice(
  id: number | string,
  payload: Partial<InvoicePayload>
) {
  const response = await axios.patch<Invoice>(`/invoices/${id}/`, payload)
  return response.data
}

export async function deleteInvoice(id: number | string) {
  await axios.delete(`/invoices/${id}/`)
}

export async function createInvoiceLine(payload: InvoiceLinePayload) {
  const response = await axios.post<InvoiceLine>("/invoice-lines/", payload)
  return response.data
}

export async function updateInvoiceLine(
  id: number | string,
  payload: Partial<InvoiceLinePayload>
) {
  const response = await axios.patch<InvoiceLine>(
    `/invoice-lines/${id}/`,
    payload
  )
  return response.data
}

export async function deleteInvoiceLine(id: number | string) {
  await axios.delete(`/invoice-lines/${id}/`)
}

export async function generateInvoicePdf(id: number | string) {
  const response = await axios.post(`/invoices/${id}/generate_pdf/`)
  return response.data
}

export async function regenerateInvoicePdf(id: number | string) {
  const response = await axios.post(`/invoices/${id}/regenerate_pdf/`)
  return response.data
}

export function invoicePdfUrl(id: number | string) {
  return `/invoices/${id}/pdf/`
}

export async function createInvoiceWithLines(input: {
  companyId: number
  invoice: {
    proforma: number
    invoice_number: string
    currency?: string
    selected_template?: number | null
    status?: InvoiceStatus
  }
  lines: Array<{
    product?: number | null
    description?: string
    quantity: string
    unit_price: string
  }>
}) {
  const invoice = await createInvoice({
    company: input.companyId,
    proforma: input.invoice.proforma,
    invoice_number: input.invoice.invoice_number.trim(),
    currency: input.invoice.currency || undefined,
    selected_template: input.invoice.selected_template ?? null,
    status: input.invoice.status ?? "draft",
  })

  for (const line of input.lines) {
    await createInvoiceLine({
      invoice: invoice.id,
      product: line.product ?? null,
      description: line.description?.trim() || "",
      quantity: line.quantity,
      unit_price: line.unit_price,
    })
  }

  return invoice
}

export async function updateInvoiceWithLines(input: {
  invoiceId: number
  invoice: {
    proforma: number
    invoice_number: string
    currency?: string
    selected_template?: number | null
    status?: InvoiceStatus
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
  await updateInvoice(input.invoiceId, {
    proforma: input.invoice.proforma,
    invoice_number: input.invoice.invoice_number.trim(),
    currency: input.invoice.currency || undefined,
    selected_template: input.invoice.selected_template ?? null,
    status: input.invoice.status ?? "draft",
  })

  for (const lineId of input.removedLineIds) {
    await deleteInvoiceLine(lineId)
  }

  for (const line of input.lines) {
    if (line.id) {
      await updateInvoiceLine(line.id, {
        product: line.product ?? null,
        description: line.description?.trim() || "",
        quantity: line.quantity,
        unit_price: line.unit_price,
      })
    } else {
      await createInvoiceLine({
        invoice: input.invoiceId,
        product: line.product ?? null,
        description: line.description?.trim() || "",
        quantity: line.quantity,
        unit_price: line.unit_price,
      })
    }
  }

  return getInvoice(input.invoiceId)
}
