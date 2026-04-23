import * as React from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Globe,
  Shield,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  coreFeatures,
  differentiators,
  futureReady,
  heroStats,
  insights,
  plans,
  quickHighlights,
  workflowSteps,
} from "./landing-data"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function SectionHeader({
  badge,
  title,
  description,
}: {
  badge?: string
  title: string
  description?: string
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {badge ? (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          {badge}
        </div>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-base text-muted-foreground md:text-lg">{description}</p>
      ) : null}
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  bullets,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  bullets: string[]
}) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>

      <div className="mt-5 space-y-3">
        {bullets.map((item) => (
          <div key={item} className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <span className="text-foreground/90">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WorkflowCard({
  title,
  description,
  icon: Icon,
  index,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  index: number
}) {
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step {index}
        </span>
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

function MiniCard({
  title,
  icon: Icon,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
    </div>
  )
}

function PlanCard({
  name,
  price,
  priceTry,
  accent,
  highlighted,
  cta,
  ctaHref,
  features,
}: {
  name: string
  price: string
  priceTry: string
  accent: string
  highlighted: boolean
  cta: string
  ctaHref: string
  features: string[]
}) {
  const isExternal = ctaHref.startsWith("mailto:")

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border p-6 shadow-sm",
        accent,
        highlighted && "ring-2 ring-blue-500"
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
            <Sparkles className="h-3 w-3" />
            Most popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="mt-1 text-2xl font-bold tracking-tight">{price}</p>
        {priceTry !== price ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{priceTry}</p>
        ) : null}
      </div>

      <div className="flex-1 space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        {isExternal ? (
          <a
            href={ctaHref}
            className={cn(
              "flex w-full items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition",
              highlighted
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border border-input bg-background hover:bg-accent"
            )}
          >
            {cta}
          </a>
        ) : (
          <Link
            to={ctaHref}
            className={cn(
              "flex w-full items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition",
              highlighted
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border border-input bg-background hover:bg-accent"
            )}
          >
            {cta}
          </Link>
        )}
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 -z-10 overflow-hidden">
        <div className="mx-auto h-[420px] max-w-7xl bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),radial-gradient(circle_at_center,rgba(16,185,129,0.10),transparent_28%)]" />
      </div>

      <main className="pt-16">
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-14 md:px-6 md:pb-28 md:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <Shield className="h-3.5 w-3.5" />
                Professional documents for growing teams
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                Beinpark keeps your sales documents
                <span className="text-primary"> clear, consistent, and ready to send.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Create quotations, proformas, invoices, receipts, and delivery notes in one
                workspace. Keep customers, products, templates, PDFs, email sending, and team
                activity organized without the overhead of a heavy ERP.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-2xl">
                  <Link to="/signup">
                    Start free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild size="lg" variant="outline" className="rounded-2xl">
                  <Link to="/login">Open the app</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {heroStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border bg-card p-4 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-tight">{item.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.hint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[32px] border bg-card p-4 shadow-xl">
                <div className="rounded-[28px] border bg-muted/40 p-4">
                  <div className="mb-4 flex items-center justify-between rounded-2xl bg-background p-4 shadow-sm">
                    <div>
                      <p className="text-sm font-medium">Sales workspace</p>
                      <p className="text-xs text-muted-foreground">
                        Documents, templates, email sending, and activity in one place
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Globe className="h-3.5 w-3.5" />
                      Organization-scoped
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-background p-4 shadow-sm sm:col-span-2">
                      <p className="text-sm font-medium">Core documents</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-5">
                        {quickHighlights.map((item) => {
                          const Icon = item.icon
                          return (
                            <div
                              key={item.title}
                              className="rounded-2xl border bg-card p-4 text-center shadow-sm"
                            >
                              <div
                                className={cn(
                                  "mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white",
                                  item.color
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <p className="text-xs font-medium">{item.title}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-background p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium">Operations</p>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-xl bg-muted/60 p-3">
                          <p className="text-xs text-muted-foreground">Recent activity</p>
                          <p className="mt-1 text-xl font-semibold">Create, send, convert</p>
                        </div>
                        <div className="rounded-xl bg-muted/60 p-3">
                          <p className="text-xs text-muted-foreground">Dashboards</p>
                          <p className="mt-1 text-xl font-semibold text-slate-900">
                            Workspace and sales views
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-background p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium">Delivery</p>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                          <span>Generated PDFs</span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                          <span>Email sender accounts</span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                          <span>Template fallback</span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border bg-background px-4 py-3 shadow-lg md:block">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Professional documents</p>
                    <p className="text-xs text-muted-foreground">
                      Generated, named, and ready to send
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 top-8 hidden rounded-2xl border bg-background px-4 py-3 shadow-lg xl:block">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dashboards built in</p>
                    <p className="text-xs text-muted-foreground">
                      Workspace health and sales visibility
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y bg-muted/30 py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeader
              badge="Core platform"
              title="A sales document workspace that stays practical"
              description="Beinpark helps teams create business documents, generate polished PDFs, send them through the app, and keep the surrounding workflow organized."
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {coreFeatures.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeader
              badge="Workflow"
              title="Built around the way businesses actually work"
              description="Move from document creation to email delivery, conversion, and status follow-up without juggling separate tools."
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {workflowSteps.map((step, index) => (
                <WorkflowCard
                  key={step.title}
                  index={index + 1}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="insights" className="bg-muted/30 py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeader
              badge="Visibility"
              title="Dashboards that support the work already happening"
              description="See recent quotations, open attention items, usage, subscription details, and sales progress from inside the app."
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Built-in dashboard experience</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Workspace and sales dashboards help teams keep an eye on activity,
                      documents in motion, and account readiness.
                    </p>
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {insights.map((item) => (
                    <MiniCard key={item.title} title={item.title} icon={item.icon} />
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border bg-muted/40 p-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-background p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Open quotations
                      </p>
                      <p className="mt-2 text-2xl font-semibold">Draft and sent</p>
                    </div>
                    <div className="rounded-2xl bg-background p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Workspace health
                      </p>
                      <p className="mt-2 text-2xl font-semibold">Usage and plan visibility</p>
                    </div>
                    <div className="rounded-2xl bg-background p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Sales follow-up
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-amber-600">
                        Invoices and receipts
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-semibold">Inside the workspace</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  The current app already covers the parts teams reach for most often:
                  document setup, templates, sender accounts, billing, and organization
                  settings.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {futureReady.map((item) => (
                    <div key={item.title} className="rounded-2xl border bg-muted/30 p-4">
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-sm">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeader
              badge="Why this product"
              title="Simple enough for SMEs, strong enough for growing teams"
              description="The app is designed to remove document chaos without turning day-to-day work into an enterprise project."
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {differentiators.map((item) => (
                <div key={item.title} className="rounded-3xl border bg-card p-6 shadow-sm">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-muted/30 py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <SectionHeader
              badge="Plans"
              title="Simple, transparent pricing"
              description="Start free and upgrade when your workspace needs more volume, users, or sending capacity."
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard key={plan.name} {...plan} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="rounded-[32px] border bg-card p-8 text-center shadow-sm md:p-12">
              <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-7 w-7" />
              </div>

              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Create, send, and manage customer documents in one place
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Start with quotations, invoices, templates, and sender accounts today, then
                run the rest of the workflow from the same calm workspace.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-2xl">
                  <Link to="/signup">
                    Start free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild size="lg" variant="outline" className="rounded-2xl">
                  <Link to="/login">
                    Open the app
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
