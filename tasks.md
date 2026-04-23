# Modura Production Readiness Tasks

## 1. Email Sending UX

- If no email configuration is set:
  - fallback to application default email provider
- UI must:
  - show which email is used (custom vs default)
  - not block sending
- track:
  - last_sent_at
  - last_sent_to

---

## 2. Document Events System

- Events must be tied to:
  - quotation
  - invoice
  - proforma
  - receipt
  - delivery note

- Event types:
  - created
  - updated
  - sent
  - viewed (optional)
  - converted (e.g. quotation → invoice)

- Metadata must include:
  - source document id
  - source document number
  - user

- All detail pages must show a timeline

---

## 3. Document Status System

### Quotations:
- draft
- sent
- accepted
- rejected

### Invoices:
- draft
- sent
- paid
- overdue

- Status must update automatically when actions occur

---

## 4. Document Numbering System

- Per organization
- Per document type

- Auto-increment
- Allow manual override (if enabled)

- Format:
  - QUO-0001
  - INV-0001
  - PRO-0001

- Store next_number in organization settings

---

## 5. Document Relationships

- quotation → invoice
- proforma → invoice
- invoice → receipt

Rules:
- Prevent duplicate derived documents
- If already exists → redirect to it
- Store reference to source document

---

## 6. PDF Generation

- Generate on demand
- Regenerate if document updated
- Store file path

- Filename format:
  customer_name_document_number.pdf

- Support:
  - preview
  - download

---

## 7. Organization Scoping

- ALL queries must be scoped by organization:
  - quotations
  - invoices
  - proformas
  - receipts
  - delivery notes

- No cross-organization data leakage

---

## 8. UI Consistency

- All document pages must follow same structure:
  - header (title + status)
  - actions (send, print, convert)
  - details (customer, totals)
  - line items table
  - activity timeline

- Use tables instead of cards
- Use modals for create/edit

---

## 9. Plans & Billing

- Default plan: FREE
- Optional: 30-day PRO trial

Track:
- number of documents
- storage usage
- emails sent

Enforcement:
- soft limit → show warning
- hard limit → block action

---

## 10. Usage Tracking

Track per organization:
- documents created
- emails sent
- storage used

---

## 11. Onboarding Flow

- On signup:
  - create organization
  - assign FREE plan

- First-time experience:
  - prompt to create first quotation

---

## 12. API & UI Stability

- Fix infinite loops (especially dropdowns)
- Add loading states
- Add error handling

- Debounce search inputs

---

## 13. Critical Flows (must work perfectly)

- Create quotation
- Update quotation
- Generate PDF
- Send email
- Convert to invoice
- View timeline

---

## 14. Performance & UX

- No unnecessary API calls
- No page reload loops
- Fast interactions


## 15. PDF Naming & Attachments (Customer-Facing)

- All generated PDFs must follow a professional naming format

Format:
  <document_type>_<document_number>_<customer_name>.pdf

Examples:
  quote_QUO-0001_John_Doe.pdf
  invoice_INV-0003_Acme_Corp.pdf

Rules:
- Replace spaces with underscores
- Remove special characters
- Ensure filename is safe for all systems

---

### Download Behavior

- When user downloads PDF:
  - filename must follow the format above
  - not generic names like "document.pdf"

---

### Email Attachments

- When sending documents via email:
  - attach PDF using same naming format
  - ensure customer name is visible in file name

---

### Backend Responsibility

- Filename should be generated server-side
- Store filename with document (optional but recommended)
- Ensure consistency across:
  - quotations
  - invoices
  - proformas
  - receipts
  - delivery notes

---

## RULE:

Do not add features outside this scope.
Focus only on production readiness and stability.