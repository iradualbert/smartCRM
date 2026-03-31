import CompanyForm from "./CompanyForm";
import { createCompany, CompanyFormValues } from "./api"

const CreateCompanyPage = () => {
  const handleSubmit = async (values: CompanyFormValues) => {
    await createCompany(values)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Company</h1>

      <CompanyForm mode="create" onSubmit={handleSubmit} />
    </div>
  )
}

export default CreateCompanyPage;