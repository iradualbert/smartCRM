import * as React from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  FileText,
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
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          {description}
        </p>
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
  accent,
  features,
}: {
  name: string
  price: string
  accent: string
  features: string[]
}) {
  return (
    <div className={cn("rounded-3xl border p-6 shadow-sm", accent)}>
      <div className="mb-4">
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{price}</p>
      </div>

      <div className="space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <span>{feature}</span>
          </div>
        ))}
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

      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Favelast</div>
              <div className="text-xs text-muted-foreground">Business workflow platform</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#workflow" className="transition hover:text-foreground">Workflow</a>
            <a href="#insights" className="transition hover:text-foreground">Insights</a>
            <a href="#pricing" className="transition hover:text-foreground">Plans</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/sales">Open App</Link>
            </Button>
            <Button asChild>
              <Link to="/companies/new">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-14 md:px-6 md:pb-28 md:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <Shield className="h-3.5 w-3.5" />
                Create, send, track, and get paid
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                From quotation to payment —
                <span className="text-primary"> faster, clearer, and all in one place.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                A modern business workflow platform for SMEs to create professional documents,
                share them instantly, track payments, collaborate across companies, and manage
                operations from one simple interface.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-2xl">
                  <Link to="/sales">
                    Open Sales Workspace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild size="lg" variant="outline" className="rounded-2xl">
                  <Link to="/quotations/new">Create Your First Quotation</Link>
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
                        Documents, communication, and payment visibility
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Globe className="h-3.5 w-3.5" />
                      Multi-company ready
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
                        <p className="text-sm font-medium">Payments</p>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-xl bg-muted/60 p-3">
                          <p className="text-xs text-muted-foreground">Outstanding</p>
                          <p className="mt-1 text-xl font-semibold">$12,480</p>
                        </div>
                        <div className="rounded-xl bg-muted/60 p-3">
                          <p className="text-xs text-muted-foreground">Overdue</p>
                          <p className="mt-1 text-xl font-semibold text-amber-600">8 invoices</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-background p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium">Sharing</p>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                          <span>Email delivery</span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                          <span>Secure links</span>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3">
                          <span>WhatsApp sharing</span>
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
                    <p className="text-xs text-muted-foreground">Generated and ready to share</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 top-8 hidden rounded-2xl border bg-background px-4 py-3 shadow-lg xl:block">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dashboard & insights</p>
                    <p className="text-xs text-muted-foreground">Planned and expanding</p>
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
              title="A business operations hub, not just an invoicing tool"
              description="The product summary frames this as a workflow and communication platform: create documents, send them instantly, track payments, centralize operations, and support multiple companies and teams."
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
              description="Move from document creation to sending, payment follow-up, and team collaboration without jumping between disconnected tools."
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
              badge="Insights"
              title="Dashboards and business visibility, designed to grow with the product"
              description="Your summary highlights planned dashboard and insights features around revenue overview, unpaid invoices, overdue tracking, customer insights, and business performance."
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Planned dashboard experience</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Revenue, receivables, overdue trends, customer activity, and operational health in one place.
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
                        Outstanding
                      </p>
                      <p className="mt-2 text-2xl font-semibold">$18,420</p>
                    </div>
                    <div className="rounded-2xl bg-background p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Paid this month
                      </p>
                      <p className="mt-2 text-2xl font-semibold">$42,800</p>
                    </div>
                    <div className="rounded-2xl bg-background p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Overdue
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-amber-600">12 docs</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border bg-card p-6 shadow-sm">
                <h3 className="text-xl font-semibold">Future-ready features</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  The roadmap already points toward recurring invoices, payment integrations, notifications, logs, portals, and expansion into purchases and expenses.
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
              description="The positioning in your summary is clear: this should avoid ERP complexity while still solving real document, payment, and communication pain points."
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
              title="A pricing structure that grows with the business"
              description="Your product summary outlines a path from free access into Starter, Growth, and Pro plans with sending, sharing, dashboards, automation, and integrations."
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
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
                Create, send, and get paid — all in one place
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Start with quotations today, expand into secure sharing, payment tracking,
                dashboards, and multi-company collaboration as the platform grows.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-2xl">
                  <Link to="/companies/new">
                    Start with your company
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild size="lg" variant="outline" className="rounded-2xl">
                  <Link to="/sales">
                    Explore the sales workspace
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