import type { EmailSendingConfig } from "./api"
import EmailSendingConfigCard from "./EmailSendingConfigCard"

type Props = {
  configs: EmailSendingConfig[]
  busyId?: string | null
  onEdit: (config: EmailSendingConfig) => void
  onTest: (config: EmailSendingConfig) => void
  onDelete: (config: EmailSendingConfig) => void
}

export default function EmailSendingConfigList({
  configs,
  busyId,
  onEdit,
  onTest,
  onDelete,
}: Props) {
  if (!configs.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        No email sending configurations yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {configs.map((config) => (
        <EmailSendingConfigCard
          key={config.id}
          config={config}
          busy={busyId === config.id}
          onEdit={onEdit}
          onTest={onTest}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}