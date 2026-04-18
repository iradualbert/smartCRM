import { PaginatedResponse } from "@/lib/types"
import axios from "axios"

const api = axios;

export type DocumentEmailStatus = "pending" | "sent" | "failed" | "cancelled"

export type DocumentEmailSourceModel =
  | "quotation"
  | "invoice"
  | "proforma"
  | "receipt"
  | "deliverynote"
  | "delivery_note"
  | string

export type DocumentEmail = {
  id: string
  company: string
  sending_config: string | null
  sending_config_name?: string
  source_model: DocumentEmailSourceModel
  source_identifier: string
  subject: string
  to_emails: string[]
  cc_emails: string[]
  bcc_emails: string[]
  include_attachment: boolean
  attachment_filename: string
  status: DocumentEmailStatus
  queued_at: string
  sent_at: string | null
  failed_at: string | null
  failure_reason: string
  retry_count: number
  sent_by: string | null
  sent_by_name?: string
  created_at: string
  updated_at: string
}

export type ListDocumentEmailsParams = {
  company: string
  limit?: number
  offset?: number
  search?: string
  status?: DocumentEmailStatus | "all"
  source_model?: string | "all"
  recipient?: string
  date_from?: string
  date_to?: string
}

export async function listDocumentEmails(params: ListDocumentEmailsParams) {
  const response = await api.get<PaginatedResponse<DocumentEmail>>("/emails/", {
    params: {
      company: params.company,
      limit: params.limit ?? 10,
      offset: params.offset ?? 0,
      search: params.search ?? "",
      status: params.status && params.status !== "all" ? params.status : undefined,
      source_model:
        params.source_model && params.source_model !== "all"
          ? params.source_model
          : undefined,
      recipient: params.recipient?.trim() || undefined,
      date_from: params.date_from || undefined,
      date_to: params.date_to || undefined,
    },
  })
  return response.data
}

export async function retryDocumentEmail(id: string) {
  const response = await api.post<DocumentEmail>(`/emails/${id}/retry/`)
  return response.data
}