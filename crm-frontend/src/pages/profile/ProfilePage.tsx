import { Link } from "react-router-dom"
import { KeyRound, ShieldCheck, UserCircle2 } from "lucide-react"
import { useSelector } from "react-redux"

import { Button } from "@/components/ui/button"
import UserEmail from "./UserEmail"

const ProfilePage = () => {
  const { credentials: userData } = useSelector((state: any) => state.user)

  const displayName =
    [userData?.first_name, userData?.last_name].filter(Boolean).join(" ") ||
    userData?.first_name ||
    userData?.username ||
    "Your account"

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              Account settings
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Profile
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Keep your personal details current and manage the security settings tied to your account.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-slate-900">{displayName}</div>
                <div className="text-sm text-slate-500">{userData?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Personal details</h2>
            <p className="mt-1 text-sm text-slate-600">
              Update the name and email address associated with your account.
            </p>
          </div>

          <UserEmail
            currentEmail={userData?.email}
            first_name={userData?.first_name || ""}
          />
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-slate-700" />
              <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Review the settings that protect access to your account.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl border border-slate-200 bg-white p-2 text-slate-700">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-slate-900">Password</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Change your password if you need to update or secure your sign-in.
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button asChild variant="outline" className="rounded-2xl">
                  <Link to="/settings/password-reset">Change password</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
