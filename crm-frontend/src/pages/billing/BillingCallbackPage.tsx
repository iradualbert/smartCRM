import * as React from "react"
import { useNavigate } from "react-router-dom"

export default function BillingCallbackPage() {
  const navigate = useNavigate()

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      navigate("/settings/billing")
    }, 1500)

    return () => window.clearTimeout(timeout)
  }, [navigate])

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Processing payment...</h1>
        <p className="mt-2 text-sm text-slate-600">
          We’re confirming your billing update and will take you back shortly.
        </p>
      </div>
    </div>
  )
}