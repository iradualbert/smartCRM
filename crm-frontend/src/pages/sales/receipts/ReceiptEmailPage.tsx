import DocumentEmailPage from "../shared-components/DocumentEmailPage"

export default function ReceiptEmailPage() {
  return (
    <DocumentEmailPage
      documentType="receipt"
      documentLabel="Receipt"
      numberField="receipt_number"
      successMessage="Receipt email sent successfully."
      backToPath={(id) => `/receipts/${id}`}
    />
  )
}
