import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import TemplateUploadCard, { type TemplateFormValues } from "./TemplateUploadCard"
import TemplateInspectPanel from "./TemplateInspectPanel"
import TemplateMappingEditor from "./TemplateMappingEditor"
import {
  getTemplate,
  inspectTemplate,
  updateTemplate,
  type Template,
  type TemplateInspectResult,
} from "./api"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

export default function UpdateTemplatePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()

  const [template, setTemplate] = React.useState<Template | null>(null)
  const [values, setValues] = React.useState<TemplateFormValues | null>(null)
  const [inspectResult, setInspectResult] = React.useState<TemplateInspectResult | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [isInspecting, setIsInspecting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!id || !currentOrganizationId) return

    const run = async () => {
      try {
        setLoading(true)
        const data = await getTemplate(id, { company: currentOrganizationId })
        setTemplate(data)
        setValues({
          company: data.company,
          name: data.name,
          description: data.description ?? "",
          document_type: data.document_type,
          mapping: data.mapping ?? {},
          supported_currencies: data.supported_currencies ?? [],
          is_active: data.is_active,
          is_default: data.is_default,
          file: null,
        })
      } catch (err) {
        console.error(err)
        setError("Failed to load template.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [id, currentOrganizationId])

  const onChange = (patch: Partial<TemplateFormValues>) => {
    setValues((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const handleInspect = async () => {
    if (!id || !currentOrganizationId) return
    try {
      setIsInspecting(true)
      const result = await inspectTemplate(id, { company: currentOrganizationId })
      setInspectResult(result)

      setValues((prev) =>
        prev
          ? {
              ...prev,
              mapping: {
                ...result.suggested_mapping,
                ...prev.mapping,
              },
            }
          : prev
      )
    } catch (err) {
      console.error(err)
      setError("Failed to inspect template.")
    } finally {
      setIsInspecting(false)
    }
  }

  const handleSave = async () => {
    if (!id || !values || !currentOrganizationId) return
    try {
      setSaving(true)
      setError(null)

      const updated = await updateTemplate(id, {
        company: values.company,
        name: values.name,
        description: values.description,
        document_type: values.document_type,
        mapping: values.mapping,
        supported_currencies: values.supported_currencies,
        is_active: values.is_active,
        is_default: values.is_default,
        file: values.file,
      }, { company: currentOrganizationId })

      setTemplate(updated)
      setValues((prev) =>
        prev
          ? {
              ...prev,
              file: null,
            }
          : prev
      )
    } catch (err) {
      console.error(err)
      setError("Failed to update template.")
    } finally {
      setSaving(false)
    }
  }

  if (!currentOrganizationId || loading || !values) {
    return <div className="mx-auto max-w-7xl p-6 text-sm text-slate-500">Loading template...</div>
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Update Template
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Edit metadata, inspect placeholders, and adjust field mappings.
          </p>
        </div>

        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={() => navigate(`/templates/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to detail
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6">
          <TemplateUploadCard
            mode="edit"
            values={values}
            onChange={onChange}
            currentFileUrl={template?.file ?? null}
          />
        </div>

        <div className="space-y-6">
          <TemplateInspectPanel
            templateId={template?.id}
            inspectResult={inspectResult}
            isInspecting={isInspecting}
            onInspect={handleInspect}
          />

          <TemplateMappingEditor
            inspectResult={inspectResult}
            mapping={values.mapping}
            onChange={(nextMapping) => onChange({ mapping: nextMapping })}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="outline"
          className="rounded-2xl"
          onClick={() => navigate(`/templates/${id}`)}
        >
          Cancel
        </Button>
        <Button className="rounded-2xl" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save template"}
        </Button>
      </div>
    </div>
  )
}
