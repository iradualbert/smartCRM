import axios from "axios"
import type { PaginatedResponse } from "@/lib/api"


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
  status: "draft" | "sent" | "partially_paid" | "paid" | "overdue" | "cancelled"
  subtotal: string
  total: string
  created_at: string
  updated_at: string
}

export type DeliveryNoteStatus =
  | "draft"
  | "dispatched"
  | "delivered"
  | "cancelled"

export type DeliveryNoteLine = {
  id: number
  delivery_note: number
  product: number | null
  description: string | null
  quantity: string
  unit_price: string
  line_total: string
  created_at: string
  updated_at: string
}

export type DeliveryNote = {
  id: number
  company: number | null
  invoice: number
  selected_template: number | null
  document: number | null
  currency: string | null
  pdf_generated_at: string | null
  pdf_needs_regeneration: boolean
  delivery_note_number: string
  delivery_date: string
  status: DeliveryNoteStatus
  created_at: string
  updated_at: string
  lines?: DeliveryNoteLine[]
}

export type DeliveryNotePayload = {
  company: number
  invoice: number
  selected_template?: number | null
  currency?: string
  delivery_note_number: string
  delivery_date: string
  status?: DeliveryNoteStatus
}

export type DeliveryNoteLinePayload = {
  delivery_note: number
  product?: number | null   
  description?: string
  quantity: string
  unit_price: string
}

export async function listProducts(params?: { search?: string }) {
  const response = await axios.get<PaginatedResponse<Product>>("/products/", { params })
  return response.data
}

export async function listInvoices(params?: { company?: string | number; limit?: number; offset?: number; search?: string }) {
  const response = await axios.get<PaginatedResponse<Invoice>>("/invoices/", { params })
  return response.data
}

export async function listDeliveryNoteTemplates() {
  const response = await axios.get<PaginatedResponse<Template>>("/templates/")
  return {
    ...response.data,
    results: response.data.results.filter(
      (item: { document_type: string; is_active: any }) => item.document_type === "delivery_note" && item.is_active
    ),
  }
}

export async function listDeliveryNotes(params?: { company?: string | number; limit?: number; offset?: number; search?: string; status?: string }) {
  const response = await axios.get<PaginatedResponse<DeliveryNote>>("/delivery-notes/", {
    params,
  })
  return response.data
}

export async function getDeliveryNote(id: number | string) {
  const response = await axios.get<DeliveryNote>(`/delivery-notes/${id}/`)
  return response.data
}

export async function createDeliveryNote(payload: DeliveryNotePayload) {
  const response = await axios.post<DeliveryNote>("/delivery-notes/", payload)
  return response.data
}

export async function updateDeliveryNote(
  id: number | string,
  payload: Partial<DeliveryNotePayload>
) {
  const response = await axios.patch<DeliveryNote>(`/delivery-notes/${id}/`, payload)
  return response.data
}

export async function deleteDeliveryNote(id: number | string) {
  await axios.delete(`/delivery-notes/${id}/`)
}

export async function createDeliveryNoteLine(payload: DeliveryNoteLinePayload) {
  const response = await axios.post<DeliveryNoteLine>("/delivery-note-lines/", payload)
  return response.data
}

export async function updateDeliveryNoteLine(
  id: number | string,
  payload: Partial<DeliveryNoteLinePayload>
) {
  const response = await axios.patch<DeliveryNoteLine>(
    `/delivery-note-lines/${id}/`,
    payload
  )
  return response.data
}

export async function deleteDeliveryNoteLine(id: number | string) {
  await axios.delete(`/delivery-note-lines/${id}/`)
}

export async function generateDeliveryNotePdf(id: number | string) {
  const response = await axios.post(`/delivery-notes/${id}/generate_pdf/`)
  return response.data
}

export async function regenerateDeliveryNotePdf(id: number | string) {
  const response = await axios.post(`/delivery-notes/${id}/regenerate_pdf/`)
  return response.data
}

export function deliveryNotePdfUrl(id: number | string) {
  return `/delivery-notes/${id}/pdf/`
}

export async function createDeliveryNoteWithLines(input: {
  companyId: number
  deliveryNote: {
    invoice: number
    delivery_note_number: string
    delivery_date: string
    currency?: string
    selected_template?: number | null
    status?: DeliveryNoteStatus
  }
  lines: Array<{
    product?: number | null
    description?: string
    quantity: string
    unit_price: string
  }>
}) {
  const deliveryNote = await createDeliveryNote({
    company: input.companyId,
    invoice: input.deliveryNote.invoice,
    delivery_note_number: input.deliveryNote.delivery_note_number.trim(),
    delivery_date: input.deliveryNote.delivery_date,
    currency: input.deliveryNote.currency || undefined,
    selected_template: input.deliveryNote.selected_template ?? null,
    status: input.deliveryNote.status ?? "draft",
  })

  for (const line of input.lines) {
    await createDeliveryNoteLine({
      delivery_note: deliveryNote.id,
      product: line.product ?? null,
      description: line.description?.trim() || "",
      quantity: line.quantity,
      unit_price: line.unit_price,
    })
  }

  return deliveryNote
}

export async function updateDeliveryNoteWithLines(input: {
  deliveryNoteId: number
  deliveryNote: {
    invoice: number
    delivery_note_number: string
    delivery_date: string
    currency?: string
    selected_template?: number | null
    status?: DeliveryNoteStatus
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
  await updateDeliveryNote(input.deliveryNoteId, {
    invoice: input.deliveryNote.invoice,
    delivery_note_number: input.deliveryNote.delivery_note_number.trim(),
    delivery_date: input.deliveryNote.delivery_date,
    currency: input.deliveryNote.currency || undefined,
    selected_template: input.deliveryNote.selected_template ?? null,
    status: input.deliveryNote.status ?? "draft",
  })

  for (const lineId of input.removedLineIds) {
    await deleteDeliveryNoteLine(lineId)
  }

  for (const line of input.lines) {
    if (line.id) {
      await updateDeliveryNoteLine(line.id, {
        product: line.product ?? null,
        description: line.description?.trim() || "",
        quantity: line.quantity,
        unit_price: line.unit_price,
      })
    } else {
      await createDeliveryNoteLine({
        delivery_note: input.deliveryNoteId,
        product: line.product ?? null,
        description: line.description?.trim() || "",
        quantity: line.quantity,
        unit_price: line.unit_price,
      })
    }
  }

  return getDeliveryNote(input.deliveryNoteId)
}