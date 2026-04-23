import { Link } from "react-router-dom"
import { ArrowRight, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"

const EmailIntegrationPage = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Mail className="h-5 w-5" />
          </div>

          <div>
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Email delivery
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Sender accounts have moved
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Email delivery is now managed from the sender accounts settings so organizations can keep shared delivery options in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Use sender accounts instead</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Open the sender accounts page to add or update the mailbox your team sends from, verify the connection, and choose the default sender for email flows.
        </p>

        <div className="mt-5">
          <Button asChild className="rounded-2xl">
            <Link to="/settings/email">
              Open sender accounts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EmailIntegrationPage
