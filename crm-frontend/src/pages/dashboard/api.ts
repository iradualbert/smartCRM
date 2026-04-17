import axios from "axios"

const api = axios

export type DashboardMetric = {
  label: string
  value: string
  hint?: string
}

export type DashboardAttentionItem = {
  type: string
  label: string
}

export type DashboardActivityItem = {
  type: string
  label: string
  created_at: string
}

export type DashboardRecentQuotation = {
  id: number
  quote_number: string
  name: string
  status: string
  total: string
  created_at: string
}

export type WorkspaceDashboardResponse = {
  company: {
    id: number
    name: string
    currency: string
    currency_symbol: string
  }
  metrics: DashboardMetric[]
  usage: {
    documents_created: number
    emails_sent: number
    storage_bytes: number
    storage_mb: number
  }
  subscription: {
    plan: string
    status: string
    current_period_end: string | null
    auto_renew: boolean
  }
  attention: DashboardAttentionItem[]
  activity: DashboardActivityItem[]
  recent_quotations: DashboardRecentQuotation[]
}

export async function getWorkspaceDashboard(companyId: number | string) {
  const response = await api.get<WorkspaceDashboardResponse>(
    `/companies/${companyId}/dashboard/`
  )
  return response.data
}