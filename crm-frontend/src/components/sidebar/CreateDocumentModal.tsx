import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  FileText,
  FileSpreadsheet,
  Receipt,
  Truck,
  FilePlus2,
  Layers3,
  X,
} from "lucide-react"

type CreateItem = {
  label: string
  description: string
  to: string
  icon: React.ElementType
}

const createItems: CreateItem[] = [
  {
    label: "Quotation",
    description: "Start a new customer quote",
    to: "/quotations/new",
    icon: FileText,
  },
  {
    label: "Proforma",
    description: "Create a pre-payment document",
    to: "/proformas/new",
    icon: FileSpreadsheet,
  },
  {
    label: "Invoice",
    description: "Issue a new invoice",
    to: "/invoices/new",
    icon: Receipt,
  },
  {
    label: "Receipt",
    description: "Record received payment",
    to: "/receipts/new",
    icon: FilePlus2,
  },
  {
    label: "Delivery Note",
    description: "Prepare delivery paperwork",
    to: "/delivery-notes/new",
    icon: Truck,
  },
  {
    label: "Document Template",
    description: "Upload a new template",
    to: "/templates/new",
    icon: Layers3,
  },
]

type CreateDocumentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateDocumentModal({
  open,
  onOpenChange,
}: CreateDocumentModalProps) {
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">
      <div
        className="absolute inset-0"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative z-10 w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Create new
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Start a new document or upload a template.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 p-6 md:grid-cols-2">
          {createItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.to}
                type="button"
                onClick={() => {
                  onOpenChange(false)
                  navigate(item.to)
                }}
                className="group flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <div className="font-medium text-slate-900">{item.label}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">
                    {item.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}