import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import FormWrapper from "./FormWrapper"
import axios from "axios"
import { logoutUserAll } from "@/redux/actions/userActions"

const PasswordResetPage = () => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const { uid, token } = useParams()
  const [isPasswordChanged, setIsPasswordChanged] = useState(false)

  const isViaEmailClick = Boolean(uid && token)

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

  return (
    <FormWrapper
      title={isViaEmailClick ? "Choose a new password" : "Change your password"}
      description={
        isViaEmailClick
          ? "Set a new password to regain access to your account."
          : "Update your password to keep your account secure."
      }
    >
      {isPasswordChanged ? (
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
      )}
    </FormWrapper>
  )
}

export default PasswordResetPage
