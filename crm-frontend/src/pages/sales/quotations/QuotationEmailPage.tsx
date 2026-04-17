import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import EmailComposer, { type EmailComposerSubmitPayload } from "../shared-components/EmailComposer"
import { Button } from "@/components/ui/button"
import { getQuotationEmailDraft, sendQuotationEmail } from "./api"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

type QuotationEmailDraft = {
  to: string
  cc: string
  subject: string
  body_html: string
  attachment_name?: string | null
  attachment_url?: string | null
  quotation_number?: string
}

export default function QuotationEmailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [draft, setDraft] = React.useState<QuotationEmailDraft | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const { currentOrganizationId } = useOrganizations()

  React.useEffect(() => {
    const run = async () => {
      if (!id || !currentOrganizationId) return

      try {
        setLoading(true)
        setError(null)
        const data = await getQuotationEmailDraft(id, currentOrganizationId)
        setDraft(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load quotation email draft.")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [id, currentOrganizationId])

  const handleSend = async (payload: EmailComposerSubmitPayload) => {
    if (!id || !currentOrganizationId) return

    try {
      setSending(true)
      setError(null)
      setSuccess(null)

      await sendQuotationEmail(id, currentOrganizationId, payload)

      setSuccess("Quotation email sent successfully.")
    } catch (err) {
      console.error(err)
      setError("Failed to send quotation email.")
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
              onClick={() => navigate(`/quotations/${id}`)}
            >
              Back to quotation
            </Button>
          </div>
        </div>
      ) : null}

      <EmailComposer
        title={`Send quotation email${draft?.quotation_number ? ` · ${draft.quotation_number}` : ""}`}
        description="The email template is prefilled from the quotation and can be edited before sending."
        documentLabel="Quotation"
        loading={loading}
        sending={sending}
        initialTo={draft?.to ?? ""}
        initialCc={draft?.cc ?? ""}
        initialSubject={draft?.subject ?? ""}
        initialBodyHtml={draft?.body_html ?? ""}
        attachmentName={draft?.attachment_name ?? null}
        attachmentUrl={draft?.attachment_url ?? null}
        includeAttachmentByDefault
        onBack={() => navigate(`/quotations/${id}`)}
        onSend={handleSend}
      />
    </div>
  )
}