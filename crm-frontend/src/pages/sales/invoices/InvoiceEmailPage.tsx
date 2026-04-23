import DocumentEmailPage from "../shared-components/DocumentEmailPage"

export default function InvoiceEmailPage() {
  return (
    <DocumentEmailPage
      documentType="invoice"
      documentLabel="Invoice"
      numberField="invoice_number"
      successMessage="Invoice email sent successfully."
      backToPath={(id) => `/invoices/${id}`}
    />
  )
}
