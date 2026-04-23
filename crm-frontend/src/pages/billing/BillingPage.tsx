import * as React from "react"
import { Check, CreditCard, Mail, Rocket, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

import { getBillingOverview, listPlans, type BillingOverview, type BillingPlan } from "./api"
import { getApiErrorMessage } from "./errors"

function featureRows(plan: BillingPlan) {
  return [
    `${plan.max_users} user${plan.max_users > 1 ? "s" : ""}`,
    `${plan.max_organizations} organization${plan.max_organizations > 1 ? "s" : ""}`,
    plan.max_documents_per_month === null
      ? "Unlimited documents"
      : `${plan.max_documents_per_month} documents each month`,
    plan.max_emails_per_month === null
      ? "Unlimited emails"
      : `${plan.max_emails_per_month} emails each month`,
    plan.max_storage_mb === null ? "Unlimited storage" : `${plan.max_storage_mb} MB storage`,
    plan.allow_pdf_generation ? "PDF generation" : null,
    plan.allow_email_sending ? "Email sending" : null,
    plan.allow_custom_templates ? "Custom templates" : null,
    plan.allow_catalog_management ? "Catalog management" : null,
    plan.allow_branding_removal ? "Branding removal" : null,
  ].filter(Boolean) as string[]
}

function formatPlanPrice(plan: BillingPlan) {
  if (plan.is_contact_only) return "Custom pricing"
  return `$${plan.price_usd}/month`
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set"
  return new Date(value).toLocaleDateString()
}

function getTrialBanner(overview: BillingOverview | null) {
  const subscription = overview?.subscription
  if (!subscription) return null

  if (subscription.is_trial) {
    const daysRemaining = subscription.trial_days_remaining ?? 0
    return {
      tone: "teal" as const,
      title:
        daysRemaining > 0
          ? `Business plan trial - ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`
          : "Business plan trial",
      body: daysRemaining > 0 ? "Full Business access is active." : "Trial access is still active today.",
    }
  }

  if (subscription.plan.code === "free") {
    return {
      tone: "amber" as const,
      title: "Your organization is on the Free plan",
      body: "Business upgrades are coming soon.",
    }
  }

  return {
    tone: "slate" as const,
    title: `${subscription.plan.name} is active`,
    body: "Plan limits are shown below.",
  }
}

function UsageCard({
  icon,
  label,
  value,
  limit,
}: {
  icon: React.ReactNode
  label: string
  value: number
  limit: number | null | undefined
}) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
          {icon}
        </div>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
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

  const handleContactSales = () => {
    const subject = encodeURIComponent("Business plan question")
    const body = encodeURIComponent(
      `Hello Modura Team,

I would like to talk about Business plan access for my organization.

Organization ID: ${currentOrganizationId}

Thanks.`
    )

    const link = document.createElement("a")
    link.href = `mailto:sales@moduragroup.com?subject=${subject}&body=${body}`
    link.click()
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

  const trialBanner = getTrialBanner(overview)
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
                <p className="mt-2 max-w-2xl text-sm text-slate-600">Plan, usage, and trial status.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No payment setup required.
          </div>
        </div>
      </div>

      {trialBanner ? (
        <div
          className={
            trialBanner.tone === "teal"
              ? "rounded-3xl border border-teal-200 bg-teal-50 p-5"
              : trialBanner.tone === "amber"
              ? "rounded-3xl border border-amber-200 bg-amber-50 p-5"
              : "rounded-3xl border border-slate-200 bg-slate-50 p-5"
          }
        >
          <div className="flex items-start gap-3">
            <div
              className={
                trialBanner.tone === "teal"
                  ? "mt-0.5 rounded-2xl bg-white/80 p-2 text-teal-700"
                  : trialBanner.tone === "amber"
                  ? "mt-0.5 rounded-2xl bg-white/80 p-2 text-amber-700"
                  : "mt-0.5 rounded-2xl bg-white/80 p-2 text-slate-700"
              }
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900">{trialBanner.title}</div>
              <p className="mt-1 text-sm text-slate-600">{trialBanner.body}</p>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {overview ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Current plan</div>
              <div className="mt-2 text-xl font-semibold text-slate-900">
                {overview.subscription.plan.name}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className="capitalize">{overview.subscription.status}</Badge>
                {overview.subscription.is_trial ? <Badge variant="secondary">Trial</Badge> : null}
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {overview.subscription.is_trial
                  ? `Trial started ${formatDate(overview.subscription.trial_started_at)}`
                  : `Current cycle started ${formatDate(overview.subscription.current_period_start)}`}
              </p>
            </div>

            <UsageCard
              icon={<Rocket className="h-4 w-4" />}
              label="Documents this month"
              value={overview.usage.documents_created}
              limit={overview.subscription.plan.max_documents_per_month}
            />

            <UsageCard
              icon={<Mail className="h-4 w-4" />}
              label="Emails this month"
              value={overview.usage.emails_sent}
              limit={overview.subscription.plan.max_emails_per_month}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">
                {overview.subscription.is_trial ? "Trial period" : "Current billing cycle"}
              </div>
              <div className="mt-2 text-sm text-slate-700">
                {formatDate(overview.subscription.current_period_start)} -{" "}
                {formatDate(overview.subscription.current_period_end)}
              </div>
              {overview.subscription.is_trial && overview.subscription.trial_ends_at ? (
                <p className="mt-3 text-sm text-slate-500">
                  Ends {formatDate(overview.subscription.trial_ends_at)}
                </p>
              ) : null}
            </div>

            <div className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Storage this month</div>
              <div className="mt-2 text-xl font-semibold text-slate-900">
                {overview.usage.storage_mb} MB
                {overview.subscription.plan.max_storage_mb !== null
                  ? ` / ${overview.subscription.plan.max_storage_mb} MB`
                  : ""}
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlanCode === plan.code
          const isFree = plan.code === "free"
          const isContact = plan.is_contact_only

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
                    {formatPlanPrice(plan)}
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

              <div className="mt-6 space-y-3">
                <Button
                  className="w-full rounded-2xl"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || isFree}
                  onClick={() => {
                    if (isContact) {
                      handleContactSales()
                    }
                  }}
                >
                  {isCurrent
                    ? overview?.subscription.is_trial
                      ? "Current trial"
                      : "Current plan"
                    : isFree
                    ? "Applied automatically"
                    : isContact
                    ? "Contact sales"
                    : "Upgrade (coming soon)"}
                </Button>
                {isFree ? (
                  <p className="text-sm text-slate-500">Applied automatically after trial.</p>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
