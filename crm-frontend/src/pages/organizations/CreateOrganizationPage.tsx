import { Building2, Sparkles } from "lucide-react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import CompanyForm from "./OrganizationForm"
import { createCompany, type CompanyFormValues } from "./api"
import { getMembershipOrganizations } from "@/redux/actions/userActions"

const CreateCompanyPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (values: CompanyFormValues) => {
    const company = await createCompany(values)
    localStorage.setItem("currentOrganizationId", company.id.toString())
    await (dispatch as any)(getMembershipOrganizations())
    navigate("/dashboard")
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-8">
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          New workspace
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <Building2 className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Create organization
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Set up your workspace identity, currency defaults, and document numbering
              before inviting your team.
            </p>
          </div>
        </div>
      </div>

      <CompanyForm mode="create" onSubmit={handleSubmit} />
    </div>
  )
}

export default CreateCompanyPage