import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import FormWrapper from "./FormWrapper"
import axios from "axios"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      await axios.post("/accounts/forgot-password", { email })
      setIsEmailSent(true)
    } catch (err: any) {
      setErrors(err.response?.data || {})
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormWrapper
      title="Reset your password"
      description="Enter your email address and we’ll send you a reset link."
    >
      {isEmailSent ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            A reset link has been sent to your email address.
          </div>

          <Link to="/login" className="block">
            <Button className="h-11 w-full rounded-2xl" variant="outline" type="button">
              Back to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              className={cn("h-11 rounded-2xl border-slate-200", {
                "focus-visible:ring-red-500": errors?.email,
              })}
              placeholder="you@example.com"
              disabled={isLoading}
            />
            {errors?.email ? <p className="text-sm text-red-500">{errors.email}</p> : null}
          </div>

          {errors?.non_field_errors ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errors.non_field_errors}
            </div>
          ) : null}

          <Button disabled={isLoading || !email} type="submit" className="h-11 w-full rounded-2xl">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send reset link
          </Button>

          <Link to="/login" className="block">
            <Button className="h-11 w-full rounded-2xl" variant="outline" type="button">
              Back to sign in
            </Button>
          </Link>
        </form>
      )}
    </FormWrapper>
  )
}

export default ForgotPassword
