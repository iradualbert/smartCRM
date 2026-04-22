# Modura MVP – Project Definition

## 🎯 Goal

Build a production-ready MVP for a SaaS tool that allows users to:

* Create quotations
* Generate PDF
* Send to customers
* Convert to invoice

This MVP must be simple, fast, and focused on real usage.

---

## 🧠 Core Principle

This is NOT a full accounting system.

This is:
👉 A fast document workflow tool

Everything must support:
Create → Send → Convert

---

## 👤 Target User

* Freelancers
* Small businesses
* Contractors
* Agencies

They currently:

* use WhatsApp / Excel / Word
* need fast professional documents

---

## 🧩 Core Features

### 1. Authentication

* Email + password
* Simple login/register
* No social auth

---

### 2. Organization

* User creates organization on signup
* User belongs to one organization (MVP)
* No complex membership system yet

---

### 3. Customers

* CRUD customers
* Fields:

  * name
  * email
  * phone
  * address

---

### 4. Products

* CRUD products
* Fields:

  * name
  * price
  * description

---

### 5. Quotations

* Create quotation
* Add multiple line items
* Select customer
* Select products or manual lines

Fields:

* quote_number (auto increment)
* status (draft, sent, accepted)
* tax_mode (inclusive/exclusive)
* tax_rate
* totals calculated

---

### 6. PDF Generation

* Generate only when requested
* Use template
* Store file
* Flag: pdf_needs_regeneration

---

### 7. Email Sending

* Send quotation via email
* Attach PDF
* Track event

---

### 8. Convert to Invoice

* Button: “Create Invoice”
* Copies quotation data
* Prevent duplicates
* Redirect if already exists

---

### 9. Activity Timeline

* Show events:

  * created
  * updated
  * sent
  * pdf generated
  * converted

---

## 🚫 Explicitly NOT Included

* Multi-email accounts
* Advanced permissions
* Invite system (optional later)
* Catalog system
* Self-hosting
* Advanced analytics

---

## ⚙️ Backend Rules

* All data scoped by organization
* Use incremental document numbers
* No random IDs for quotes/invoices
* PDF generated on demand only
* Events tied to quotation (not document)

---

## 🎨 Frontend Rules

* Clean SaaS UI (light mode)
* Table-based layouts (not heavy cards)
* Modals for create/edit
* Fast interactions (no reload loops)

---

## 🧪 Critical Flows (must work perfectly)

1. Signup → create organization
2. Create customer
3. Create quotation with lines
4. Generate PDF
5. Send email
6. Convert to invoice

---

## 🚀 Launch Requirements

Must have before launch:

* Authentication works
* No infinite loading
* No crashing forms
* PDF generation works
* Email sending works

---

## 📈 Success Metric

First success:
👉 10 users sending real quotations

Not:

* feature completeness
* perfect UI

---

## 🧠 Development Rule

If a feature does not directly help:
👉 Create → Send → Convert

DO NOT BUILD IT.
