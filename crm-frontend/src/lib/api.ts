import axios from "axios"

export const createEmail = async (data: FormData) => {
    return await axios.post('/mails/', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
}

export const createBulkEmail = async (data: FormData) => {
    return await axios.post('/bulk-mails/', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })
}

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type Template = {
  id: number
  company: number | null
  name: string
  document_type: "invoice" | "quotation" | "proforma" | "delivery_note" | "receipt"
  is_active: boolean
  is_default: boolean
}

export async function listTemplates(documentType?: Template["document_type"]) {
  const response = await axios.get<PaginatedResponse<Template>>("/templates/")
  const results = documentType
    ? response.data.results.filter(
        (item) => item.document_type === documentType && item.is_active
      )
    : response.data.results

  return { ...response.data, results }
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

export async function listProducts(params?: { search?: string }) {
  const response = await axios.get<PaginatedResponse<Product>>("/products/", { params })
  return response.data

}