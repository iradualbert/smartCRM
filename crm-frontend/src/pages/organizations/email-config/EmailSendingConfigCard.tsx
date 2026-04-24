import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Pencil, PlayCircle, Trash2, UserCircle2 } from "lucide-react"

import type { EmailSendingConfig } from "./api"

type Props = {
  config: EmailSendingConfig
  busy?: boolean
  onEdit: (config: EmailSendingConfig) => void
  onTest: (config: EmailSendingConfig) => void
  onDelete: (config: EmailSendingConfig) => void
}

function formatTestLabel(config: EmailSendingConfig) {
  if (!config.last_test_status) return "Not yet verified"
  if (config.last_test_status === "success") return "Connection verified"
  if (config.last_test_status === "failed") return "Needs attention"
  return config.last_test_status
}

function formatScopeLabel(ownerType: EmailSendingConfig["owner_type"]) {
  return ownerType === "company" ? "Organization" : "Personal"
}

export default function EmailSendingConfigCard({
  config,
  busy = false,
  onEdit,
  onTest,
  onDelete,
}: Props) {
  const senderLabel = config.from_name?.trim() || config.from_email
  const connectionLabel = `${config.smtp_host}:${config.smtp_port} - ${config.security_type.toUpperCase()}`

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
              {config.owner_type === "company" ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <UserCircle2 className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{config.name}</h3>
                <Badge variant="outline">{formatScopeLabel(config.owner_type)}</Badge>
                {config.is_active ? <Badge variant="secondary">Ready to send</Badge> : <Badge variant="outline">Paused</Badge>}
                {config.is_default ? <Badge variant="secondary">Default sender</Badge> : null}
              </div>

              <div className="mt-1 text-sm text-slate-500">{formatTestLabel(config)}</div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Sender</div>
              <div className="mt-1 font-medium text-slate-900">{senderLabel}</div>
              <div className="mt-1 text-sm text-slate-600">{config.from_email}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Connection</div>
              <div className="mt-1 font-medium text-slate-900">{connectionLabel}</div>
              <div className="mt-1 text-sm text-slate-600">{config.smtp_username}</div>
            </div>
          </div>

          {config.last_test_error ? (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {config.last_test_error}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={busy}
            onClick={() => onTest(config)}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Verify
          </Button>

          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            disabled={busy}
            onClick={() => onEdit(config)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>

          <Button
            type="button"
            variant="outline"
            className="rounded-2xl text-rose-600 hover:text-rose-700"
            disabled={busy}
            onClick={() => onDelete(config)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
