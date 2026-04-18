import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, PlayCircle, Pencil, Trash2 } from "lucide-react"

import type { EmailSendingConfig } from "./api"

type Props = {
  config: EmailSendingConfig
  busy?: boolean
  onEdit: (config: EmailSendingConfig) => void
  onTest: (config: EmailSendingConfig) => void
  onDelete: (config: EmailSendingConfig) => void
}

function formatTestLabel(config: EmailSendingConfig) {
  if (!config.last_test_status) return "Not tested"
  if (config.last_test_status === "success") return "Test passed"
  if (config.last_test_status === "failed") return "Test failed"
  return config.last_test_status
}

export default function EmailSendingConfigCard({
  config,
  busy = false,
  onEdit,
  onTest,
  onDelete,
}: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{config.name}</h3>

            <Badge className="capitalize">{config.owner_type}</Badge>

            {config.is_active ? <Badge variant="secondary">Active</Badge> : null}
            {config.is_default ? <Badge variant="secondary">Default</Badge> : null}

            {config.last_test_status === "success" ? (
              <Badge variant="secondary">Test passed</Badge>
            ) : null}

            {config.last_test_status === "failed" ? (
              <Badge variant="destructive">Test failed</Badge>
            ) : null}
          </div>

          <div className="mt-2 space-y-1 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">From:</span>{" "}
              {[config.from_name, config.from_email].filter(Boolean).join(" <")}
              {config.from_name ? ">" : ""}
            </p>

            <p>
              <span className="font-medium text-slate-800">SMTP:</span>{" "}
              {config.smtp_host}:{config.smtp_port} · {config.security_type.toUpperCase()}
            </p>

            <p>
              <span className="font-medium text-slate-800">Username:</span> {config.smtp_username}
            </p>

            <p>
              <span className="font-medium text-slate-800">Password:</span>{" "}
              {config.masked_password || "Not set"}
            </p>

            <p>
              <span className="font-medium text-slate-800">Last test:</span> {formatTestLabel(config)}
            </p>

            {config.last_test_error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                {config.last_test_error}
              </p>
            ) : null}
          </div>
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
            Test
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