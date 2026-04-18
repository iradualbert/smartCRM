import * as React from "react"
import { Check, CreditCard, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

import {
  getBillingOverview,
  listPlans,
  startCheckout,
  type BillingOverview,
  type BillingPlan,
} from "./api"
import { getApiErrorMessage } from "./errors"

function formatPrice(plan: BillingPlan, currency: "TRY" | "USD") {
  if (currency === "USD") {
    return `$${plan.price_usd}/month`
  }

  return `₺${plan.price_try}/month`
}

function featureRows(plan: BillingPlan) {
  return [
    `${plan.max_users} user${plan.max_users > 1 ? "s" : ""}`,
    `${plan.max_organizations} organization${plan.max_organizations > 1 ? "s" : ""}`,
    plan.max_documents_per_month === null
      ? "Unlimited documents"
      : `${plan.max_documents_per_month} documents / month`,
    plan.max_emails_per_month === null
      ? "Unlimited emails"
      : `${plan.max_emails_per_month} emails / month`,
    plan.max_storage_mb === null
      ? "Unlimited storage"
      : `${plan.max_storage_mb} MB storage`,
    plan.allow_pdf_generation ? "PDF generation" : null,
    plan.allow_email_sending ? "Email sending" : null,
    plan.allow_custom_templates ? "Custom templates" : null,
    plan.allow_ai_quote_extraction ? "AI quote extraction" : null,
    plan.allow_catalog_management ? "Catalog management" : null,
    plan.allow_branding_removal ? "Branding removal" : null,
  ].filter(Boolean) as string[]
}

function UsageCard({
  label,
  value,
  limit,
}: {
  label: string
  value: number
  limit: number | null | undefined
}) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-slate-900">
        {value}
        {limit !== null && limit !== undefined ? ` / ${limit}` : ""}
      </div>
    </div>
  )
}

export default function BillingPage() {
  const { currentOrganizationId } = useOrganizations()

  const [plans, setPlans] = React.useState<BillingPlan[]>([])
  const [overview, setOverview] = React.useState<BillingOverview | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [busyPlanCode, setBusyPlanCode] = React.useState<string | null>(null)
  const [currency, setCurrency] = React.useState<"TRY" | "USD">("TRY")
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!currentOrganizationId) return

    try {
      setLoading(true)
      setError(null)

      const [plansData, overviewData] = await Promise.all([
        listPlans(),
        getBillingOverview(currentOrganizationId),
      ])

      setPlans(plansData)
      setOverview(overviewData)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [currentOrganizationId])

  React.useEffect(() => {
    load().catch(console.error)
  }, [load])

  const handleChoosePlan = async (plan: BillingPlan) => {
    if (!currentOrganizationId) return

    try {
      setBusyPlanCode(plan.code)
      setError(null)

      const result = await startCheckout({
        company: currentOrganizationId,
        plan_code: plan.code,
        currency,
      })

      if (result?.payment_url) {
        window.location.href = result.payment_url
        return
      }

      setError("No payment URL returned from billing checkout.")
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusyPlanCode(null)
    }
  }

  if (!currentOrganizationId) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-3xl border bg-white p-8 text-sm text-rose-700 shadow-sm">
          No current organization selected.
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-3xl border bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading billing...
        </div>
      </div>
    )
  }

  const currentPlanCode = overview?.subscription?.plan?.code

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              Billing
            </div>

            <div className="mt-4 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <CreditCard className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Organization billing
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Manage the current organization’s subscription, limits, and monthly usage.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={currency === "TRY" ? "default" : "outline"}
              className="rounded-2xl"
              onClick={() => setCurrency("TRY")}
            >
              ₺ TRY
            </Button>
            <Button
              variant={currency === "USD" ? "default" : "outline"}
              className="rounded-2xl"
              onClick={() => setCurrency("USD")}
            >
              $ USD
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {overview ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Current plan</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">
              {overview.subscription.plan.name}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="capitalize">{overview.subscription.status}</Badge>
              <Badge variant="secondary">{overview.subscription.billing_currency}</Badge>
            </div>
          </div>

          <UsageCard
            label="Documents this month"
            value={overview.usage.documents_created}
            limit={overview.subscription.plan.max_documents_per_month}
          />

          <UsageCard
            label="Emails this month"
            value={overview.usage.emails_sent}
            limit={overview.subscription.plan.max_emails_per_month}
          />
        </div>
      ) : null}

      {overview ? (
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Current billing cycle</div>
          <div className="mt-2 text-sm text-slate-700">
            {new Date(overview.subscription.current_period_start).toLocaleDateString()} —{" "}
            {new Date(overview.subscription.current_period_end).toLocaleDateString()}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlanCode === plan.code

          return (
            <div
              key={plan.id}
              className={`rounded-3xl border bg-white p-6 shadow-sm ${
                isCurrent ? "border-slate-900 ring-1 ring-slate-900" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{plan.name}</div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                    {formatPrice(plan, currency)}
                  </div>
                </div>

                {isCurrent ? (
                  <Badge>
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Current
                  </Badge>
                ) : null}
              </div>

              <div className="mt-6 space-y-3">
                {featureRows(plan).map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button
                  className="w-full rounded-2xl"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || busyPlanCode === plan.code}
                  onClick={() => handleChoosePlan(plan)}
                >
                  {busyPlanCode === plan.code
                    ? "Redirecting..."
                    : isCurrent
                    ? "Current plan"
                    : `Choose ${plan.name}`}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}