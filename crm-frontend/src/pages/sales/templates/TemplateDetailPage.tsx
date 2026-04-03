import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, PencilLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import TemplateInspectPanel from "./TemplateInspectPanel"
import TemplateMappingEditor from "./TemplateMappingEditor"
import {
  getTemplate,
  inspectTemplate,
  type Template,
  type TemplateInspectResult,
} from "./api"

export default function TemplateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [template, setTemplate] = React.useState<Template | null>(null)
  const [inspectResult, setInspectResult] = React.useState<TemplateInspectResult | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [isInspecting, setIsInspecting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const run = async () => {
      if (!id) return
      try {
        setLoading(true)
        const data = await getTemplate(id)
        setTemplate(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load template.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [id])

  const handleInspect = async () => {
    if (!id) return
    try {
      setIsInspecting(true)
      const result = await inspectTemplate(id)
      setInspectResult(result)
    } catch (err) {
      console.error(err)
      setError("Failed to inspect template.")
    } finally {
      setIsInspecting(false)
    }
  }

  if (loading || !template) {
    return <div className="mx-auto max-w-7xl p-6 text-sm text-slate-500">Loading template...</div>
  }

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            className="mb-3 rounded-xl px-0 text-slate-500 hover:bg-transparent"
            onClick={() => navigate("/templates")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to templates
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {template.name}
            </h1>

            <Badge className="rounded-full border border-slate-200 bg-slate-50 text-slate-700">
              {template.document_type}
            </Badge>

            <Badge
              className={`rounded-full border ${
                template.is_active
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-zinc-200 bg-zinc-100 text-zinc-700"
              }`}
            >
              {template.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            Review the template configuration and inspect detected placeholders.
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-2xl">
          <Link to={`/templates/${template.id}/edit`}>
            <PencilLine className="mr-2 h-4 w-4" />
            Edit template
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Template summary</CardTitle>
              <CardDescription>Saved metadata and configuration.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <div className="text-slate-500">Name</div>
                <div className="mt-1 font-medium text-slate-900">{template.name}</div>
              </div>

              <div>
                <div className="text-slate-500">Document Type</div>
                <div className="mt-1 font-medium text-slate-900">{template.document_type}</div>
              </div>

              <div>
                <div className="text-slate-500">Default</div>
                <div className="mt-1 font-medium text-slate-900">
                  {template.is_default ? "Yes" : "No"}
                </div>
              </div>

              <div>
                <div className="text-slate-500">Supported Currencies</div>
                <div className="mt-1 font-medium text-slate-900">
                  {template.supported_currencies?.length
                    ? template.supported_currencies.join(", ")
                    : "All supported"}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-slate-500">Description</div>
                <div className="mt-1 font-medium text-slate-900">
                  {template.description || "—"}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-slate-500">File</div>
                <div className="mt-1">
                  {template.file ? (
                    <a
                      href={template.file}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-sky-700 hover:underline"
                    >
                      Open uploaded template
                    </a>
                  ) : (
                    <span className="text-slate-500">No file</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <TemplateInspectPanel
            templateId={template.id}
            inspectResult={inspectResult}
            isInspecting={isInspecting}
            onInspect={handleInspect}
          />
        </div>

        <div className="space-y-6">
          <TemplateMappingEditor
            inspectResult={inspectResult}
            mapping={template.mapping ?? {}}
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  )
}