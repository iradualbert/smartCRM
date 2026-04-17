import axios from "axios"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { FileText, Eye, Download, Printer, RefreshCcw, Wand2 } from "lucide-react"

const api = axios

type PdfActionsMenuProps = {
  entityLabel?: string
  pdfUrl: string
  generateUrl: string
  regenerateUrl: string
  hasPdf: boolean
  disabled?: boolean
  onAfterGenerate?: () => Promise<void> | void
}

export default function PdfActionsMenu({
  entityLabel = "PDF",
  pdfUrl,
  generateUrl,
  regenerateUrl,
  hasPdf,
  disabled = false,
  onAfterGenerate,
}: PdfActionsMenuProps) {
  const fetchProtectedPdf = async () => {
    const response = await api.get(pdfUrl, {
      responseType: "blob",
      withCredentials: true,
    })

    const disposition = response.headers["content-disposition"] as string | undefined

    let filename = "document.pdf"
    if (disposition) {
      const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
      const asciiMatch = disposition.match(/filename="?([^"]+)"?/i)

      if (utf8Match?.[1]) {
        filename = decodeURIComponent(utf8Match[1])
      } else if (asciiMatch?.[1]) {
        filename = asciiMatch[1]
      }
    }

    const blob = new Blob([response.data], { type: "application/pdf" })
    const blobUrl = window.URL.createObjectURL(blob)

    return { blobUrl, filename }
  }

  const viewPdf = async () => {
    const { blobUrl } = await fetchProtectedPdf()
    window.open(blobUrl, "_blank", "noopener,noreferrer")

    window.setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
    }, 60_000)
  }

  const downloadPdf = async () => {
    const { blobUrl, filename } = await fetchProtectedPdf()

    const link = document.createElement("a")
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
    }, 1000)
  }

  const printPdf = async () => {
    const { blobUrl } = await fetchProtectedPdf()

    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    iframe.src = blobUrl

    document.body.appendChild(iframe)

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } finally {
        window.setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
          window.URL.revokeObjectURL(blobUrl)
        }, 1000)
      }
    }
  }

  const generatePdf = async (force = false) => {
    await api.post(force ? regenerateUrl : generateUrl, {}, { withCredentials: true })
    await onAfterGenerate?.()

    const { blobUrl } = await fetchProtectedPdf()
    window.open(blobUrl, "_blank", "noopener,noreferrer")

    window.setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
    }, 60_000)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-xl" disabled={disabled}>
          <FileText className="mr-2 h-4 w-4" />
          {entityLabel}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {hasPdf ? (
          <>
            <DropdownMenuItem onClick={viewPdf}>
              <Eye className="mr-2 h-4 w-4" />
              View PDF
            </DropdownMenuItem>

            <DropdownMenuItem onClick={downloadPdf}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>

            <DropdownMenuItem onClick={printPdf}>
              <Printer className="mr-2 h-4 w-4" />
              Print PDF
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => generatePdf(true)}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Regenerate PDF
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={() => generatePdf(false)}>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate PDF
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}