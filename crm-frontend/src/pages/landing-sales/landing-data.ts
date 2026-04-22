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
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  Zap,
  RefreshCcw,
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
    value: "Create → Send → Track → Get paid",
    hint: "One place for business operations",
  },
  {
    label: "Built for",
    value: "SMEs & teams",
    hint: "Freelancers, agencies, service providers, traders",
  },
]

export const coreFeatures = [
  {
    title: "Document Management",
    description:
      "Create, edit, organize, and generate professional business documents with automatic totals and PDF export.",
    icon: Files,
    bullets: [
      "Quotations, proformas, invoices, receipts, delivery notes",
      "Automatic totals and calculations",
      "PDF generation and template-based output",
      "Document lifecycle management",
    ],
  },
  {
    title: "Payment Tracking",
    description:
      "Track unpaid, partially paid, and paid invoices with due dates, balances, and overdue visibility.",
    icon: Wallet,
    bullets: [
      "Payment status visibility",
      "Due date tracking",
      "Outstanding balances",
      "Overdue monitoring",
    ],
  },
  {
    title: "Sending & Communication",
    description:
      "Send documents directly from the platform through email, WhatsApp-style sharing, and secure links.",
    icon: Mail,
    bullets: [
      "Email with PDF or link",
      "WhatsApp sharing via link",
      "Message templates and dynamic variables",
      "Reusable communication templates",
    ],
  },
  {
    title: "Secure Document Access",
    description:
      "Give customers access through secure public links with revocation and tracking controls.",
    icon: ShieldCheck,
    bullets: [
      "Token-based access",
      "No login required for customers",
      "Expiry and revoke controls",
      "View/open tracking",
    ],
  },
  {
    title: "Multi-Company & Team Support",
    description:
      "Support one user across multiple companies with roles and company-specific profiles.",
    icon: Building2,
    bullets: [
      "One user, multiple companies",
      "Company membership system",
      "Roles: owner, admin, staff, viewer",
      "Company-specific user profiles",
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
    description: "Share via email, WhatsApp-style links, or secure public access.",
    icon: MessageCircle,
  },
  {
    title: "Track",
    description: "Monitor payment status, due dates, balances, and document access.",
    icon: CreditCard,
  },
  {
    title: "Collaborate",
    description: "Work across teams and companies with structured roles and shared workflows.",
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
    title: "Revenue overview",
    icon: BarChart3,
  },
  {
    title: "Unpaid invoices",
    icon: CreditCard,
  },
  {
    title: "Overdue tracking",
    icon: BellRing,
  },
  {
    title: "Customer insights",
    icon: Users,
  },
  {
    title: "Business performance metrics",
    icon: Zap,
  },
]

export const futureReady = [
  {
    title: "Recurring invoices",
    icon: RefreshCcw,
  },
  {
    title: "Payment integrations",
    icon: PlugZap,
  },
  {
    title: "SMS notifications",
    icon: MessageCircle,
  },
  {
    title: "Activity logs",
    icon: Link2,
  },
  {
    title: "Client portal",
    icon: ShieldCheck,
  },
  {
    title: "Expense & purchase module",
    icon: FolderKanban,
  },
]

export const differentiators = [
  {
    title: "Communication-first",
    description: "Not just documents — send them instantly and keep operations moving.",
  },
  {
    title: "Link-based sharing",
    description: "Modern, mobile-friendly document access through secure public links.",
  },
  {
    title: "Multi-company support",
    description: "Built for agencies, teams, and growing businesses with shared workflows.",
  },
  {
    title: "Simple but powerful",
    description: "A practical alternative to heavy ERP systems without losing core business value.",
  },
]

export const plans = [
  {
    name: "Free",
    price: "$0 / month",
    priceTry: "₺0 / month",
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
      "PDF generation",
    ],
  },
  {
    name: "Business",
    price: "$6 / month",
    priceTry: "₺200 / month",
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
      "PDF generation",
      "Email sending",
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
      "PDF generation",
      "Email sending",
      "Custom templates",
      "AI quote extraction",
      "Branding removal",
    ],
  },
]