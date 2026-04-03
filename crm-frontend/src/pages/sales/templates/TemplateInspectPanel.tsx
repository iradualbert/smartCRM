import { ScanSearch, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TemplateInspectResult } from "./api"

type TemplateInspectPanelProps = {
  templateId?: number
  inspectResult?: TemplateInspectResult | null
  isInspecting: boolean
  onInspect: () => void
}

export default function TemplateInspectPanel({
  templateId,
  inspectResult,
  isInspecting,
  onInspect,
}: TemplateInspectPanelProps) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-slate-50/70">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Inspect template</CardTitle>
            <CardDescription>
              Detect placeholders and generate suggested field mappings.
            </CardDescription>
          </div>

          <Button
            type="button"
            className="rounded-2xl"
            onClick={onInspect}
            disabled={!templateId || isInspecting}
          >
            <ScanSearch className="mr-2 h-4 w-4" />
            {isInspecting ? "Inspecting..." : "Inspect template"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {!inspectResult ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Save the template first, then inspect it to discover placeholders.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <Badge className="rounded-full border border-slate-200 bg-white text-slate-700">
                {inspectResult.document_label}
              </Badge>
              <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                {inspectResult.all_placeholders.length} placeholders
              </Badge>
              <Badge className="rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                {inspectResult.unmapped_by_default.length} unmapped
              </Badge>
              <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                {inspectResult.detected_line_placeholders.length} line placeholders
              </Badge>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                <Sparkles className="h-4 w-4 text-sky-600" />
                Suggested mapping available
              </div>
              <p className="text-sm text-slate-600">
                Use the mapping editor to accept or adjust the suggested field paths.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}