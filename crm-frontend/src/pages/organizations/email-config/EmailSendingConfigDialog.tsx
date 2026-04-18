import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type {
  EmailSendingConfig,
  EmailSendingConfigCreatePayload,
  EmailSendingConfigUpdatePayload,
  Id,
} from "./api"
import EmailSendingConfigForm from "./EmailSendingConfigForm"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  currentOrganizationId?: Id | null
  initialConfig?: EmailSendingConfig | null
  submitting?: boolean
  onSubmit: (
    payload: EmailSendingConfigCreatePayload | EmailSendingConfigUpdatePayload
  ) => Promise<void>
}

export default function EmailSendingConfigDialog({
  open,
  onOpenChange,
  mode,
  currentOrganizationId,
  initialConfig,
  submitting = false,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl bg-white sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add email sending configuration" : "Edit email sending configuration"}
          </DialogTitle>
          <DialogDescription>
            Save SMTP settings for personal or organization sending.
          </DialogDescription>
        </DialogHeader>

        <EmailSendingConfigForm
          mode={mode}
          currentOrganizationId={currentOrganizationId}
          initialConfig={initialConfig}
          submitting={submitting}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}