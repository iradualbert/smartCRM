# Public Guides Section (Separate from App, Inside Frontend)

Build a public-facing guides/blog section inside the frontend codebase, but separate from the authenticated app.

## Goal
Provide simple educational guides for onboarding, trust, and SEO without building a CMS.

## Requirements

### Architecture
- Keep guides separate from the authenticated application UI
- Public routes should live under:
  - /guides
  - /guides/:slug
- Do not require login
- Do not mix guide pages with dashboard/app layout

### Content Source
- Use local markdown files for now
- No CMS
- No backend models
- No database dependency
- No admin editor

### Pages
1. Guides index page
   - show all guides in a clean list/grid
   - title
   - short description
   - category
   - estimated reading time (optional)

2. Guide detail page
   - render markdown content
   - clean reading layout
   - include title, description, and last updated
   - include CTA at bottom:
     - “Create your first quotation”
     - “Try the app”

### Styling
- Reuse frontend design system
- Keep it light, clean, professional
- Reading-friendly layout
- Premium SaaS docs feel
- No dark mode for now

### Components
- Reuse Markdown.tsx
- Reuse PageWrapper.tsx pattern for static/public content
- Add guide-specific page wrapper if needed, but keep logic simple

### Data Structure
Create a guides config file with:
- slug
- title
- description
- category
- markdown file path

### Initial Guides
Create these markdown guides:
1. how-to-create-a-quotation
2. how-to-send-a-quotation-by-email
3. quotation-vs-invoice
4. what-is-a-proforma-invoice
5. how-to-create-an-invoice-from-a-quotation

### Navigation
- Add “Guides” link in public navigation/footer
- Do not show inside app sidebar unless as a small help link

### SEO Preparation
- Each guide page should set page title
- Each guide page should have description metadata support if easy
- Keep URLs clean and readable

### Constraints
- Keep implementation minimal
- No CMS
- No search feature yet
- No comments
- No tagging system beyond simple category labels
- No pagination needed yet

## Output
Implement:
- routes
- guide index page
- guide detail page
- markdown files
- simple guide registry/config
- public navigation/footer link

Write 5 clear, beginner-friendly markdown guides for a SaaS app that helps users create quotations and invoices.

Tone:
- practical
- professional
- simple
- not fluffy

Each guide should include:
- title
- short intro
- step-by-step instructions
- short conclusion
- CTA to try the app

Guides:
1. How to Create a Quotation
2. How to Send a Quotation by Email
3. Quotation vs Invoice
4. What Is a Proforma Invoice
5. How to Create an Invoice from a Quotation