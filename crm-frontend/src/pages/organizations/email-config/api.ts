import axios from "axios"

const api = axios

export type Id = string

export type EmailSendingConfigOwnerType = "company" | "user"
export type EmailSendingConfigSecurityType = "tls" | "ssl" | "none"
export type EmailSendingConfigTestStatus = "success" | "failed" | string | null

export type EmailSendingConfig = {
  id: Id
  company: Id | null
  user: Id | null
  owner_type: EmailSendingConfigOwnerType

  name: string
  from_name: string | null
  from_email: string

  smtp_host: string
  smtp_port: number
  smtp_username: string
  masked_password: string

  security_type: EmailSendingConfigSecurityType
  is_active: boolean
  is_default: boolean

  last_tested_at: string | null
  last_test_status: EmailSendingConfigTestStatus
  last_test_error: string | null

  created_at: string
  updated_at: string
}

export type EmailSendingConfigListResponse =
  | EmailSendingConfig[]
  | {
      results: EmailSendingConfig[]
      count?: number
      next?: string | null
      previous?: string | null
    }

export type EmailSendingConfigCreatePayload = {
  company?: Id | null
  user?: Id | null
  owner_type: EmailSendingConfigOwnerType

  name: string
  from_name?: string
  from_email: string

  smtp_host: string
  smtp_port: number
  smtp_username: string
  smtp_password: string

  security_type: EmailSendingConfigSecurityType
  is_active: boolean
  is_default: boolean
}

export type EmailSendingConfigUpdatePayload = {
  company?: Id | null
  user?: Id | null
  owner_type?: EmailSendingConfigOwnerType

  name?: string
  from_name?: string
  from_email?: string

  smtp_host?: string
  smtp_port?: number
  smtp_username?: string
  smtp_password?: string

  security_type?: EmailSendingConfigSecurityType
  is_active?: boolean
  is_default?: boolean
}

export type ListEmailSendingConfigsParams = {
  company?: Id
  owner_type?: EmailSendingConfigOwnerType
  is_active?: boolean
}

function normalizeListResponse(data: EmailSendingConfigListResponse): EmailSendingConfig[] {
  if (Array.isArray(data)) return data
  return data.results ?? []
}

export async function listEmailSendingConfigs(
  params: ListEmailSendingConfigsParams = {}
): Promise<EmailSendingConfig[]> {
  const res = await api.get<EmailSendingConfigListResponse>("/email-sending-configs/", {
    params,
    withCredentials: true,
  })
  return normalizeListResponse(res.data)
}

export async function getEmailSendingConfig(id: Id): Promise<EmailSendingConfig> {
  const res = await api.get<EmailSendingConfig>(`/email-sending-configs/${id}/`, {
    withCredentials: true,
  })
  return res.data
}

export async function createEmailSendingConfig(
  payload: EmailSendingConfigCreatePayload
): Promise<EmailSendingConfig> {
  const res = await api.post<EmailSendingConfig>("/email-sending-configs/", payload, {
    withCredentials: true,
  })
  return res.data
}

export async function updateEmailSendingConfig(
  id: Id,
  payload: EmailSendingConfigUpdatePayload
): Promise<EmailSendingConfig> {
  const res = await api.patch<EmailSendingConfig>(`/email-sending-configs/${id}/`, payload, {
    withCredentials: true,
  })
  return res.data
}

export async function deleteEmailSendingConfig(id: Id): Promise<void> {
  await api.delete(`/email-sending-configs/${id}/`, {
    withCredentials: true,
  })
}

export async function testEmailSendingConfig(id: Id): Promise<{ detail: string }> {
  const res = await api.post<{ detail: string }>(
    `/email-sending-configs/${id}/test_connection/`,
    {},
    { withCredentials: true }
  )
  return res.data
}