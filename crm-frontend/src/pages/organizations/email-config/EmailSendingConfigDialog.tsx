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
  currentOrganizationName?: string | null
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
  currentOrganizationName,
  initialConfig,
  submitting = false,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-3xl bg-white sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add sender account" : "Edit sender account"}
          </DialogTitle>
          <DialogDescription>
            Save the mailbox details this workspace will use when sending email.
          </DialogDescription>
        </DialogHeader>

        <EmailSendingConfigForm
          mode={mode}
          currentOrganizationId={currentOrganizationId}
          currentOrganizationName={currentOrganizationName}
          initialConfig={initialConfig}
          submitting={submitting}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
