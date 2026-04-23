import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"

import EmailComposer, { type EmailComposerSubmitPayload } from "../shared-components/EmailComposer"
import { Button } from "@/components/ui/button"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

export default function InvoiceEmailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentOrganizationId } = useOrganizations()

  const [draft, setDraft] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!id || !currentOrganizationId) return
    setLoading(true)
    axios
      .get(`/invoices/${id}/email_draft/?company=${currentOrganizationId}`, { withCredentials: true })
      .then((res) => setDraft(res.data))
      .catch(() => setError("Failed to load email draft."))
      .finally(() => setLoading(false))
  }, [id, currentOrganizationId])

  const handleSend = async (payload: EmailComposerSubmitPayload) => {
    if (!id || !currentOrganizationId) return
    try {
      setSending(true)
      setError(null)
      setSuccess(null)
      await axios.post(
        `/invoices/${id}/send-email/?company=${currentOrganizationId}`,
        payload,
        { withCredentials: true }
      )
      setSuccess("Invoice email sent successfully.")
    } catch {
      setError("Failed to send invoice email.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mx-auto max-w-7xl px-6 pt-6 md:px-8">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        </div>
      )}
      {success && (
        <div className="mx-auto max-w-7xl px-6 pt-6 md:px-8">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <span>{success}</span>
            <Button
              variant="outline"
              className="rounded-xl border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-100"
              onClick={() => navigate(`/invoices/${id}`)}
            >
              Back to invoice
            </Button>
          </div>
        </div>
      )}
      <EmailComposer
        title={`Send invoice email${draft?.invoice_number ? ` · ${draft.invoice_number}` : ""}`}
        description="The email template is prefilled from the invoice and can be edited before sending."
        documentLabel="Invoice"
        loading={loading}
        sending={sending}
        initialTo={draft?.to ?? ""}
        initialCc={draft?.cc ?? ""}
        initialSubject={draft?.subject ?? ""}
        initialBodyHtml={draft?.body_html ?? ""}
        attachmentName={draft?.attachment_name ?? null}
        attachmentUrl={draft?.attachment_url ?? null}
        includeAttachmentByDefault
        onBack={() => navigate(`/invoices/${id}`)}
        onSend={handleSend}
      />
    </div>
  )
}
