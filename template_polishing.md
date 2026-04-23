# Templates and Document List Polishing

## 1. Default Templates
- Create polished built-in default templates for:
  - quotation
  - invoice
  - proforma
  - receipt
  - delivery note

- New users must be able to generate/send documents without creating templates manually

- Template selection priority:
  1. explicitly selected template
  2. organization default template
  3. global default template

## 2. Company Identity in Templates
Default templates must automatically render:
- company legal name
- company address
- company email
- company phone
- company website
- tax number

Use legal_name when available, otherwise fallback to name.

## 3. Document List Pages
Update all document list pages to display customer name consistently:
- quotations
- proformas
- invoices
- receipts
- delivery notes

Columns should include:
- document number
- title/name if applicable
- customer name
- status
- total
- created date

## 4. Relationship Cleanup
Ensure receipts and delivery notes resolve customer name safely through invoice/customer relationships and do not assume proforma always exists.

## 5. Launch UX Rule
Do not require template setup during signup or first use.
Users should be able to test the app immediately with default templates.