import {
  Clock,
  Mail,
  FileText,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react"

type Event = {
  id: number
  event_type: string
  created_at: string
  created_by?: string
  metadata?: Record<string, any>
}

const eventConfig = {
  created: {
    icon: FileText,
    label: "Document created",
  },
  updated: {
    icon: RefreshCcw,
    label: "Updated",
  },
  converted: {
    icon: RefreshCcw,
    label: "Converted",
  },
  pdf_generated: {
    icon: FileText,
    label: "PDF generated",
  },
  email_sent: {
    icon: Mail,
    label: "Email sent",
  },
  status_changed: {
    icon: CheckCircle2,
    label: "Status updated",
  },
}

export default function DocumentTimeline({ events }: { events: Event[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Activity
      </h3>

      <div className="space-y-4">
        {events.map((event) => {
          const config = eventConfig[event.event_type as keyof typeof eventConfig]
          const Icon = config?.icon || Clock

          return (
            <div key={event.id} className="flex gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                <Icon className="h-4 w-4 text-slate-600" />
              </div>

              <div className="flex-1">
                <div className="text-sm text-slate-900">
                  {config?.label || event.event_type}
                </div>

                {event.metadata?.email && (
                  <div className="text-xs text-slate-500">
                    Sent to {event.metadata.email}
                  </div>
                )}

                {event.metadata?.to && (
                  <div className="text-xs text-slate-500">
                    Converted to {event.metadata.to}
                  </div>
                )}

                <div className="text-xs text-slate-400 mt-1">
                  {new Date(event.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}