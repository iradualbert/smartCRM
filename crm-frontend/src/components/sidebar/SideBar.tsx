import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LayoutGrid,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Receipt,
  Truck,
  Users,
  Package,
  MailCheck,
  Mail,
  Layers3,
  Building2,
  CreditCard,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  ClipboardList,
  Mail as MailCog,
} from "lucide-react"
import CreateDocumentModal from "./CreateDocumentModal"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

type NavItem = {
  label: string
  to: string
  icon: React.ElementType
}

type NavSection = {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutGrid },
      { label: "Sales Dashboard", to: "/sales-dashboard", icon: BarChart3 },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Quotations", to: "/quotations", icon: FileText },
      { label: "Proformas", to: "/proformas", icon: FileSpreadsheet },
      { label: "Invoices", to: "/invoices", icon: Receipt },
      { label: "Receipts", to: "/receipts", icon: Receipt },
      { label: "Delivery Notes", to: "/delivery-notes", icon: Truck },
    ],
  },
  {
    title: "Catalogues",
    items: [
      { label: "Catalogues", to: "/catalogues", icon: BookOpen },
      { label: "Quote Requests", to: "/quote-requests", icon: ClipboardList },
    ],
  },
  {
    title: "CRM",
    items: [
      { label: "Customers", to: "/customers", icon: Users },
      { label: "Products", to: "/products", icon: Package },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Sent Emails", to: "/emails", icon: MailCheck },
      { label: "Email Templates", to: "/email-templates", icon: Mail },
    ],
  },
  {
    title: "Templates",
    items: [
      { label: "Document Templates", to: "/templates", icon: Layers3 },
    ],
  },
  {
    title: "Organization",
    items: [
      { label: "Organizations", to: "/settings/organizations", icon: Building2 },
      { label: "Billing", to: "/settings/billing", icon: CreditCard },
      { label: "Email Configuration", to: "/settings/email", icon: MailCog },
      { label: "Settings", to: "/settings", icon: Settings2 },
    ],
  },
]

export default function SideBar() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [createOpen, setCreateOpen] = React.useState(false)
  const { currentOrganization } = useOrganizations()

  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-w",
      collapsed ? "84px" : "280px"
    )
    return () => { document.documentElement.style.removeProperty("--sidebar-w") }
  }, [collapsed])

  return (
    <>
      <aside
        className={`fixed left-0 top-16 z-30 flex h-[calc(100vh-4rem)] flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
          collapsed ? "w-[84px]" : "w-[280px]"
        }`}
      >
        <div className="border-b border-slate-200 p-3">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className={`flex w-full items-center gap-3 rounded-2xl bg-slate-900 px-3 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 ${
              collapsed ? "justify-center" : ""
            }`}
            aria-label="Create"
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>Create</span> : null}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {sections.map((section) => (
              <NavGroup
                key={section.title}
                title={section.title}
                items={section.items}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 p-3 space-y-2">
          <div
            className={`flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 shrink-0">
              O
            </div>

            {!collapsed ? (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-900">
                  {currentOrganization?.name || "Organization"}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {currentOrganization?.plan_name || "Free Plan"}
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={`flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 ${
              collapsed ? "justify-center" : ""
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <CreateDocumentModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}

function NavGroup({
  title,
  items,
  collapsed,
}: {
  title: string
  items: NavItem[]
  collapsed: boolean
}) {
  return (
    <section>
      {!collapsed ? (
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {title}
        </div>
      ) : null}

      <div className="space-y-1">
        {items.map((item) => (
          <SideBarLink
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
          />
        ))}
      </div>
    </section>
  )
}

function SideBarLink({
  to,
  label,
  icon: Icon,
  collapsed,
}: {
  to: string
  label: string
  icon: React.ElementType
  collapsed: boolean
}) {
  const location = useLocation()

  const active = React.useMemo(() => {
    if (location.pathname === to) return true
    if (to === "/" || to === "/settings") return false
    return location.pathname.startsWith(`${to}/`)
  }, [location.pathname, to])

  const linkEl = (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : ""}`} />
      {!collapsed ? <span className="truncate font-medium">{label}</span> : null}
    </Link>
  )

  if (!collapsed) return linkEl

  return (
    <Tooltip>
      <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}
