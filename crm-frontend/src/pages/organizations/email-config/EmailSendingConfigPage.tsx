import * as React from "react"
import { Mail, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useOrganizations } from "@/redux/hooks/useOrganizations"

import {
  createEmailSendingConfig,
  deleteEmailSendingConfig,
  listEmailSendingConfigs,
  testEmailSendingConfig,
  updateEmailSendingConfig,
  type EmailSendingConfig,
  type EmailSendingConfigCreatePayload,
  type EmailSendingConfigUpdatePayload,
} from "./api"
import EmailSendingConfigDialog from "./EmailSendingConfigDialog"
import EmailSendingConfigList from "./EmailSendingConfigList"

type ScopeTab = "company" | "user"

export default function EmailSendingConfigPage() {
  const { currentOrganizationId } = useOrganizations()

  const [tab, setTab] = React.useState<ScopeTab>("company")
  const [configs, setConfigs] = React.useState<EmailSendingConfig[]>([])
  const [loading, setLoading] = React.useState(true)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create")
  const [dialogSubmitting, setDialogSubmitting] = React.useState(false)
  const [selectedConfig, setSelectedConfig] = React.useState<EmailSendingConfig | null>(null)

  const loadConfigs = React.useCallback(async () => {
    try {
      setLoading(true)

      if (tab === "company") {
        const data = await listEmailSendingConfigs({
          owner_type: "company",
          company: currentOrganizationId ?? undefined,
        })
        setConfigs(data)
        return
      }

      const data = await listEmailSendingConfigs({
        owner_type: "user",
      })
      setConfigs(data)
    } finally {
      setLoading(false)
    }
  }, [tab, currentOrganizationId])

  React.useEffect(() => {
    loadConfigs().catch(console.error)
  }, [loadConfigs])

  const openCreate = () => {
    setSelectedConfig(null)
    setDialogMode("create")
    setDialogOpen(true)
  }

  const openEdit = (config: EmailSendingConfig) => {
    setSelectedConfig(config)
    setDialogMode("edit")
    setDialogOpen(true)
  }

  const handleSubmit = async (
    payload: EmailSendingConfigCreatePayload | EmailSendingConfigUpdatePayload
  ) => {
    try {
      setDialogSubmitting(true)

      if (dialogMode === "create") {
        await createEmailSendingConfig(payload as EmailSendingConfigCreatePayload)
      } else if (selectedConfig) {
        await updateEmailSendingConfig(selectedConfig.id, payload as EmailSendingConfigUpdatePayload)
      }

      setDialogOpen(false)
      setSelectedConfig(null)
      await loadConfigs()
    } finally {
      setDialogSubmitting(false)
    }
  }

  const handleTest = async (config: EmailSendingConfig) => {
    try {
      setBusyId(config.id)
      await testEmailSendingConfig(config.id)
      await loadConfigs()
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (config: EmailSendingConfig) => {
    const confirmed = window.confirm(`Delete "${config.name}"?`)
    if (!confirmed) return

    try {
      setBusyId(config.id)
      await deleteEmailSendingConfig(config.id)
      await loadConfigs()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            SMTP settings
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <Mail className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Email sending configuration
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Configure SMTP accounts for personal or organization email delivery.
              </p>
            </div>
          </div>
        </div>

        <Button className="rounded-2xl" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add configuration
        </Button>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant={tab === "company" ? "default" : "outline"}
          className="rounded-2xl"
          onClick={() => setTab("company")}
        >
          Organization
        </Button>

        <Button
          type="button"
          variant={tab === "user" ? "default" : "outline"}
          className="rounded-2xl"
          onClick={() => setTab("user")}
        >
          Personal
        </Button>
      </div>

      {loading ? (
        <div className="rounded-3xl border bg-white p-10 text-center text-sm text-slate-500">
          Loading email configurations...
        </div>
      ) : (
        <EmailSendingConfigList
          configs={configs}
          busyId={busyId}
          onEdit={openEdit}
          onTest={handleTest}
          onDelete={handleDelete}
        />
      )}

      <EmailSendingConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        currentOrganizationId={currentOrganizationId ?? null}
        initialConfig={selectedConfig}
        submitting={dialogSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  )
}