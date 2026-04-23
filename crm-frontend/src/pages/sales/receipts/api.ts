import type { PaginatedResponse } from "@/lib/api"
import axios from "axios"

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
  customer_name?: string | null
}

export type ReceiptStatus =
  | "issued"
  | "cancelled"

export type Receipt = {
  id: number
  company: number | null
  invoice: number
  selected_template: number | null
  document: number | null
  currency: string | null
  pdf_generated_at: string | null
  pdf_needs_regeneration: boolean
  receipt_number: string
  amount_paid: string
  status: ReceiptStatus
  created_at: string
  updated_at: string
}

export type ReceiptPayload = {
  company: number
  invoice: number
  selected_template?: number | null
  currency?: string
  receipt_number: string
  amount_paid: string
  status?: ReceiptStatus
}

export async function listInvoices(params?: { company?: string | number; limit?: number; offset?: number; search?: string }) {
  const response = await axios.get<PaginatedResponse<Invoice>>("/invoices/", { params })
  return response.data
}

export async function listReceiptTemplates(params?: { company?: string | number }) {
  const response = await axios.get<PaginatedResponse<Template>>("/templates/", { params })
  return {
    ...response.data,
    results: response.data.results.filter(
      (item) => item.document_type === "receipt" && item.is_active
    ),
  }
}

export async function listReceipts(params?: { company?: string | number; limit?: number; offset?: number; search?: string; status?: string }) {
  const response = await axios.get<PaginatedResponse<Receipt>>("/receipts/", { params })
  return response.data
}

export async function getReceipt(id: number | string) {
  const response = await axios.get<Receipt>(`/receipts/${id}/`)
  return response.data
}

export async function createReceipt(payload: ReceiptPayload) {
  const response = await axios.post<Receipt>("/receipts/", payload)
  return response.data
}

export async function updateReceipt(
  id: number | string,
  payload: Partial<ReceiptPayload>
) {
  const response = await axios.patch<Receipt>(`/receipts/${id}/`, payload)
  return response.data
}

export async function deleteReceipt(id: number | string) {
  await axios.delete(`/receipts/${id}/`)
}

export async function generateReceiptPdf(id: number | string) {
  const response = await axios.post(`/receipts/${id}/generate_pdf/`)
  return response.data
}

export async function regenerateReceiptPdf(id: number | string) {
  const response = await axios.post(`/receipts/${id}/regenerate_pdf/`)
  return response.data
}

export function receiptPdfUrl(id: number | string) {
  return `/receipts/${id}/pdf/`
}
