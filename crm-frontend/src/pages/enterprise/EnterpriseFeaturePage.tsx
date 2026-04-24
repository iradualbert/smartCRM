import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { ArrowRight, BookOpen, ClipboardList, Mail, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

type FeatureConfig = {
  title: string
  eyebrow: string
  summary: string
  icon: React.ElementType
}

const featureConfigByPath: Record<string, FeatureConfig> = {
  "/catalogues": {
    title: "Catalogues",
    eyebrow: "Enterprise",
    summary: "Centralize reusable catalog content for larger teams and structured sales flows.",
    icon: BookOpen,
  },
  "/quote-requests": {
    title: "Quote Requests",
    eyebrow: "Enterprise",
    summary: "Collect and route inbound quote requests with a dedicated workflow.",
    icon: ClipboardList,
  },
  "/email-templates": {
    title: "Email Templates",
    eyebrow: "Enterprise",
    summary: "Manage reusable email templates across the organization.",
    icon: Mail,
  },
}

export default function EnterpriseFeaturePage() {
  const location = useLocation()
  const { currentOrganizationId, currentOrganization } = useOrganizations()

  const feature =
    featureConfigByPath[location.pathname] ?? {
      title: "Enterprise feature",
      eyebrow: "Enterprise",
      summary: "This feature is available through enterprise access.",
      icon: Sparkles,
    }

  const Icon = feature.icon

  const handleContactSales = React.useCallback(() => {
    const subject = encodeURIComponent(`${feature.title} enterprise access`)
    const body = encodeURIComponent(
      `Hello Modura Team,

I would like to discuss enterprise access for ${feature.title}.

Organization: ${currentOrganization?.name || "Current organization"}
Organization ID: ${currentOrganizationId || "Not available"}

Thanks.`
    )

    window.location.href = `mailto:sales@moduragroup.com?subject=${subject}&body=${body}`
  }, [currentOrganization?.name, currentOrganizationId, feature.title])

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="secondary">{feature.eyebrow}</Badge>

            <div className="mt-4 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <Icon className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  {feature.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">{feature.summary}</p>
              </div>
            </div>
          </div>

          <Button className="rounded-2xl" onClick={handleContactSales}>
            Contact sales
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-slate-900">Enterprise access</div>
          <p className="mt-2 text-sm text-slate-600">
            This area is available as an enterprise feature. Contact sales to enable it for
            your organization.
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="text-sm text-slate-500">Organization</div>
          <div className="mt-2 text-base font-medium text-slate-900">
            {currentOrganization?.name || "Current organization"}
          </div>
          <div className="mt-4">
            <Link
              to="/settings/billing"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-slate-900"
            >
              View plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
