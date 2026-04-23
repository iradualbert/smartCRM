import Logo from "@/components/Logo"
import { BadgeCheck, Building2, FileText, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

type FormWrapperProps = {
  title: string
  description?: string
  children: React.ReactNode
}

const highlights = [
  {
    icon: <FileText className="h-4 w-4" />,
    title: "Professional documents",
    text: "Create quotations, invoices, proformas, receipts, and delivery notes in one flow.",
  },
  {
    icon: <Building2 className="h-4 w-4" />,
    title: "Built for teams",
    text: "Manage organizations, sender accounts, customers, and templates without heavy setup.",
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Ready for real work",
    text: "Stay organized with clear workflows, guarded access, and polished client-facing output.",
  },
]

const FormWrapper = ({ title, description, children }: FormWrapperProps) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="hidden border-r border-slate-200 bg-white lg:flex">
          <div className="flex w-full flex-col justify-between p-10 xl:p-14">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <Logo className="h-10 w-auto" />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-tight text-slate-900">
                    Beinpark
                  </div>
                  <div className="text-xs text-slate-500">
                    Client workflow platform
                  </div>
                </div>
              </Link>

              <div className="mt-10 inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                Calm, professional workflow
              </div>

              <div className="mt-8 max-w-xl">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 xl:text-5xl">
                  Manage customer documents without the clutter.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                  Keep quotations, invoices, teams, and follow-up work moving in one steady workspace.
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                        {item.icon}
                      </div>
                      {item.title}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <BadgeCheck className="h-4 w-4 text-teal-700" />
                Ready for daily use
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Sign in and continue working, or create an account and start issuing documents right away.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-6 flex justify-center lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <Logo className="h-9 w-auto" />
                <div className="text-left">
                  <div className="text-sm font-semibold tracking-tight text-slate-900">
                    Beinpark
                  </div>
                  <div className="text-xs text-slate-500">Client workflow platform</div>
                </div>
              </Link>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.18)] sm:p-8">
              <div className="mb-8">
                <div className="mb-5 hidden lg:flex">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <Logo className="h-10 w-auto" />
                  </div>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  {title}
                </h1>

                {description ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                ) : null}
              </div>

              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default FormWrapper
