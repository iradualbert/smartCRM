import createQuotationMd from "./content/how-to-create-a-quotation.md?url"
import sendQuotationEmailMd from "./content/how-to-send-a-quotation-by-email.md?url"
import quotationVsInvoiceMd from "./content/quotation-vs-invoice.md?url"
import proformaInvoiceMd from "./content/what-is-a-proforma-invoice.md?url"
import invoiceFromQuotationMd from "./content/how-to-create-an-invoice-from-a-quotation.md?url"

export type GuideEntry = {
  slug: string
  title: string
  description: string
  category: string
  readingTime: string
  lastUpdated: string
  markdownPath: string
}

export const guides: GuideEntry[] = [
  {
    slug: "how-to-create-a-quotation",
    title: "How to Create a Quotation",
    description: "A simple step-by-step guide to creating a clear, professional quotation your customer can review quickly.",
    category: "Getting started",
    readingTime: "4 min read",
    lastUpdated: "April 23, 2026",
    markdownPath: createQuotationMd,
  },
  {
    slug: "how-to-send-a-quotation-by-email",
    title: "How to Send a Quotation by Email",
    description: "Learn how to prepare the quotation PDF, choose the right sender account, and send a polished email from the app.",
    category: "Sending",
    readingTime: "4 min read",
    lastUpdated: "April 23, 2026",
    markdownPath: sendQuotationEmailMd,
  },
  {
    slug: "quotation-vs-invoice",
    title: "Quotation vs Invoice",
    description: "Understand when to use a quotation and when to use an invoice so your sales workflow stays clear.",
    category: "Concepts",
    readingTime: "3 min read",
    lastUpdated: "April 23, 2026",
    markdownPath: quotationVsInvoiceMd,
  },
  {
    slug: "what-is-a-proforma-invoice",
    title: "What Is a Proforma Invoice",
    description: "A practical explanation of what a proforma invoice is, when businesses use it, and how it fits before an invoice.",
    category: "Concepts",
    readingTime: "4 min read",
    lastUpdated: "April 23, 2026",
    markdownPath: proformaInvoiceMd,
  },
  {
    slug: "how-to-create-an-invoice-from-a-quotation",
    title: "How to Create an Invoice from a Quotation",
    description: "Convert an accepted quotation into an invoice without re-entering the same customer and line item details.",
    category: "Workflow",
    readingTime: "4 min read",
    lastUpdated: "April 23, 2026",
    markdownPath: invoiceFromQuotationMd,
  },
]

export const guidesBySlug = Object.fromEntries(guides.map((guide) => [guide.slug, guide]))
