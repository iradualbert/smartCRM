import axios from "axios"

const api = axios

export type Id = string

export type BillingPlan = {
  id: Id
  code: "free" | "starter" | "business" | string
  name: string
  price_try: string
  price_usd: string
  billing_interval: "monthly"
  is_active: boolean
  is_default: boolean
  is_public: boolean

  max_organizations: number
  max_users: number
  max_documents_per_month: number | null
  max_emails_per_month: number | null
  max_storage_mb: number | null

  allow_custom_templates: boolean
  allow_pdf_generation: boolean
  allow_email_sending: boolean
  allow_ai_quote_extraction: boolean
  allow_catalog_management: boolean
  allow_branding_removal: boolean
  display_order: number,
  is_contact_only: boolean
}

export type BillingSubscription = {
  id: Id
  company: Id
  company_name: string
  plan: BillingPlan
  status: "pending" | "active" | "cancelled" | "expired" | "past_due" | string
  billing_currency: "TRY" | "USD" | string
  billing_amount: string
  started_at: string
  current_period_start: string
  current_period_end: string
  cancelled_at: string | null
  ended_at: string | null
  auto_renew: boolean
  external_provider: string
  external_subscription_id: string
  external_customer_id: string
  external_checkout_token: string
  created_at: string
  updated_at: string
}

export type BillingUsage = {
  id: Id
  company: Id
  year: number
  month: number
  emails_sent: number
  documents_created: number
  storage_bytes: number
  storage_mb: number
  created_at: string
  updated_at: string
}

export type BillingOverview = {
  company_id: Id
  subscription: BillingSubscription
  usage: BillingUsage
  can_manage_billing: boolean
}

export type CreateCheckoutPayload = {
  company: Id
  plan_code: string
  currency: "TRY" | "USD"
}

export type CreateCheckoutResponse = {
  payment_url: string
  token: string
  subscription_id: Id
}

export async function listPlans(): Promise<BillingPlan[]> {
  const res = await api.get<BillingPlan[]>("/billing/plans/", {
    withCredentials: true,
  })
  return res.data
}

export async function getBillingOverview(company: Id): Promise<BillingOverview> {
  const res = await api.get<BillingOverview>("/billing/overview/", {
    params: { company },
    withCredentials: true,
  })
  return res.data
}

export async function getBillingUsage(company: Id): Promise<BillingUsage> {
  const res = await api.get<BillingUsage>("/billing/usage/", {
    params: { company },
    withCredentials: true,
  })
  return res.data
}

export async function startCheckout(
  payload: CreateCheckoutPayload
): Promise<CreateCheckoutResponse> {
  const res = await api.post<CreateCheckoutResponse>("/billing/checkout/", payload, {
    withCredentials: true,
  })
  return res.data
}