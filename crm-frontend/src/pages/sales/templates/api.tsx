import axios from "axios"
import type { PaginatedResponse } from "@/lib/api"

export type TemplateDocumentType =
  | "invoice"
  | "quotation"
  | "proforma"
  | "delivery_note"
  | "receipt"

export type Template = {
  id: number
  company: number | null
  name: string
  description: string | null
  file: string | null
  document_type: TemplateDocumentType
  mapping: Record<string, string>
  supported_currencies: string[]
  is_active: boolean
  is_default: boolean
  created_at?: string
  updated_at?: string
}

export type TemplatePayload = {
  company?: number | null
  name: string
  description?: string
  document_type: TemplateDocumentType
  mapping?: Record<string, string>
  supported_currencies?: string[]
  is_active?: boolean
  is_default?: boolean
  file?: File | null
}

export type TemplateInspectResult = {
  document_type: TemplateDocumentType
  document_label: string
  all_placeholders: string[]
  normalized_placeholders: Array<{
    raw: string
    normalized: string
  }>
  suggested_mapping: Record<string, string>
  unmapped_by_default: string[]
  detected_line_placeholders: string[]
}

export async function listTemplates(params?: {
  company?: string | number
  search?: string
  document_type?: TemplateDocumentType
}) {
  const response = await axios.get<PaginatedResponse<Template>>("/templates/", {
    params,
  })
  return response.data
}

export async function getTemplate(
  id: number | string,
  params?: { company?: string | number }
) {
  const response = await axios.get<Template>(`/templates/${id}/`, { params })
  return response.data
}

export async function createTemplate(payload: TemplatePayload) {
  const formData = new FormData()

  if (payload.company !== undefined && payload.company !== null) {
    formData.append("company", String(payload.company))
  }

  formData.append("name", payload.name)
  formData.append("description", payload.description ?? "")
  formData.append("document_type", payload.document_type)
  formData.append("mapping", JSON.stringify(payload.mapping ?? {}))
  formData.append(
    "supported_currencies",
    JSON.stringify(payload.supported_currencies ?? [])
  )
  formData.append("is_active", String(payload.is_active ?? true))
  formData.append("is_default", String(payload.is_default ?? false))

  if (payload.file) {
    formData.append("file", payload.file)
  }

  const response = await axios.post<Template>("/templates/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export async function updateTemplate(
  id: number | string,
  payload: Partial<TemplatePayload>,
  params?: { company?: string | number }
) {
  const formData = new FormData()

  if (payload.company !== undefined && payload.company !== null) {
    formData.append("company", String(payload.company))
  }

  if (payload.name !== undefined) formData.append("name", payload.name)
  if (payload.description !== undefined)
    formData.append("description", payload.description ?? "")
  if (payload.document_type !== undefined)
    formData.append("document_type", payload.document_type)
  if (payload.mapping !== undefined)
    formData.append("mapping", JSON.stringify(payload.mapping))
  if (payload.supported_currencies !== undefined) {
    formData.append(
      "supported_currencies",
      JSON.stringify(payload.supported_currencies)
    )
  }
  if (payload.is_active !== undefined)
    formData.append("is_active", String(payload.is_active))
  if (payload.is_default !== undefined)
    formData.append("is_default", String(payload.is_default))
  if (payload.file) formData.append("file", payload.file)

  const response = await axios.patch<Template>(`/templates/${id}/`, formData, {
    params,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export async function deleteTemplate(
  id: number | string,
  params?: { company?: string | number }
) {
  await axios.delete(`/templates/${id}/`, { params })
}

export async function inspectTemplate(
  id: number | string,
  params?: { company?: string | number }
) {
  const response = await axios.post<TemplateInspectResult>(
    `/templates/${id}/inspect/`,
    {},
    { params }
  )
  return response.data
}
