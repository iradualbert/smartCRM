import {
  BarChart3,
  Building2,
  CreditCard,
  FileCheck2,
  FileSpreadsheet,
  Files,
  FolderKanban,
  Link2,
  Mail,
  MessageCircle,
  Receipt,
  RefreshCcw,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  Zap,
  BellRing,
  PlugZap,
} from "lucide-react"

export const heroStats = [
  {
    label: "Document types",
    value: "5+",
    hint: "Quotations, proformas, invoices, receipts, delivery notes",
  },
  {
    label: "Core workflow",
    value: "Create -> Send -> Track",
    hint: "One steady workflow for customer documents",
  },
  {
    label: "Built for",
    value: "SMEs and teams",
    hint: "Agencies, service businesses, traders, and growing operations",
  },
]

export const coreFeatures = [
  {
    title: "Document Management",
    description:
      "Create, edit, organize, and generate professional business documents with automatic totals and polished PDF output.",
    icon: Files,
    bullets: [
      "Quotations, proformas, invoices, receipts, delivery notes",
      "Automatic totals, tax handling, and calculations",
      "PDF generation with template-based output",
      "Activity history across document actions",
    ],
  },
  {
    title: "Sales Workflow",
    description:
      "Move cleanly from quotation to invoice and receipt with consistent statuses, timelines, and follow-up visibility.",
    icon: Wallet,
    bullets: [
      "Quotation to invoice conversion",
      "Invoice to receipt workflow",
      "Due date and overdue visibility",
      "Status tracking across sales documents",
    ],
  },
  {
    title: "Sending & Communication",
    description:
      "Send documents directly from the platform with professional attachments, sender accounts, and reusable email content.",
    icon: Mail,
    bullets: [
      "Email with generated PDF attachments",
      "Organization sender accounts",
      "Default and reusable email templates",
      "Sent email history",
    ],
  },
  {
    title: "Organizations & Access",
    description:
      "Work inside organization-scoped workspaces with membership-aware access and cleaner team separation.",
    icon: ShieldCheck,
    bullets: [
      "Organization-based scoping",
      "Membership-aware access control",
      "Safer document and template separation",
      "Shared sender and template settings",
    ],
  },
  {
    title: "Templates & Output",
    description:
      "Keep documents consistent with reusable templates and fallback defaults that work from day one.",
    icon: Building2,
    bullets: [
      "Document templates by type",
      "Organization-scoped templates",
      "Professional default templates",
      "Consistent filenames for downloads and email attachments",
    ],
  },
  {
    title: "Customers & Products",
    description:
      "Manage reusable customer and product records for faster document creation and consistent pricing.",
    icon: FolderKanban,
    bullets: [
      "Customer management",
      "Product catalog",
      "Reusable line items",
      "Pricing and quantities",
    ],
  },
]

export const workflowSteps = [
  {
    title: "Create",
    description: "Start with a quotation, invoice, receipt, proforma, or delivery note.",
    icon: FileSpreadsheet,
  },
  {
    title: "Send",
    description: "Prepare a PDF automatically and send it by email with the right sender account.",
    icon: MessageCircle,
  },
  {
    title: "Track",
    description: "Monitor statuses, due dates, activity history, and sent email records.",
    icon: CreditCard,
  },
  {
    title: "Collaborate",
    description: "Work inside the right organization with shared templates, catalogs, and document settings.",
    icon: Users,
  },
]

export const quickHighlights = [
  {
    title: "Quotations",
    icon: FileSpreadsheet,
    color: "bg-blue-500",
  },
  {
    title: "Invoices",
    icon: FileCheck2,
    color: "bg-green-500",
  },
  {
    title: "Proformas",
    icon: RefreshCcw,
    color: "bg-violet-500",
  },
  {
    title: "Receipts",
    icon: Receipt,
    color: "bg-orange-500",
  },
  {
    title: "Delivery Notes",
    icon: Truck,
    color: "bg-teal-500",
  },
]

export const insights = [
  {
    title: "Workspace overview",
    icon: BarChart3,
  },
  {
    title: "Recent quotations",
    icon: CreditCard,
  },
  {
    title: "Open attention items",
    icon: BellRing,
  },
  {
    title: "Document activity feed",
    icon: Users,
  },
  {
    title: "Subscription and usage visibility",
    icon: Zap,
  },
]

export const futureReady = [
  {
    title: "Quotation dashboard",
    icon: RefreshCcw,
  },
  {
    title: "Invoice follow-up",
    icon: PlugZap,
  },
  {
    title: "Email sending setup",
    icon: MessageCircle,
  },
  {
    title: "Template management",
    icon: Link2,
  },
  {
    title: "Organization management",
    icon: ShieldCheck,
  },
  {
    title: "Billing controls",
    icon: FolderKanban,
  },
]

export const differentiators = [
  {
    title: "Communication-first",
    description: "Create the document, prepare the PDF, and send it without leaving the workflow.",
  },
  {
    title: "Operationally practical",
    description: "Built around everyday sales documents and the work that happens right after they are created.",
  },
  {
    title: "Multi-company support",
    description: "Support more than one organization without blending data, templates, or sending settings.",
  },
  {
    title: "Simple but powerful",
    description: "A calmer alternative to heavier systems while still covering the work most small teams need daily.",
  },
]

export const plans = [
  {
    name: "Free",
    price: "$0 / month",
    priceTry: "TRY 0 / month",
    accent: "border-slate-200 bg-white",
    highlighted: false,
    cta: "Get started free",
    ctaHref: "/signup",
    features: [
      "1 organization",
      "1 user",
      "20 documents / month",
      "5 emails / month",
      "100 MB storage",
      "PDF generation and default templates",
    ],
  },
  {
    name: "Business",
    price: "$6 / month",
    priceTry: "TRY 200 / month",
    accent: "border-blue-500 bg-blue-50/60",
    highlighted: true,
    cta: "Get started",
    ctaHref: "/signup",
    features: [
      "1 organization",
      "Up to 3 users",
      "200 documents / month",
      "200 emails / month",
      "1 GB storage",
      "PDF generation and email sending",
      "Organization templates",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom pricing",
    priceTry: "Custom pricing",
    accent: "border-violet-200 bg-violet-50/60",
    highlighted: false,
    cta: "Contact Sales",
    ctaHref: "mailto:sales@moduragroup.com",
    features: [
      "Up to 5 organizations",
      "Up to 20 users",
      "Unlimited documents",
      "Unlimited emails",
      "Unlimited storage",
      "PDF generation and email sending",
      "Custom templates",
      "Branding removal",
      "Priority support",
    ],
  },
]
