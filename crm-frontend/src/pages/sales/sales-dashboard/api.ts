import axios from "axios"

const api = axios

export type SalesDashboardResponse = {
  company: {
    id: number
    name: string
    currency: string
    currency_symbol: string
  }
  metrics: {
    label: string
    value: string
    hint?: string
  }[]
  status_breakdown: {
    quotations: Record<string, number>
    invoices: Record<string, number>
    proformas: Record<string, number>
    delivery_notes: Record<string, number>
  }
  money: {
    quotation_pipeline_total: string
    invoice_outstanding_total: string
    receipts_collected_this_month: string
  }
  recent_quotations: {
    id: number
    quote_number: string
    name: string
    status: string
    total: string
    created_at: string
  }[]
  attention: {
    type: string
    label: string
  }[]
}

export async function getSalesDashboard(companyId: number | string) {
  const response = await api.get<SalesDashboardResponse>(
    `/companies/${companyId}/sales-dashboard/`
  )
  return response.data
}