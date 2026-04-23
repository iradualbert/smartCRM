import * as React from "react"
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  Paperclip,
  Send,
  Settings2,
  UserCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import RichEmailEditor from "./RichEmailEditor"
import { listEmailSendingConfigs } from "./api"
import axios from "axios"

export type EmailSendingConfigOption = {
  id: number
  name: string
  owner_type: "company" | "user"
  from_name: string | null
  from_email: string
  is_default: boolean
  is_active: boolean
  company?: number | null
  user?: number | null
}

export type EmailComposerSubmitPayload = {
  to: string
  cc: string
  subject: string
  bodyHtml: string
  includeAttachment: boolean
  sendingConfigId: number | null
}

type EmailComposerProps = {
  title?: string
  description?: string
  documentLabel?: string
  loading?: boolean
  sending?: boolean
  companyId?: number | string
  initialTo?: string
  initialCc?: string
  initialSubject?: string
  initialBodyHtml?: string
  attachmentName?: string | null
  attachmentUrl?: string | null
  includeAttachmentByDefault?: boolean
  onBack?: () => void
  onSend: (payload: EmailComposerSubmitPayload) => Promise<void> | void
}

function configDisplayName(config: EmailSendingConfigOption) {
  const label = config.from_name?.trim() || config.name
  return `${label} <${config.from_email}>`
}

export default function EmailComposer({
  title = "Send email",
  description = "Review and send this email.",
  documentLabel,
  loading = false,
  sending = false,
  companyId,
  initialTo = "",
  initialCc = "",
  initialSubject = "",
  initialBodyHtml = "",
  attachmentName,
  attachmentUrl,
  includeAttachmentByDefault = true,
  onBack,
  onSend,
}: EmailComposerProps) {
  const [to, setTo] = React.useState(initialTo)
  const [cc, setCc] = React.useState(initialCc)
  const [subject, setSubject] = React.useState(initialSubject)
  const [bodyHtml, setBodyHtml] = React.useState(initialBodyHtml)
  const [includeAttachment, setIncludeAttachment] = React.useState(includeAttachmentByDefault)

  const [sendingConfigs, setSendingConfigs] = React.useState<EmailSendingConfigOption[]>([])
  const [loadingSendingConfigs, setLoadingSendingConfigs] = React.useState(false)
  const [sendingConfigsError, setSendingConfigsError] = React.useState<string | null>(null)
  const [selectedSendingConfigId, setSelectedSendingConfigId] = React.useState<number | null>(null)
  const [previewingAttachment, setPreviewingAttachment] = React.useState(false)

  React.useEffect(() => setTo(initialTo), [initialTo])
  React.useEffect(() => setCc(initialCc), [initialCc])
  React.useEffect(() => setSubject(initialSubject), [initialSubject])
  React.useEffect(() => setBodyHtml(initialBodyHtml), [initialBodyHtml])

  React.useEffect(() => {
    let isMounted = true

    const run = async () => {
      try {
        setLoadingSendingConfigs(true)
        setSendingConfigsError(null)

        const data = await listEmailSendingConfigs(
          companyId ? { company: companyId } : undefined
        )

        if (!isMounted) return

        setSendingConfigs(data)

        const preferred =
          data.find((config: EmailSendingConfigOption) => config.is_active && config.is_default) ||
          data.find((config: EmailSendingConfigOption) => config.is_active) ||
          null

        setSelectedSendingConfigId((prev) => prev ?? preferred?.id ?? null)
      } catch (err) {
        console.error(err)
        if (!isMounted) return
        setSendingConfigs([])
        setSendingConfigsError("Failed to load sending accounts.")
      } finally {
        if (isMounted) setLoadingSendingConfigs(false)
      }
    }

    run()

    return () => {
      isMounted = false
    }
  }, [companyId])

  const selectedSendingConfig = React.useMemo(() => {
    return sendingConfigs.find((config) => config.id === selectedSendingConfigId) ?? null
  }, [sendingConfigs, selectedSendingConfigId])

  const strippedText = React.useMemo(() => {
    return bodyHtml.replace(/<[^>]+>/g, "").trim()
  }, [bodyHtml])

  const canSend =
    !loading &&
    !sending &&
    !loadingSendingConfigs &&
    Boolean(to.trim()) &&
    Boolean(subject.trim()) &&
    Boolean(strippedText)

  const handleSubmit = async () => {
    if (!canSend) return
    onSend({
      to: to.trim(),
      cc: cc.trim(),  
      subject: subject.trim(),
      bodyHtml,
      includeAttachment,
      sendingConfigId: selectedSendingConfigId,
    })
  }

  const handlePreviewAttachment = async () => {
    if (!attachmentUrl || previewingAttachment) return

    try {
      setPreviewingAttachment(true)
      const response = await axios.get(attachmentUrl, {
        responseType: "blob",
        withCredentials: true,
      })

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      )
      window.open(blobUrl, "_blank", "noopener,noreferrer")
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000)
    } catch (error) {
      console.error(error)
    } finally {
      setPreviewingAttachment(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          Loading email draft...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {onBack ? (
            <Button
              variant="ghost"
              className="mb-3 rounded-xl px-0 text-slate-500 hover:bg-transparent"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>

            {documentLabel ? (
              <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                {documentLabel}
              </Badge>
            ) : null}
          </div>

          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button className="rounded-2xl" onClick={handleSubmit} disabled={!canSend}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send email"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/70">
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-sky-700" />
              Sender account
            </CardTitle>
            <CardDescription>
              Choose which configured mailbox will send this email.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            {loadingSendingConfigs ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Loading sending accounts...
              </div>
            ) : sendingConfigsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {sendingConfigsError}
              </div>
            ) : sendingConfigs.length === 0 ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
                No SMTP sending configuration was found. This email will use the application default sender.
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Send from
                  </label>
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    value={selectedSendingConfigId ?? ""}
                    onChange={(e) => setSelectedSendingConfigId(Number(e.target.value))}
                  >
                    <option value="" disabled>
                      Select sending account
                    </option>

                    {sendingConfigs
                      .filter((config) => config.is_active)
                      .map((config) => (
                        <option key={config.id} value={config.id}>
                          {configDisplayName(config)}
                          {config.is_default ? " — Default" : ""}
                          {config.owner_type === "company" ? " — Company" : " — Personal"}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedSendingConfig ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-2">
                        {selectedSendingConfig.owner_type === "company" ? (
                          <Building2 className="h-5 w-5 text-slate-700" />
                        ) : (
                          <UserCircle2 className="h-5 w-5 text-slate-700" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-medium text-slate-900">
                            {selectedSendingConfig.from_name || selectedSendingConfig.name}
                          </div>

                          {selectedSendingConfig.is_default ? (
                            <Badge className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                              Default
                            </Badge>
                          ) : null}

                          <Badge className="rounded-full border border-slate-200 bg-white text-slate-700">
                            {selectedSendingConfig.owner_type === "company"
                              ? "Company account"
                              : "Personal account"}
                          </Badge>
                        </div>

                        <div className="mt-1 text-sm text-slate-600">
                          {selectedSendingConfig.from_email}
                        </div>

                        <div className="mt-3 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-700">
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Active sending configuration
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl border border-sky-200 bg-white p-2">
                        <Mail className="h-5 w-5 text-sky-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-900">Application default sender</div>
                        <div className="mt-1 text-sm text-slate-600">
                          No custom mailbox selected. The backend will use the default configured sender.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/70">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-sky-700" />
              Email details
            </CardTitle>
            <CardDescription>
              Update recipients, subject, and body before sending.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  To
                </label>
                <Input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="client@example.com"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Cc
                </label>
                <Input
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="Optional"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subject
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Quotation #Q-1001 – Acme Ltd"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email body
              </label>

              <RichEmailEditor
                value={bodyHtml}
                onChange={setBodyHtml}
                placeholder="Write your email..."
              />
            </div>

            {(attachmentName || attachmentUrl) ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-2">
                      <Paperclip className="h-4 w-4 text-slate-600" />
                    </div>

                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        Attach PDF
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {attachmentName || "Attachment available"}
                      </div>

                      {attachmentUrl ? (
                        <button
                          type="button"
                          onClick={() => void handlePreviewAttachment()}
                          disabled={previewingAttachment}
                          className="mt-2 inline-flex items-center text-sm font-medium text-sky-700 hover:underline"
                        >
                          <FileText className="mr-1.5 h-4 w-4" />
                          {previewingAttachment ? "Opening attachment..." : "Preview attachment"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={includeAttachment}
                      onChange={(e) => setIncludeAttachment(e.target.checked)}
                    />
                    Include
                  </label>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
