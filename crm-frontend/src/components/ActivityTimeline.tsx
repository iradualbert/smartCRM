import { useEffect, useState } from "react"
import axios from "axios"
import {
  CheckCircle2,
  FileText,
  Mail,
  Pencil,
  RefreshCw,
  Send,
  Clock,
} from "lucide-react"

interface ActivityEvent {
  id: number
  event_type: string
  created_at: string
  created_by: string
  metadata: Record<string, unknown>
}

interface Props {
  activityUrl: string
}

const eventConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  created: { label: "Created", icon: <FileText className="h-3.5 w-3.5" />, color: "bg-blue-500" },
  updated: { label: "Updated", icon: <Pencil className="h-3.5 w-3.5" />, color: "bg-amber-500" },
  status_changed: { label: "Status changed", icon: <RefreshCw className="h-3.5 w-3.5" />, color: "bg-purple-500" },
  email_sent: { label: "Email sent", icon: <Mail className="h-3.5 w-3.5" />, color: "bg-green-500" },
  sent: { label: "Sent", icon: <Send className="h-3.5 w-3.5" />, color: "bg-green-500" },
  pdf_generated: { label: "PDF generated", icon: <FileText className="h-3.5 w-3.5" />, color: "bg-slate-500" },
  converted: { label: "Converted", icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "bg-teal-500" },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function EventLabel({ event }: { event: ActivityEvent }) {
  const cfg = eventConfig[event.event_type]
  const label = cfg?.label ?? event.event_type

  if (event.event_type === "status_changed" && event.metadata.from && event.metadata.to) {
    return (
      <span>
        Status changed from <strong>{String(event.metadata.from)}</strong> to{" "}
        <strong>{String(event.metadata.to)}</strong>
      </span>
    )
  }
  if (event.event_type === "email_sent" && Array.isArray(event.metadata.to)) {
    return (
      <span>
        {label} to <strong>{(event.metadata.to as string[]).join(", ")}</strong>
      </span>
    )
  }
  return <span>{label}</span>
}

export default function ActivityTimeline({ activityUrl }: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    axios
      .get(activityUrl, { withCredentials: true })
      .then((res) => {
        if (!cancelled) setEvents(res.data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activityUrl])

  if (loading) {
    return <p className="text-xs text-gray-400 py-2">Loading activity...</p>
  }

  if (!events.length) {
    return <p className="text-xs text-gray-400 py-2">No activity yet.</p>
  }

  return (
    <ol className="relative border-l border-gray-200 space-y-4 pl-4">
      {events.map((event) => {
        const cfg = eventConfig[event.event_type]
        const dotColor = cfg?.color ?? "bg-gray-400"
        const icon = cfg?.icon ?? <Clock className="h-3.5 w-3.5" />

        return (
          <li key={event.id} className="relative">
            <span
              className={`absolute -left-[1.35rem] flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white ${dotColor}`}
            >
              {icon}
            </span>

            <div className="pl-2">
              <p className="text-sm text-gray-800">
                <EventLabel event={event} />
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {formatDate(event.created_at)}
                {event.created_by ? ` · ${event.created_by}` : ""}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
