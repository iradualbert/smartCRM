import axios from "axios"
import { EmailComposerSubmitPayload } from "../shared-components/EmailComposer"

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
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

export type QuotationStatus =
  | "draft"
  | "sent"
  | "approved"
  | "rejected"
  | "expired"

export type QuotationLine = {
  id: number
  quotation: number
  product: number | null
  description: string | null
  quantity: string
  unit_price: string
  line_total: string
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
  status: QuotationStatus
  subtotal: string
  total: string
  created_at: string
  updated_at: string
  lines?: QuotationLine[]
}

export type CustomerPayload = {
  company: number
  name: string
  email?: string
  phone_number?: string
  address?: string
}

export type QuotationPayload = {
  company: number
  customer: number
  selected_template?: number | null
  currency?: string
  name: string
  description?: string
  quote_number: string
  status?: QuotationStatus
}

export type QuotationLinePayload = {
  quotation: number
  product?: number | null
  description?: string
  quantity: string
  unit_price: string
}

export async function listCustomers(params?: { search?: string }) {
  const response = await axios.get<PaginatedResponse<Customer>>("/customers/", {
    params,
  })
  return response.data
}

export async function createCustomer(payload: CustomerPayload) {
  const response = await axios.post<Customer>("/customers/", payload)
  return response.data
}

export async function listProducts(params?: { search?: string }) {
  const response = await axios.get<PaginatedResponse<Product>>("/products/", {
    params,
  })
  return response.data
}

export async function listQuotationTemplates() {
  const response = await axios.get<PaginatedResponse<Template>>("/templates/")
  return {
    ...response.data,
    results: response.data.results.filter(
      (item) => item.document_type === "quotation" && item.is_active
    ),
  }
}

export async function listQuotations(params?: { search?: string }) {
  const response = await axios.get<PaginatedResponse<Quotation>>("/quotations/", {
    params,
  })
  return response.data
}

export async function getQuotation(id: number | string) {
  const response = await axios.get<Quotation>(`/quotations/${id}/`)
  return response.data
}

export async function createQuotation(payload: QuotationPayload) {
  const response = await axios.post<Quotation>("/quotations/", payload)
  return response.data
}

export async function updateQuotation(id: number | string, payload: Partial<QuotationPayload>) {
  const response = await axios.patch<Quotation>(`/quotations/${id}/`, payload)
  return response.data
}

export async function createQuotationLine(payload: QuotationLinePayload) {
  const response = await axios.post<QuotationLine>("/quotation-lines/", payload)
  return response.data
}

export async function updateQuotationLine(
  id: number | string,
  payload: Partial<QuotationLinePayload>
) {
  const response = await axios.patch<QuotationLine>(
    `/quotation-lines/${id}/`,
    payload
  )
  return response.data
}

export async function deleteQuotationLine(id: number | string) {
  await axios.delete(`/quotation-lines/${id}/`)
}

export async function generateQuotationPdf(id: number | string) {
  const response = await axios.post(`/quotations/${id}/generate_pdf/`)
  return response.data
}

export async function regenerateQuotationPdf(id: number | string) {
  const response = await axios.post(`/quotations/${id}/regenerate_pdf/`)
  return response.data
}

export function quotationPdfUrl(id: number | string) {
  return `/quotations/${id}/pdf/`
}

export async function createProformaFromQuotation(payload: {
  quotation: number
  company: number
  customer: number
  proforma_number: string
  status?: "draft" | "sent" | "paid" | "cancelled"
  currency?: string | null
  selected_template?: number | null
}) {
  const response = await axios.post("/proformas/", {
    ...payload,
    status: payload.status ?? "draft",
  })
  return response.data
}

export async function createQuotationWithLines(input: {
  companyId: number
  customerMode: "existing" | "manual"
  existingCustomerId?: number | null
  manualCustomer?: {
    name: string
    email?: string
    phone_number?: string
    address?: string
  }
  quotation: {
    name: string
    description?: string
    quote_number: string
    currency?: string
    selected_template?: number | null
    status?: QuotationStatus
  }
  lines: Array<{
    product?: number | null
    description?: string
    quantity: string
    unit_price: string
  }>
}) {
  let customerId = input.existingCustomerId ?? null

  if (input.customerMode === "manual") {
    if (!input.manualCustomer?.name?.trim()) {
      throw new Error("Manual customer name is required.")
    }

    const customer = await createCustomer({
      company: input.companyId,
      name: input.manualCustomer.name.trim(),
      email: input.manualCustomer.email?.trim() || "",
      phone_number: input.manualCustomer.phone_number?.trim() || "",
      address: input.manualCustomer.address?.trim() || "",
    })

    customerId = customer.id
  }

  if (!customerId) {
    throw new Error("Customer is required.")
  }

  const quotation = await createQuotation({
    company: input.companyId,
    customer: customerId,
    name: input.quotation.name.trim(),
    description: input.quotation.description?.trim() || "",
    quote_number: input.quotation.quote_number.trim(),
    currency: input.quotation.currency || undefined,
    selected_template: input.quotation.selected_template ?? null,
    status: input.quotation.status ?? "draft",
  })

  for (const line of input.lines) {
    await createQuotationLine({
      quotation: quotation.id,
      product: line.product ?? null,
      description: line.description?.trim() || "",
      quantity: line.quantity,
      unit_price: line.unit_price,
    })
  }

  return quotation
}

export async function updateQuotationWithLines(input: {
  quotationId: number
  quotation: {
    name: string
    description?: string
    quote_number: string
    currency?: string
    selected_template?: number | null
    status?: QuotationStatus
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
  await updateQuotation(input.quotationId, {
    name: input.quotation.name.trim(),
    description: input.quotation.description?.trim() || "",
    quote_number: input.quotation.quote_number.trim(),
    currency: input.quotation.currency || undefined,
    selected_template: input.quotation.selected_template ?? null,
    status: input.quotation.status ?? "draft",
  })

  for (const lineId of input.removedLineIds) {
    await deleteQuotationLine(lineId)
  }

  for (const line of input.lines) {
    if (line.id) {
      await updateQuotationLine(line.id, {
        product: line.product ?? null,
        description: line.description?.trim() || "",
        quantity: line.quantity,
        unit_price: line.unit_price,
      })
    } else {
      await createQuotationLine({
        quotation: input.quotationId,
        product: line.product ?? null,
        description: line.description?.trim() || "",
        quantity: line.quantity,
        unit_price: line.unit_price,
      })
    }
  }

  return getQuotation(input.quotationId)
}

export async function getQuotationEmailDraft(id: number | string) {
  const response = await axios.get(`/quotations/${id}/email_draft/`)
  return response.data
}

export async function sendQuotationEmail(
  quotationId: number | string,
  payload: EmailComposerSubmitPayload
) {
  const response = await axios.post(`/quotations/${quotationId}/send-email/`, {
    to: payload.to,
    cc: payload.cc ? payload.cc.split(",").map((v) => v.trim()).filter(Boolean) : [],
    subject: payload.subject,
    body_html: payload.bodyHtml,
    include_attachment: payload.includeAttachment,
    sending_config_id: payload.sendingConfigId,
  })

  return response.data
}