import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import TemplateUploadCard, { type TemplateFormValues } from "./TemplateUploadCard"
import { createTemplate } from "./api"

export default function CreateTemplatePage() {
  const navigate = useNavigate()

  const [values, setValues] = React.useState<TemplateFormValues>({
    company: 1,
    name: "",
    description: "",
    document_type: "invoice",
    mapping: {},
    supported_currencies: [],
    is_active: true,
    is_default: false,
    file: null,
  })

  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onChange = (patch: Partial<TemplateFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }))
  }

  const handleSave = async () => {
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

      navigate(`/templates/${created.id}`)
    } catch (err) {
      console.error(err)
      setError("Failed to create template.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
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
          onClick={() => navigate("/templates")}
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
            onClick={() => navigate("/templates")}
          >
            Cancel
          </Button>
          <Button
            className="rounded-2xl"
            onClick={handleSave}
            disabled={saving || !values.file || !values.name}
          >
            {saving ? "Creating..." : "Create template"}
          </Button>
        </div>
      </div>
    </div>
  )
}