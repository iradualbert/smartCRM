import DocumentEmailPage from "../shared-components/DocumentEmailPage"

export default function ProformaEmailPage() {
  return (
    <DocumentEmailPage
      documentType="proforma"
      documentLabel="Proforma"
      numberField="proforma_number"
      successMessage="Proforma email sent successfully."
      backToPath={(id) => `/proformas/${id}`}
    />
  )
}
