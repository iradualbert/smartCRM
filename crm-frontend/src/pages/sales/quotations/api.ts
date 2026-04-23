import axios from "axios"
import { EmailComposerSubmitPayload } from "../shared-components/EmailComposer"

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type Customer = {
  id: string
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
  id: string
  company: string | null
  name: string
  document_type: "invoice" | "quotation" | "proforma" | "delivery_note" | "receipt"
  is_active: boolean
  is_default: boolean
}

export type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"

export type QuotationTaxMode = "exclusive" | "inclusive"

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
  id: string
  company: string | null
  customer: string
  selected_template: string | null
  document: string | null
  currency: string | null
  pdf_generated_at: string | null
  pdf_needs_regeneration: boolean
  name: string
  description: string | null
  quote_number: string
  status: QuotationStatus
  subtotal: string
  total: string

  // backend additions expected
  issue_date?: string | null
  valid_until?: string | null
  tax_mode?: QuotationTaxMode
  tax_label?: string | null
  tax_rate?: string | null
  tax_total?: string | null

  created_at: string
  updated_at: string
  lines?: QuotationLine[]
}

export type CustomerPayload = {
  company: string
  name: string
  email?: string
  phone_number?: string
  address?: string
}

export type ProductPayload = {
  company: string
  name: string
  description?: string
  sku?: string
  default_price: string
}

export type QuotationPayload = {
  company: string
  customer: string
  selected_template?: string | null
  currency?: string
  name: string
  description?: string
  quote_number?: string
  status?: QuotationStatus

  // backend additions expected
  issue_date?: string | null
  valid_until?: string | null
  tax_mode?: QuotationTaxMode
  tax_label?: string
  tax_rate?: string
}

export type QuotationLinePayload = {
  quotation: string
  product?: string | null
  description?: string
  quantity: string
  unit_price: string
}

export type ListQuotationParams = {
  company: string
  limit?: number
  offset?: number
  search?: string
  status?: QuotationStatus | "all"
  customer?: string | "all"
}

const api = axios

export async function listCustomers(params?: {
  company?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const response = await api.get<PaginatedResponse<Customer>>("/customers/", {
    params,
  })
  return response.data
}

export async function createCustomer(payload: CustomerPayload) {
  const response = await api.post<Customer>("/customers/", payload)
  return response.data
}

export async function listProducts(params?: {
  company?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const response = await api.get<PaginatedResponse<Product>>("/products/", {
    params,
  })
  return response.data
}

export async function createProduct(payload: ProductPayload) {
  const response = await api.post<Product>("/products/", payload)
  return response.data
}

export async function listQuotationTemplates(params?: { company?: string }) {
  const response = await api.get<PaginatedResponse<Template>>("/templates/", {
    params,
  })
  return {
    ...response.data,
    results: response.data.results.filter(
      (item) => item.document_type === "quotation" && item.is_active
    ),
  }
}

export async function listQuotations(params: ListQuotationParams) {
  const response = await api.get<PaginatedResponse<Quotation>>("/quotations/", {
    params: {
      company: params.company,
      limit: params.limit ?? 10,
      offset: params.offset ?? 0,
      search: params.search ?? "",
      status: params.status && params.status !== "all" ? params.status : undefined,
      customer:
        params.customer && params.customer !== "all" ? params.customer : undefined,
    },
  })
  return response.data
}

export async function getQuotation(id: string, companyId: string) {
  const response = await api.get<Quotation>(`/quotations/${id}/` + `?company=${companyId}`)
  return response.data
}

export async function createQuotation(payload: QuotationPayload) {
  const response = await api.post<Quotation>("/quotations/", payload)
  return response.data
}

export async function updateQuotation(
  id: number | string,
  payload: Partial<QuotationPayload>
) {
  const response = await api.patch<Quotation>(`/quotations/${id}/`, payload)
  return response.data
}

export async function deleteQuotation(id: number | string) {
  await api.delete(`/quotations/${id}/`)
}

export async function createQuotationLine(payload: QuotationLinePayload) {
  const response = await api.post<QuotationLine>("/quotation-lines/", payload)
  return response.data
}

export async function updateQuotationLine(
  id: number | string,
  payload: Partial<QuotationLinePayload>
) {
  const response = await api.patch<QuotationLine>(`/quotation-lines/${id}/`, payload)
  return response.data
}

export async function deleteQuotationLine(id: string) {
  await api.delete(`/quotation-lines/${id}/`)
}

export async function generateQuotationPdf(id: string) {
  const response = await api.post(`/quotations/${id}/generate_pdf/`)
  return response.data
}

export async function regenerateQuotationPdf(id: string) {
  const response = await api.post(`/quotations/${id}/regenerate_pdf/`)
  return response.data
}

export function quotationPdfUrl(id: string) {
  return `/quotations/${id}/pdf/`
}

export async function createProformaFromQuotation(payload: {
  quotation: string
  company: string
  customer: string
  proforma_number: string
  status?: "draft" | "sent" | "paid" | "cancelled"
  currency?: string | null
  selected_template?: string | null
}) {
  const response = await api.post("/proformas/", {
    ...payload,
    status: payload.status ?? "draft",
  })
  return response.data
}

export async function createQuotationWithLines(input: {
  companyId: string
  customerMode: "existing" | "manual"
  existingCustomerId?: string | null
  manualCustomer?: {
    name: string
    email?: string
    phone_number?: string
    address?: string
  }
  quotation: {
    name: string
    description?: string
    quote_number?: string
    currency?: string
    selected_template?: string | null
    status?: QuotationStatus
    issue_date?: string | null
    valid_until?: string | null
    tax_mode?: QuotationTaxMode
    tax_label?: string
    tax_rate?: string
  }
  lines: Array<{
    product?: string | null
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

  const quotationPayload: QuotationPayload = {
    company: input.companyId,
    customer: customerId,
    name: input.quotation.name.trim(),
    description: input.quotation.description?.trim() || "",
    currency: input.quotation.currency || undefined,
    selected_template: input.quotation.selected_template ?? null,
    status: input.quotation.status ?? "draft",
    issue_date: input.quotation.issue_date ?? null,
    valid_until: input.quotation.valid_until ?? null,
    tax_mode: input.quotation.tax_mode ?? "exclusive",
    tax_label: input.quotation.tax_label ?? "VAT",
    tax_rate: input.quotation.tax_rate ?? "0.00",
  }

  const quoteNumber = input.quotation.quote_number?.trim()
  if (quoteNumber) {
    quotationPayload.quote_number = quoteNumber
  }

  const quotation = await createQuotation(quotationPayload)

  for (const line of input.lines) {
    await createQuotationLine({
      quotation: quotation.id,
      product: line.product ?? null,
      description: line.description?.trim() || "",
      quantity: line.quantity,
      unit_price: line.unit_price,
    })
  }

  return getQuotation(quotation.id, input.companyId)
}

export async function updateQuotationWithLines(input: {
  quotationId: string
  companyId: string
  quotation: {
    customer: string
    name: string
    description?: string
    quote_number: string
    currency?: string
    selected_template?: string | null
    status?: QuotationStatus
    issue_date?: string | null
    valid_until?: string | null
    tax_mode?: QuotationTaxMode
    tax_label?: string
    tax_rate?: string
  }
  lines: Array<{
    id?: string
    product?: string | null
    description?: string
    quantity: string
    unit_price: string
  }>
  removedLineIds: string[]
}) {
  await updateQuotation(input.quotationId, {
    customer: input.quotation.customer,
    name: input.quotation.name.trim(),
    description: input.quotation.description?.trim() || "",
    quote_number: input.quotation.quote_number.trim(),
    currency: input.quotation.currency || undefined,
    selected_template: input.quotation.selected_template ?? null,
    status: input.quotation.status ?? "draft",
    issue_date: input.quotation.issue_date ?? null,
    valid_until: input.quotation.valid_until ?? null,
    tax_mode: input.quotation.tax_mode ?? "exclusive",
    tax_label: input.quotation.tax_label ?? "VAT",
    tax_rate: input.quotation.tax_rate ?? "0.00",
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

  return getQuotation(input.quotationId, input.companyId)
}

export async function getQuotationEmailDraft(id: string, companyId: string ) {
  const response = await api.get(`/quotations/${id}/email_draft/` + `?company=${companyId}`)
  return response.data
}

export async function sendQuotationEmail(
  quotationId: string,
  companyId: string,
  payload: EmailComposerSubmitPayload
) {
  const response = await api.post(`/quotations/${quotationId}/send-email/?company=${companyId}`, {
    to: payload.to,
    cc: payload.cc ? payload.cc.split(",").map((v) => v.trim()).filter(Boolean) : [],
    subject: payload.subject,
    body_html: payload.bodyHtml,
    include_attachment: payload.includeAttachment,
    ...(payload.sendingConfigId ? { sending_config_id: payload.sendingConfigId } : {}),
  })

  return response.data
}
