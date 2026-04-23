import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { SET_USER } from "@/redux/types"
import axios from "axios"
import { Loader2, PencilLine } from "lucide-react"
import { useState } from "react"
import { useDispatch } from "react-redux"

type UserEmailProps = {
  currentEmail: string
  first_name: string
}

const UserEmail = ({ currentEmail, first_name }: UserEmailProps) => {
  const [fullName, setFullName] = useState(first_name)
  const [password, setPassword] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)
  const [errors, setErrors] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState(currentEmail)
  const [verificationCode, setVerificationCode] = useState("")
  const [showVerificationCode, setShowVerificationCode] = useState(false)
  const dispatch = useDispatch()

  const isDisabled = !isEditMode || isLoading
  const isEmailChanged = email !== currentEmail

  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    const userData: any = { first_name: fullName }
    if (isEmailChanged) {
      userData.email = email
      userData.password = password
      if (showVerificationCode) userData.verification_code = verificationCode
    }

    try {
      const { data } = await axios.put("/auth/user", userData)

      if (!isEmailChanged || (isEmailChanged && showVerificationCode)) {
        setIsEditMode(false)
        setShowVerificationCode(false)
        setVerificationCode("")
        setPassword("")
        toast({ title: "Profile updated" })
        dispatch({
          type: SET_USER,
          payload: data,
        })
      } else if (isEmailChanged) {
        setShowVerificationCode(true)
        toast({
          title: `A verification code was sent to ${email}`,
        })
      }
      setErrors({})
    } catch (err: any) {
      setErrors(err.response?.data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEmail(currentEmail)
    setFullName(first_name)
    setPassword("")
    setVerificationCode("")
    setShowVerificationCode(false)
    setErrors({})
    setIsEditMode(false)
  }

  return (
    <div>
      {!isEditMode ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs uppercase tracking-wide text-slate-400">Full name</div>
              <div className="mt-1 font-medium text-slate-900">{fullName || "Not set"}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-xs uppercase tracking-wide text-slate-400">Email</div>
              <div className="mt-1 font-medium text-slate-900">{email}</div>
            </div>
          </div>

          <Button onClick={() => setIsEditMode(true)} className="rounded-2xl">
            <PencilLine className="mr-2 h-4 w-4" />
            Edit details
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input
                disabled={isDisabled}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={cn("h-11 rounded-2xl border-slate-200", {
                  "focus-visible:ring-red-500": errors?.first_name,
                })}
              />
              {errors?.first_name ? (
                <p className="text-sm text-red-500">{errors.first_name}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                disabled={isDisabled}
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                className={cn("h-11 rounded-2xl border-slate-200", {
                  "focus-visible:ring-red-500": errors?.email,
                })}
                placeholder="you@example.com"
              />
              {errors?.email ? <p className="text-sm text-red-500">{errors.email}</p> : null}
            </div>
          </div>

          {isEmailChanged ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Your password</Label>
                  <Input
                    required
                    disabled={isLoading}
                    value={password}
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn("h-11 rounded-2xl border-slate-200 bg-white", {
                      "focus-visible:ring-red-500": errors?.password,
                    })}
                  />
                  {errors?.password ? (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  ) : null}
                </div>

                {showVerificationCode ? (
                  <div className="space-y-2">
                    <Label>Verification code</Label>
                    <Input
                      required
                      disabled={isLoading}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className={cn("h-11 rounded-2xl border-slate-200 bg-white", {
                        "focus-visible:ring-red-500": errors?.verification_code,
                      })}
                    />
                    {errors?.verification_code ? (
                      <p className="text-sm text-red-500">{errors.verification_code}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {errors?.non_field_errors ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errors.non_field_errors}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button disabled={isDisabled} type="submit" className="rounded-2xl">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
            <Button onClick={handleCancel} disabled={isDisabled} variant="outline" className="rounded-2xl" type="button">
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default UserEmail
