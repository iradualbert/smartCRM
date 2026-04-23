import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useDispatch } from "react-redux"
import { loginUser } from "@/redux/actions/userActions"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@/lib/hooks"
import FormWrapper from "./FormWrapper"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const next = useQuery().get("next")

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    const userData = { email, password }
    const newErrors = await dispatch(
      loginUser(userData, navigate, next as string) as any
    )
    setErrors(newErrors)
    setIsLoading(false)
  }

  return (
    <FormWrapper
      title="Welcome back"
      description="Sign in to continue managing your client work, quotations, and billing."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              "h-11 rounded-2xl border-slate-200 focus-visible:ring-teal-600",
              {
                "border-rose-400 focus-visible:ring-rose-500": errors?.email,
              }
            )}
            placeholder="you@example.com"
          />
          {errors?.email ? (
            <p className="text-sm text-rose-600" role="alert">{errors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/accounts/forgot-password"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Forgot password?
            </Link>
          </div>

          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className={cn(
              "h-11 rounded-2xl border-slate-200 focus-visible:ring-teal-600",
              {
                "border-rose-400 focus-visible:ring-rose-500": errors?.password,
              }
            )}
            placeholder="Enter your password"
          />
          {errors?.password ? (
            <p className="text-sm text-rose-600" role="alert">{errors.password}</p>
          ) : null}
        </div>

        {errors?.non_field_errors ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errors.non_field_errors}
          </div>
        ) : null}

        <Button
          disabled={isLoading}
          type="submit"
          className="h-11 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign in
        </Button>

        <div className="text-center text-sm text-slate-500">
          By continuing, you agree to our{" "}
          <a href="/terms" target="_blank" className="font-medium underline">
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy-policy"
            target="_blank"
            className="font-medium underline"
          >
            Privacy Policy
          </a>
          .
        </div>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-slate-400">
            <span className="bg-white px-3">New here</span>
          </div>
        </div>

        <Link to="/signup" className="block">
          <Button
            className="h-11 w-full rounded-2xl"
            variant="outline"
            type="button"
          >
            Create account
          </Button>
        </Link>
      </form>
    </FormWrapper>
  )
}

export default LoginPage
