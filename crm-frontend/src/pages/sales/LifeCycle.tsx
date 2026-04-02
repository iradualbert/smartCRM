import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Receipt,
  Truck,
  Mail,
  BellRing,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stages = [
  {
    title: "Quotation",
    icon: FileText,
    subtitle: "Create and send a polished quote",
    color: "from-sky-500/20 to-cyan-500/10",
    bullets: [
      "Build quotation from products or custom items",
      "Generate branded PDF instantly",
      "Email quote directly to customer",
    ],
    meta: ["Draft", "PDF", "Email"],
  },
  {
    title: "Proforma",
    icon: FileSpreadsheet,
    subtitle: "Turn approved quotes into a payment-ready document",
    color: "from-violet-500/20 to-fuchsia-500/10",
    bullets: [
      "Convert quotation into proforma",
      "Track status and totals automatically",
      "Resend updated version when needed",
    ],
    meta: ["Converted", "Tracked", "Sent"],
  },
  {
    title: "Invoice",
    icon: Receipt,
    subtitle: "Issue final invoice and follow payment status",
    color: "from-amber-500/20 to-orange-500/10",
    bullets: [
      "Create invoice from proforma",
      "Monitor sent, paid, overdue states",
      "Keep PDF history ready for sharing",
    ],
    meta: ["Issued", "Paid", "Overdue"],
  },
  {
    title: "Delivery Note",
    icon: Truck,
    subtitle: "Close the loop when goods leave and arrive",
    color: "from-emerald-500/20 to-teal-500/10",
    bullets: [
      "Generate delivery note from invoice",
      "Record dispatch and delivery milestones",
      "Share delivery PDF with the customer",
    ],
    meta: ["Dispatched", "Delivered", "Archived"],
  },
];

const emailFlow = [
  {
    title: "Send",
    desc: "Every key document can be emailed as a professional PDF.",
    icon: Mail,
  },
  {
    title: "Track",
    desc: "See where each customer sits in the workflow and what was shared.",
    icon: BellRing,
  },
  {
    title: "Follow up",
    desc: "Trigger reminders for pending quotes, invoices, and delivery actions.",
    icon: Clock3,
  },
];

export default function SalesWorkflowLifecycle() {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-2xl md:p-12"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.16),transparent_30%)]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <Badge className="mb-4 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">
                <Sparkles className="mr-2 h-4 w-4" />
                End-to-end sales document lifecycle
              </Badge>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                From <span className="text-cyan-300">Quotation</span> to <span className="text-emerald-300">Delivery</span>, in one clean flow.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Showcase how your app moves a customer journey from first quote to final delivery note,
                with PDF generation, email sending, and status tracking built into every step.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="rounded-2xl px-6">Explore Workflow</Button>
                <Button variant="outline" className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10">
                  View Document Flow
                </Button>
              </div>
            </div>

            <Card className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  What teams get
                </CardTitle>
                <CardDescription className="text-slate-300">
                  A visual, trackable workflow that reduces manual back-and-forth.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-200">
                {[
                  "Create documents faster with connected stages",
                  "Generate PDFs and email them from the same workflow",
                  "Track what was sent, approved, invoiced, and delivered",
                  "Give ops, finance, and sales one shared view",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold md:text-3xl">Lifecycle workflow</h2>
              <p className="mt-2 text-slate-400">Each stage feeds the next and keeps customer communication visible.</p>
            </div>
            <Badge variant="secondary" className="rounded-full bg-white/10 px-4 py-1 text-slate-200">
              Visual workflow
            </Badge>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="relative"
                >
                  <Card className={`h-full rounded-3xl border border-white/10 bg-gradient-to-br ${stage.color} shadow-xl backdrop-blur-xl`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <Badge className="rounded-full bg-black/20 text-white">0{index + 1}</Badge>
                      </div>
                      <CardTitle className="pt-3 text-white">{stage.title}</CardTitle>
                      <CardDescription className="text-slate-100/85">{stage.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stage.bullets.map((bullet) => (
                          <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/15 p-3 text-sm text-slate-100">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {stage.meta.map((item) => (
                          <Badge key={item} variant="secondary" className="rounded-full bg-white/15 text-white">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {index < stages.length - 1 && (
                    <div className="pointer-events-none absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-900 shadow-lg">
                        <ArrowRight className="h-5 w-5 text-cyan-300" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-3xl border border-white/10 bg-slate-900/70 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Email + tracking layer</CardTitle>
              <CardDescription className="text-slate-400">
                Documents do not stop at PDF generation. They move, notify, and get followed through.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailFlow.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 + index * 0.08 }}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10">
                      <Icon className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">Workflow snapshot</CardTitle>
              <CardDescription className="text-slate-400">
                A quick way to explain the business process to customers or investors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Quote created", status: "Completed" },
                  { label: "Quote emailed", status: "Opened" },
                  { label: "Converted to proforma", status: "Completed" },
                  { label: "Invoice issued", status: "Pending payment" },
                  { label: "Delivery note generated", status: "Ready to dispatch" },
                ].map((step, idx) => (
                  <div key={step.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
                        {idx + 1}
                      </div>
                      <span className="text-sm text-slate-100">{step.label}</span>
                    </div>
                    <Badge className="rounded-full bg-emerald-400/15 text-emerald-200">
                      {step.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
