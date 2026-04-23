import DocumentEmailPage from "../shared-components/DocumentEmailPage"

export default function DeliveryNoteEmailPage() {
  return (
    <DocumentEmailPage
      documentType="delivery-note"
      documentLabel="Delivery Note"
      numberField="delivery_note_number"
      successMessage="Delivery note email sent successfully."
      backToPath={(id) => `/delivery-notes/${id}`}
    />
  )
}
