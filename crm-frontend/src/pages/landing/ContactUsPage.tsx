import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Globe,
  Headphones,
  Mail,
  MessageSquare as MessageSquareMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type ContactFormValues = {
  companyName: string;
  website: string;
  fullName: string;
  workEmail: string;
  phoneNumber: string;
  teamSize: string;
  helpType: string;
  message: string;
};

const trustLogos = ["Klarna", "Meta", "Salesforce", "Disney", "T-Mobile"];

const benefits = [
  {
    icon: Sparkles,
    title: "Custom setup for your workflows",
    description:
      "We help you configure quotations, invoices, contracts, and templates around how your business already works.",
  },
  {
    icon: ShieldCheck,
    title: "Secure document delivery",
    description:
      "Plan email sending, WhatsApp sharing, secure access links, permissions, and customer-facing document experiences.",
  },
  {
    icon: Headphones,
    title: "Guided rollout for your team",
    description:
      "Get support with onboarding, company setup, roles, API planning, and the best subscription plan for your team.",
  },
];

const steps = ["Business details", "Needs and workflow", "Review and send"];

export default function ContactUsPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactFormValues>({
    defaultValues: {
      companyName: "",
      website: "",
      fullName: "",
      workEmail: "",
      phoneNumber: "",
      teamSize: "",
      helpType: "",
      message: "",
    },
    mode: "onTouched",
  });

  const stepFields = useMemo(
    () => [
      ["companyName", "website", "fullName", "workEmail"] as const,
      ["phoneNumber", "teamSize", "helpType", "message"] as const,
      [] as const,
    ],
    []
  );

  const nextStep = async () => {
    const fields = stepFields[step];
    if (!fields.length) return;
    const valid = await form.trigger(fields as any, { shouldFocus: true });
    if (valid) setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const previousStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = (values: ContactFormValues) => {
    console.log("Contact sales form submitted", values);
    setSubmitted(true);
  };

  const values = form.watch();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden border-b border-white/10 px-6 py-10 sm:px-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.16),transparent_30%)]" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-10 flex items-center gap-3 text-lg font-semibold tracking-tight text-white/95">
              <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm">modura</div>
            </div>

            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  <MessageSquareMore className="h-3.5 w-3.5" />
                  Talk to sales & setup your workspace
                </div>

                <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  Get expert help setting up your business documents and workflows.
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                  We help teams configure templates, document flows, sending channels, permissions,
                  and integrations so they can go live faster with less manual work.
                </p>
              </motion.div>

              <div className="mt-8 space-y-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * index, duration: 0.35 }}
                      className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                    >
                      <div className="mt-0.5 rounded-xl border border-white/10 bg-white/5 p-2">
                        <Icon className="h-5 w-5 text-white/85" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">{benefit.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-white/65">{benefit.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10">
              <p className="mb-5 text-sm text-white/50">Trusted by ambitious teams building modern operations</p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-2xl font-semibold tracking-tight text-white/80 sm:gap-x-10">
                {trustLogos.map((logo) => (
                  <span key={logo} className="text-white/75">
                    {logo}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mt-auto pt-10">
              <Card className="overflow-hidden rounded-[28px] border-white/10 bg-white text-zinc-950 shadow-2xl shadow-black/30">
                <CardContent className="p-0">
                  <div className="border-b border-zinc-100 px-5 py-4 text-sm text-zinc-500">
                    Setup preview
                  </div>
                  <div className="grid gap-5 p-5 sm:grid-cols-[220px_1fr]">
                    <div className="space-y-3 rounded-2xl bg-zinc-50 p-4">
                      {[
                        "Company profile",
                        "Document templates",
                        "Message templates",
                        "Permissions",
                        "API & integrations",
                      ].map((item, index) => (
                        <div
                          key={item}
                          className={`rounded-xl px-3 py-2 text-sm ${
                            index === 1 ? "bg-zinc-950 text-white" : "bg-white text-zinc-600"
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-zinc-100 bg-white p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Template setup</p>
                          <h3 className="mt-1 text-lg font-semibold text-zinc-950">Professional onboarding</h3>
                        </div>
                        <BadgeCheck className="h-5 w-5 text-zinc-900" />
                      </div>
                      <div className="space-y-3 text-sm text-zinc-600">
                        <div className="rounded-xl bg-zinc-50 p-3">Invoice branding and PDF layout</div>
                        <div className="rounded-xl bg-zinc-50 p-3">Quotation and contract templates</div>
                        <div className="rounded-xl bg-zinc-50 p-3">Email, link, and WhatsApp sending setup</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="flex items-center bg-zinc-50 px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
            >
              <div className="mb-6">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-400">Talk to sales</p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
                  Tell us about your team.
                </h2>
                <p className="mt-3 text-base leading-7 text-zinc-500">
                  We’ll help you choose the right plan, configure your templates, and discuss the
                  best setup for your workflow.
                </p>
              </div>

              <div className="mb-8 flex items-center gap-4">
                {steps.map((label, index) => (
                  <React.Fragment key={label}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium ${
                          index <= step
                            ? "border-zinc-950 bg-zinc-950 text-white"
                            : "border-zinc-300 bg-white text-zinc-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className={`hidden text-sm sm:block ${index <= step ? "text-zinc-950" : "text-zinc-400"}`}>
                        {label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 flex-1 rounded-full ${index < step ? "bg-zinc-950" : "bg-zinc-200"}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <Card className="rounded-[28px] border-zinc-200 bg-white shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  {submitted ? (
                    <div className="space-y-4 py-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                        <BadgeCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-zinc-950">Thanks — we’ve got your request.</h3>
                        <p className="mt-3 max-w-lg text-base leading-7 text-zinc-500">
                          Our team will review your setup needs and reach out to help you with templates,
                          onboarding, and the best plan for your business.
                        </p>
                      </div>
                      <Button
                        className="mt-2 rounded-full bg-zinc-950 px-5 text-white hover:bg-zinc-800"
                        onClick={() => {
                          setSubmitted(false);
                          setStep(0);
                          form.reset();
                        }}
                      >
                        Submit another request
                      </Button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {step === 0 && (
                          <div className="space-y-5">
                            <FormField
                              control={form.control}
                              name="companyName"
                              rules={{ required: "Company name is required." }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                      <Input className="h-12 rounded-2xl pl-10" placeholder="Acme Inc." {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company website</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                      <Input className="h-12 rounded-2xl pl-10" placeholder="https://yourcompany.com" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormDescription>Optional, but helpful for understanding your business.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="fullName"
                              rules={{ required: "Your name is required." }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Your full name</FormLabel>
                                  <FormControl>
                                    <Input className="h-12 rounded-2xl" placeholder="Jane Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="workEmail"
                              rules={{
                                required: "Business email is required.",
                                pattern: {
                                  value: /^\S+@\S+\.\S+$/,
                                  message: "Enter a valid email address.",
                                },
                              }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Business email</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                      <Input className="h-12 rounded-2xl pl-10" placeholder="team@company.com" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        {step === 1 && (
                          <div className="space-y-5">
                            <FormField
                              control={form.control}
                              name="phoneNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone number</FormLabel>
                                  <FormControl>
                                    <Input className="h-12 rounded-2xl" placeholder="+90 555 555 55 55" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="teamSize"
                              rules={{ required: "Please tell us your team size." }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Team size</FormLabel>
                                  <FormControl>
                                    <Input className="h-12 rounded-2xl" placeholder="e.g. 5-10 people" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="helpType"
                              rules={{ required: "Please tell us what you need help with." }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>What do you need help with?</FormLabel>
                                  <FormControl>
                                    <Input
                                      className="h-12 rounded-2xl"
                                      placeholder="Template setup, onboarding, API integration, pricing..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="message"
                              rules={{ required: "Tell us a bit about your workflow." }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tell us about your workflow</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      className="min-h-[140px] rounded-2xl"
                                      placeholder="Describe how your team creates documents, sends them, and what you'd like us to help set up."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Include the types of documents you use and any setup help you want from us.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        {step === 2 && (
                          <div className="space-y-5">
                            <div>
                              <h3 className="text-xl font-semibold text-zinc-950">Review your request</h3>
                              <p className="mt-2 text-sm leading-6 text-zinc-500">
                                Make sure everything looks right before sending it to our sales team.
                              </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              {[
                                { label: "Company", value: values.companyName || "—" },
                                { label: "Website", value: values.website || "—" },
                                { label: "Full name", value: values.fullName || "—" },
                                { label: "Business email", value: values.workEmail || "—" },
                                { label: "Phone number", value: values.phoneNumber || "—" },
                                { label: "Team size", value: values.teamSize || "—" },
                                { label: "Needs", value: values.helpType || "—" },
                              ].map((item) => (
                                <div key={item.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{item.label}</p>
                                  <p className="mt-2 text-sm font-medium text-zinc-900">{item.value}</p>
                                </div>
                              ))}
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Workflow details</p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                                {values.message || "—"}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            {step > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={previousStep}
                                className="rounded-full px-5"
                              >
                                Back
                              </Button>
                            )}
                          </div>

                          <div className="flex gap-3">
                            {step < steps.length - 1 ? (
                              <Button
                                type="button"
                                onClick={nextStep}
                                className="rounded-full bg-zinc-950 px-5 text-white hover:bg-zinc-800"
                              >
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                type="submit"
                                className="rounded-full bg-zinc-950 px-5 text-white hover:bg-zinc-800"
                              >
                                Talk to sales
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
