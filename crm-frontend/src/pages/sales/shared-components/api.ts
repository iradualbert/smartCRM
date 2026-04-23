import axios from "axios"

export type EmailSendingConfigOption = {
  id: number
  name: string
  owner_type: "company" | "user"
  from_name: string | null
  from_email: string
  is_default: boolean
  is_active: boolean
  company?: number | null
  user?: number | null
}

export type APIResult = {
    results: EmailSendingConfigOption[]
}

export type SendDocumentEmailPayload = {
  to: string
  cc?: string
  bcc?: string
  subject: string
  body_html: string
  include_attachment: boolean
  sending_config_id?: number | null
}

export async function listEmailSendingConfigs(params?: { company?: number | string }) {
  const response = await axios.get<APIResult>("/email-sending-configs/", {
    params,
  })
  return response.data.results
}

export async function sendDocumentEmail(
  documentType: "quotation" | "invoice" | "proforma" | "receipt" | "delivery_note",
  id: number | string,
  payload: SendDocumentEmailPayload
) {
  const response = await axios.post(`/${documentType}s/${id}/send_email/`, payload)
  return response.data
}

