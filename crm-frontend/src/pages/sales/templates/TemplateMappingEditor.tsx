
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TemplateInspectResult } from "./api"

type TemplateMappingEditorProps = {
  inspectResult?: TemplateInspectResult | null
  mapping: Record<string, string>
  onChange: (mapping: Record<string, string>) => void
}

const KNOWN_TARGETS = [
  "document.number",
  "document.date",
  "document.due_date",
  "document.valid_until",
  "document.delivery_date",
  "document.currency",
  "company.name",
  "company.address",
  "company.email",
  "company.phone",
  "client.name",
  "client.details",
  "totals.subtotal",
  "totals.discount",
  "totals.tax",
  "totals.total",
  "totals.tax_rate_percent",
  "lines.description",
  "lines.qty",
  "lines.unit_price",
  "lines.total",
  "notes",
]

function statusForPlaceholder(
  raw: string,
  normalized: string,
  inspectResult: TemplateInspectResult | null | undefined,
  mapping: Record<string, string>
) {
  const current = mapping[raw] || mapping[normalized]
  const suggested = inspectResult?.suggested_mapping?.[normalized]

  if (current) return "mapped"
  if (suggested) return "suggested"
  return "unmapped"
}

export default function TemplateMappingEditor({
  inspectResult,
  mapping,
  onChange,
}: TemplateMappingEditorProps) {
  const updateMapping = (raw: string, nextValue: string) => {
    const next = { ...mapping }
    if (!nextValue.trim()) {
      delete next[raw]
    } else {
      next[raw] = nextValue
    }
    onChange(next)
  }

  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-slate-50/70">
        <CardTitle>Field mapping editor</CardTitle>
        <CardDescription>
          Match detected placeholders to backend data paths.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {!inspectResult ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Run template inspection first to unlock mapping.
          </div>
        ) : (
          <div className="space-y-4">
            {inspectResult.normalized_placeholders.map((item) => {
              const currentValue =
                mapping[item.raw] ||
                mapping[item.normalized] ||
                inspectResult.suggested_mapping[item.normalized] ||
                ""

              const status = statusForPlaceholder(
                item.raw,
                item.normalized,
                inspectResult,
                mapping
              )

              return (
                <div
                  key={item.raw}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_1fr]"
                >
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-900">{item.raw}</div>
                    <div className="text-xs text-slate-500">
                      Normalized as <span className="font-medium">{item.normalized}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {status === "mapped" ? (
                        <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                          mapped
                        </Badge>
                      ) : status === "suggested" ? (
                        <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                          suggested
                        </Badge>
                      ) : (
                        <Badge className="rounded-full border border-amber-200 bg-amber-50 text-amber-700">
                          unmapped
                        </Badge>
                      )}

                      {inspectResult.detected_line_placeholders.includes(item.raw) ? (
                        <Badge className="rounded-full border border-violet-200 bg-violet-50 text-violet-700">
                          line field
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <select
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
                      value={KNOWN_TARGETS.includes(currentValue) ? currentValue : ""}
                      onChange={(e) => updateMapping(item.raw, e.target.value)}
                    >
                      <option value="">Choose known target</option>
                      {KNOWN_TARGETS.map((target) => (
                        <option key={target} value={target}>
                          {target}
                        </option>
                      ))}
                    </select>

                    <input
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                      value={currentValue}
                      onChange={(e) => updateMapping(item.raw, e.target.value)}
                      placeholder="Or type a custom path like custom.reference"
                    />

                    {inspectResult.suggested_mapping[item.normalized] ? (
                      <div className="text-xs text-slate-500">
                        Suggested:{" "}
                        <button
                          type="button"
                          className="font-medium text-sky-700 hover:underline"
                          onClick={() =>
                            updateMapping(
                              item.raw,
                              inspectResult.suggested_mapping[item.normalized]
                            )
                          }
                        >
                          {inspectResult.suggested_mapping[item.normalized]}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}