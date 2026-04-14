import axios from "axios"
import * as z from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"

export const companySchema = z
  .object({
    name: z.string().min(2).max(255),
    legal_name: z.string().max(255).optional().or(z.literal("")),
    tax_number: z.string().max(100).optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => {
        if (!value) return true
        const phone = parsePhoneNumberFromString(value)
        return !!phone?.isValid()
      }, "Enter a valid phone number"),
    website: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine(
        (value) => !value || /^https?:\/\//i.test(value),
        "Website must start with http:// or https://"
      )
      .refine((value) => {
        if (!value) return true
        try {
          new URL(value)
          return true
        } catch {
          return false
        }
      }, "Enter a valid website URL"),
    address: z.string().max(2000).optional().or(z.literal("")),
    supported_currencies: z.array(z.string()).min(1),
    default_currency: z.string().min(1),
    invoice_prefix: z.string().min(1).max(20),
    quotation_prefix: z.string().min(1).max(20),
    proforma_prefix: z.string().min(1).max(20),
    receipt_prefix: z.string().min(1).max(20),
    delivery_note_prefix: z.string().min(1).max(20),
    is_active: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (!data.supported_currencies.includes(data.default_currency)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["default_currency"],
        message: "Default currency must be included in supported currencies",
      })
    }
  })

export type CompanyFormValues = z.infer<typeof companySchema>

export type CompanyMembershipRole = "owner" | "admin" | "staff" | "viewer"

export type CompanyMembership = {
  id: number
  company: number
  company_name: string
  user: number
  user_email: string
  user_first_name: string
  user_last_name: string
  display_name: string | null
  job_title: string | null
  department: string | null
  work_email: string | null
  work_phone: string | null
  role: CompanyMembershipRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Company = {
  id: number
  name: string
  legal_name: string | null
  tax_number: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  logo: string | null
  supported_currencies: string[]
  default_currency: string
  invoice_prefix: string
  quotation_prefix: string
  proforma_prefix: string
  receipt_prefix: string
  delivery_note_prefix: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
  currency_symbol?: string
  member_count?: number
  current_membership?: CompanyMembership | null
}

export type AddMemberPayload = {
  email: string
  display_name?: string
  job_title?: string
  department?: string
  work_email?: string
  work_phone?: string
  role?: CompanyMembershipRole
}

export type UpdateMemberPayload = Partial<{
  display_name: string
  job_title: string
  department: string
  work_email: string
  work_phone: string
  role: CompanyMembershipRole
  is_active: boolean
}>

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type ApiValidationError = {
  type: "validation"
  errors: Record<string, string[]>
}

export const api = axios;

function normalizeValidationError(error: unknown): never {
  if (axios.isAxiosError(error) && error.response?.status === 400) {
    throw {
      type: "validation",
      errors: (error.response.data as Record<string, string[]>) ?? {},
    } satisfies ApiValidationError
  }

  throw error
}

export function normalizeCompanyPayload(values: CompanyFormValues) {
  return {
    name: values.name,
    legal_name: values.legal_name || "",
    tax_number: values.tax_number || "",
    email: values.email || "",
    phone: values.phone || "",
    website: values.website || "",
    address: values.address || "",
    supported_currencies: values.supported_currencies,
    default_currency: values.default_currency,
    invoice_prefix: values.invoice_prefix,
    quotation_prefix: values.quotation_prefix,
    proforma_prefix: values.proforma_prefix,
    receipt_prefix: values.receipt_prefix,
    delivery_note_prefix: values.delivery_note_prefix,
    is_active: values.is_active,
  }
}

export async function createCompany(values: CompanyFormValues): Promise<Company> {
  const payload = normalizeCompanyPayload(values)

  try {
    const response = await api.post<Company>("/companies/", payload)
    return response.data
  } catch (error) {
    normalizeValidationError(error)
  }
}

export async function getCompany(companyId: number | string): Promise<Company> {
  const response = await api.get<Company>(`/companies/${companyId}/`)
  return response.data
}

export async function updateCompany(
  companyId: number | string,
  values: CompanyFormValues
): Promise<Company> {
  const payload = normalizeCompanyPayload(values)

  try {
    const response = await api.put<Company>(`/companies/${companyId}/`, payload)
    return response.data
  } catch (error) {
    normalizeValidationError(error)
  }
}

export async function listCompanies(): Promise<PaginatedResponse<Company>> {
  const response = await api.get<PaginatedResponse<Company>>("/companies/")
  return response.data
}

export async function listCompanyMembers(
  companyId: number | string
): Promise<CompanyMembership[]> {
  const response = await api.get<CompanyMembership[]>(`/companies/${companyId}/members/`)
  return response.data
}

export async function addCompanyMember(
  companyId: number | string,
  payload: AddMemberPayload
): Promise<{
  detail: string
  user_created: boolean
  membership_created: boolean
  membership: CompanyMembership
}> {
  const response = await api.post(`/companies/${companyId}/add_user_by_email/`, payload)
  return response.data
}

export async function updateCompanyMember(
  companyId: number | string,
  membershipId: number | string,
  payload: UpdateMemberPayload
): Promise<CompanyMembership> {
  const response = await api.patch(
    `/companies/${companyId}/members/${membershipId}/`,
    payload
  )
  return response.data
}

export async function deactivateCompanyMember(
  companyId: number | string,
  membershipId: number | string
): Promise<{ detail: string }> {
  const response = await api.post(
    `/companies/${companyId}/members/${membershipId}/deactivate/`
  )
  return response.data
}

export async function removeCompanyMember(
  companyId: number | string,
  membershipId: number | string
): Promise<void> {
  await api.delete(`/companies/${companyId}/members/${membershipId}/`)
}