import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import FormWrapper from "./FormWrapper"
import axios from "axios"
import { logoutUserAll } from "@/redux/actions/userActions"
import { useSelector } from "react-redux"

const PasswordResetPage = () => {
  const { isAuthenticated } = useSelector((state: any) => state.user)
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const { uid, token } = useParams()
  const [isPasswordChanged, setIsPasswordChanged] = useState(false)

  const isViaEmailClick = Boolean(uid && token)
  const useInAppLayout = isAuthenticated && !isViaEmailClick

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const userData: any = { password, password_confirm: passwordConfirm }
    if (!isViaEmailClick) userData.current_password = currentPassword

    try {
      const requestUrl = isViaEmailClick
        ? `/accounts/password-reset/${uid}/${token}`
        : "/accounts/password-reset/"
      await axios.post(requestUrl, userData)
      setIsPasswordChanged(true)
    } catch (err: any) {
      setErrors(err.response?.data || {})
    } finally {
      setIsLoading(false)
    }
  }

  const formContent = isPasswordChanged ? (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
        Your password has been updated successfully.
      </div>

      {isViaEmailClick ? (
        <Link to="/login" className="block">
          <Button className="h-11 w-full rounded-2xl" variant="outline" type="button">
            Back to sign in
          </Button>
        </Link>
      ) : (
        <Button
          onClick={() => logoutUserAll()}
          className="h-11 w-full rounded-2xl"
          type="button"
        >
          Sign out of all sessions
        </Button>
      )}
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isViaEmailClick ? (
        <div className="space-y-2">
          <Label>Current password</Label>
          <Input
            required
            disabled={isLoading}
            value={currentPassword}
            type="password"
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={cn("h-11 rounded-2xl border-slate-200", {
              "focus-visible:ring-red-500": errors?.current_password,
            })}
          />
          {errors?.current_password ? (
            <p className="text-sm text-red-500">{errors.current_password}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label>New password</Label>
        <Input
          required
          disabled={isLoading}
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className={cn("h-11 rounded-2xl border-slate-200", {
            "focus-visible:ring-red-500": errors?.password,
          })}
        />
        {errors?.password ? <p className="text-sm text-red-500">{errors.password}</p> : null}
      </div>

      <div className="space-y-2">
        <Label>Confirm new password</Label>
        <Input
          required
          disabled={isLoading}
          value={passwordConfirm}
          type="password"
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className={cn("h-11 rounded-2xl border-slate-200", {
            "focus-visible:ring-red-500": errors?.password_confirm,
          })}
        />
        {errors?.password_confirm ? (
          <p className="text-sm text-red-500">{errors.password_confirm}</p>
        ) : null}
      </div>

      {errors?.non_field_errors ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errors.non_field_errors}
        </div>
      ) : null}

      <Button disabled={isLoading || !password || !passwordConfirm} type="submit" className="h-11 w-full rounded-2xl">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isViaEmailClick ? "Save new password" : "Update password"}
      </Button>

      {isViaEmailClick ? (
        <Link to="/login" className="block">
          <Button className="h-11 w-full rounded-2xl" variant="outline" type="button">
            Back to sign in
          </Button>
        </Link>
      ) : null}
    </form>
  )

  if (useInAppLayout) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                Account security
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                Change password
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Update your password and keep access to your account under your control.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Password protection</div>
                  <div className="text-sm text-slate-500">
                    Review and update your sign-in details here.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Security details</h2>
              <p className="mt-1 text-sm text-slate-600">
                Choose a strong password that is unique to this workspace.
              </p>
            </div>
            {formContent}
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">What to expect</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  Your new password takes effect immediately after it is saved.
                </li>
                <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  Use a password you do not reuse in other tools or services.
                </li>
                <li className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  If this account is shared across devices, signing out of older sessions is a good follow-up.
                </li>
              </ul>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">Quick check</h2>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Use at least one memorable phrase or a strong mix of letters, numbers, and symbols so the password is harder to guess.
              </p>
            </section>
          </div>
        </div>
      </div>
    )
  }

  return (
    <FormWrapper
      title={isViaEmailClick ? "Choose a new password" : "Change your password"}
      description={
        isViaEmailClick
          ? "Set a new password to regain access to your account."
          : "Update your password to keep your account secure."
      }
    >
      {formContent}
    </FormWrapper>
  )
}

export default PasswordResetPage
