import { Link, useNavigate } from "react-router-dom"
import FormWrapper from "./FormWrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useDispatch } from "react-redux"
import { useState } from "react"
import {
  registerUser,
  resend_verification_code,
  verify_code,
} from "@/redux/actions/userActions"

const SignupPage = () => {
  const [fullname, setFullname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<any>({})
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const userData = {
      fullname,
      email,
      password,
      password_confirm: passwordConfirm,
    }

    const newErrors = await dispatch(registerUser(userData) as any)
    if (newErrors) setErrors(newErrors)
    else setStep(2)

    setIsLoading(false)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const newErrors = await dispatch(
      verify_code({ code: verificationCode, email }, navigate) as any
    )

    setErrors(newErrors || {})
    setIsLoading(false)
  }

  const handleResend = async () => {
    setIsLoading(true)
    const newErrors = await resend_verification_code({ email })

    if (newErrors) {
      setErrors(newErrors)
    }

    setIsLoading(false)
  }

  if (step === 2) {
    return (
      <FormWrapper
        title="Check your email"
        description={`Enter the verification code we sent to ${email}.`}
      >
        <form onSubmit={handleVerifyCode} className="space-y-5">
          <div className="space-y-2">
            <Label>Verification code</Label>
            <Input
              value={verificationCode}
              type="password"
              placeholder="Verification code"
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              disabled={isLoading}
              autoFocus
              className="h-11 rounded-2xl border-slate-200"
            />
          </div>

          {errors?.code ? (
            <div className="text-sm text-rose-600">{errors.code}</div>
          ) : null}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Use the most recent code if you requested more than one.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              disabled={isLoading}
              type="submit"
              className="h-11 flex-1 rounded-2xl"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verify account
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={isLoading}
              className="h-11 rounded-2xl"
            >
              Resend code
            </Button>
          </div>

          <Button
            disabled={isLoading}
            onClick={() => setStep(1)}
            variant="ghost"
            type="button"
            className="rounded-2xl px-0 text-slate-500 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </form>
      </FormWrapper>
    )
  }

  return (
    <FormWrapper
      title="Create your account"
      description="Start with your account details. Your organization will be ready during onboarding."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>Full name</Label>
          <Input
            value={fullname}
            placeholder="John Doe"
            onChange={(e) => setFullname(e.target.value)}
            disabled={isLoading}
            className="h-11 rounded-2xl border-slate-200"
          />
          {errors?.fullname ? (
            <p className="text-sm text-destructive">{errors.fullname}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="h-11 rounded-2xl border-slate-200"
          />
          {errors?.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            placeholder="Create a password"
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="h-11 rounded-2xl border-slate-200"
          />
          {errors?.password ? <p className="text-sm text-destructive">{errors.password}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>Confirm password</Label>
          <Input
            type="password"
            value={passwordConfirm}
            placeholder="Confirm your password"
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={isLoading}
            className="h-11 rounded-2xl border-slate-200"
          />
          {errors?.password_confirm ? (
            <p className="text-sm text-destructive">{errors.password_confirm}</p>
          ) : null}
        </div>

        {errors?.non_field_errors ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errors.non_field_errors}
          </div>
        ) : null}

        <div className="text-sm text-muted-foreground">
          By joining, you agree to our{" "}
          <a href="/terms" target="_blank" className="underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank" className="underline">
            Privacy Policy
          </a>
          .
        </div>

        <Button disabled={isLoading} type="submit" className="h-11 w-full rounded-2xl">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create account
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-slate-400">
            <span className="bg-white px-3">Already registered</span>
          </div>
        </div>

        <Link to="/login" className="block">
          <Button disabled={isLoading} className="h-11 w-full rounded-2xl" variant="outline" type="button">
            Sign in instead
          </Button>
        </Link>
      </form>
    </FormWrapper>
  )
}

export default SignupPage
