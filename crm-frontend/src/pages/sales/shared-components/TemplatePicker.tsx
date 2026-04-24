import * as React from "react"
import { FilePlus2, FileText } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import SearchSelect from "./SearchSelect"

type TemplateOption = {
  id: number | string
  name: string
  is_default?: boolean
}

type TemplatePickerProps = {
  documentType: "quotation" | "proforma" | "invoice" | "receipt" | "delivery_note"
  value: number | null | undefined
  templates: TemplateOption[]
  onChange: (value: number | null) => void
  defaultLabel: string
}

const DOCUMENT_TYPE_LABELS: Record<TemplatePickerProps["documentType"], string> = {
  quotation: "quotation",
  proforma: "proforma",
  invoice: "invoice",
  receipt: "receipt",
  delivery_note: "delivery note",
}

export default function TemplatePicker({
  documentType,
  value,
  templates,
  onChange,
  defaultLabel,
}: TemplatePickerProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const normalizedValue = value == null ? null : Number(value)
  const selectedTemplate = React.useMemo(
    () => templates.find((template) => Number(template.id) === normalizedValue) ?? null,
    [normalizedValue, templates]
  )

  const filteredTemplates = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return templates
    return templates.filter((template) => template.name.toLowerCase().includes(term))
  }, [search, templates])

  const handleCreateTemplate = () => {
    const params = new URLSearchParams({
      documentType,
      returnTo: `${location.pathname}${location.search}`,
    })
    navigate(`/templates/new?${params.toString()}`)
  }

  return (
    <SearchSelect<TemplateOption>
      valueLabel={selectedTemplate?.name ?? defaultLabel}
      placeholder={defaultLabel}
      searchPlaceholder="Search templates..."
      items={filteredTemplates}
      open={open}
      emptyMessage="No saved templates yet. The default template is ready to use."
      onOpenChange={setOpen}
      onSearch={setSearch}
      onSelect={(template) => onChange(Number(template.id))}
      getKey={(item) => item.id}
      getLabel={(item) => item.name}
      getDescription={(item) => (item.is_default ? "Organization default" : null)}
      renderFooter={
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              className="justify-start rounded-xl"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Use default {DOCUMENT_TYPE_LABELS[documentType]} template
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="justify-start rounded-xl"
              onClick={handleCreateTemplate}
            >
              <FilePlus2 className="mr-2 h-4 w-4" />
              Customize template
            </Button>
          </div>
          <div className="px-1 text-xs text-slate-500">
            Default templates are ready to use.{" "}
            <Link
              to="/guides/how-to-create-and-customize-document-templates"
              className="font-medium text-slate-700 underline underline-offset-4"
            >
              Learn how templates work
            </Link>
          </div>
        </div>
      }
    />
  )
}
