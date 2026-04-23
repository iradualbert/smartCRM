import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import TemplateUploadCard, { type TemplateFormValues } from "./TemplateUploadCard"
import { createTemplate, type TemplateDocumentType } from "./api"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

const SUPPORTED_DOCUMENT_TYPES = new Set<TemplateDocumentType>([
  "invoice",
  "quotation",
  "proforma",
  "delivery_note",
  "receipt",
])

export default function CreateTemplatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentOrganizationId } = useOrganizations()
  const companyId = currentOrganizationId ? Number(currentOrganizationId) : null
  const requestedDocumentType = searchParams.get("documentType")
  const returnTo = searchParams.get("returnTo")
  const initialDocumentType: TemplateDocumentType =
    requestedDocumentType && SUPPORTED_DOCUMENT_TYPES.has(requestedDocumentType as TemplateDocumentType)
      ? (requestedDocumentType as TemplateDocumentType)
      : "invoice"

  const [values, setValues] = React.useState<TemplateFormValues>({
    company: companyId,
    name: "",
    description: "",
    document_type: initialDocumentType,
    mapping: {},
    supported_currencies: [],
    is_active: true,
    is_default: false,
    file: null,
  })

  React.useEffect(() => {
    setValues((prev) => ({
      ...prev,
      company: companyId,
      document_type:
        requestedDocumentType && SUPPORTED_DOCUMENT_TYPES.has(requestedDocumentType as TemplateDocumentType)
          ? (requestedDocumentType as TemplateDocumentType)
          : prev.document_type,
    }))
  }, [companyId, requestedDocumentType])

  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onChange = (patch: Partial<TemplateFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }))
  }

  const handleSave = async () => {
    if (!values.company) {
      setError("No current organization selected.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const created = await createTemplate({
        company: values.company,
        name: values.name,
        description: values.description,
        document_type: values.document_type,
        mapping: values.mapping,
        supported_currencies: values.supported_currencies,
        is_active: values.is_active,
        is_default: values.is_default,
        file: values.file,
      })

      navigate(returnTo || `/templates/${created.id}`)
    } catch (err) {
      console.error(err)
      setError("Failed to create template.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      {!currentOrganizationId ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Loading organization...
        </div>
      ) : null}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Create Template
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Upload a new document template and configure it for inspection.
          </p>
        </div>

        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={() => navigate(returnTo || "/templates")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to templates
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-6">
        <TemplateUploadCard mode="create" values={values} onChange={onChange} />

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => navigate(returnTo || "/templates")}
          >
            Cancel
          </Button>
          <Button
            className="rounded-2xl"
            onClick={handleSave}
            disabled={saving || !values.file || !values.name || !values.company}
          >
            {saving ? "Creating..." : "Create template"}
          </Button>
        </div>
      </div>
    </div>
  )
}
