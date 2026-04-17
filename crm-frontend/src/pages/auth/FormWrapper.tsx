import Logo from "@/components/Logo"
import { BadgeCheck, Layers3, Sparkles, Zap } from "lucide-react"

type FormWrapperProps = {
  title: string
  description?: string
  children: React.ReactNode
}

const featureCards = [
  {
    icon: <Layers3 className="h-4 w-4" />,
    title: "Less clutter",
    text: "A cleaner workspace for quotations, invoices, and customer operations.",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    title: "Move faster",
    text: "Create documents, manage teams, and stay organized without heavy setup.",
  },
  {
    icon: <BadgeCheck className="h-4 w-4" />,
    title: "Built for real work",
    text: "Professional outputs and focused workflows for modern client-facing teams.",
  },
]

const FormWrapper = ({
  title,
  description,
  children,
}: FormWrapperProps) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <aside className="relative hidden overflow-hidden border-r border-slate-200 bg-[linear-gradient(180deg,#f8fffd_0%,#f8fafc_100%)] lg:flex">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-[-70px] top-[-30px] h-72 w-72 rounded-full bg-teal-100 blur-3xl" />
            <div className="absolute right-[-60px] top-[20%] h-80 w-80 rounded-full bg-indigo-100 blur-3xl" />
            <div className="absolute bottom-[-80px] left-[20%] h-72 w-72 rounded-full bg-cyan-50 blur-3xl" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <div>
              <div className="inline-flex items-center rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-xs font-medium text-teal-700 backdrop-blur">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Lighter by design
              </div>

              <div className="mt-8 max-w-xl">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 xl:text-5xl">
                  Quotations and Invoices — without the clutter.
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                  A calmer workspace for managing organizations, customers,
                  quotations, invoices, and team operations in one clean flow.
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                {featureCards.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                        {item.icon}
                      </div>
                      {item.title}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <div className="text-2xl font-semibold text-slate-900">Clean</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  workspace
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <div className="text-2xl font-semibold text-slate-900">Fast</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  setup
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <div className="text-2xl font-semibold text-slate-900">Ready</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  for teams
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.18)] sm:p-8">
              <div className="mb-8">
                <div className="mb-5 flex justify-center lg:justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <Logo />
                  </div>
                </div>

                <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900 lg:text-left">
                  {title}
                </h1>

                {description ? (
                  <p className="mt-2 text-center text-sm leading-6 text-slate-600 lg:text-left">
                    {description}
                  </p>
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