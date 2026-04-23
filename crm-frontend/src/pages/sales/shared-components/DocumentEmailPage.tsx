import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

import EmailComposer, { type EmailComposerSubmitPayload } from "./EmailComposer"

type DocumentEmailPageProps = {
  documentType: "quotation" | "invoice" | "proforma" | "receipt" | "delivery-note"
  documentLabel: string
  numberField:
    | "quotation_number"
    | "invoice_number"
    | "proforma_number"
    | "receipt_number"
    | "delivery_note_number"
  successMessage: string
  backToPath: (id: string) => string
}

export default function DocumentEmailPage({
  documentType,
  documentLabel,
  numberField,
  successMessage,
  backToPath,
}: DocumentEmailPageProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()

  const [draft, setDraft] = React.useState<Record<string, any> | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!id || !currentOrganizationId) return

    setLoading(true)
    setError(null)

    axios
      .get(`/${documentType}s/${id}/email_draft/?company=${currentOrganizationId}`, {
        withCredentials: true,
      })
      .then((res) => setDraft(res.data))
      .catch(() => setError(`Failed to load ${documentLabel.toLowerCase()} email draft.`))
      .finally(() => setLoading(false))
  }, [documentLabel, documentType, id, currentOrganizationId])

  const handleSend = async (payload: EmailComposerSubmitPayload) => {
    if (!id || !currentOrganizationId) return

    try {
      setSending(true)
      setError(null)
      setSuccess(null)

      await axios.post(
        `/${documentType}s/${id}/send-email/?company=${currentOrganizationId}`,
        {
          to: payload.to,
          cc: payload.cc ? payload.cc.split(",").map((v) => v.trim()).filter(Boolean) : [],
          subject: payload.subject,
          body_html: payload.bodyHtml,
          include_attachment: payload.includeAttachment,
          ...(payload.sendingConfigId ? { sending_config_id: payload.sendingConfigId } : {}),
        },
        { withCredentials: true }
      )

      setSuccess(successMessage)
    } catch {
      setError(`Failed to send ${documentLabel.toLowerCase()} email.`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      {error ? (
        <div className="mx-auto max-w-7xl px-6 pt-6 md:px-8">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        </div>
      ) : null}

      {success ? (
        <div className="mx-auto max-w-7xl px-6 pt-6 md:px-8">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <span>{success}</span>
            <Button
              variant="outline"
              className="rounded-xl border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-100"
              onClick={() => navigate(backToPath(id!))}
            >
              Back to {documentLabel.toLowerCase()}
            </Button>
          </div>
        </div>
      ) : null}

      <EmailComposer
        title={`Send ${documentLabel.toLowerCase()} email${
          draft?.[numberField] ? ` · ${draft[numberField]}` : ""
        }`}
        description={`The email template is prefilled from the ${documentLabel.toLowerCase()} and can be edited before sending.`}
        documentLabel={documentLabel}
        companyId={currentOrganizationId}
        loading={loading}
        sending={sending}
        initialTo={draft?.to ?? ""}
        initialCc={draft?.cc ?? ""}
        initialSubject={draft?.subject ?? ""}
        initialBodyHtml={draft?.body_html ?? ""}
        attachmentName={draft?.attachment_name ?? null}
        attachmentUrl={draft?.attachment_url ?? null}
        includeAttachmentByDefault
        onBack={() => navigate(backToPath(id!))}
        onSend={handleSend}
      />
    </div>
  )
}
