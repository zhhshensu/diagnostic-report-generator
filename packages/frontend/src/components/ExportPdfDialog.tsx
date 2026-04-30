import { useState } from 'react'
import { useReportStore } from '@/stores/report-store'
import { useUIStore } from '@/stores/ui-store'
import { useT } from '@/lib/i18n/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'
import { schemaToHtml } from '@/lib/report-schema'
import type { ReportSchema } from '@/lib/report-schema'

interface ExportPdfDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
  mode?: 'free' | 'fixed'
  reportSchema?: ReportSchema | null
}

function getPrintableHtml(report: { html: string } | undefined, mode: string | undefined, reportSchema: ReportSchema | null | undefined): string | null {
  if (!report) return null
  if (mode === 'fixed' && reportSchema) {
    return schemaToHtml(reportSchema)
  }
  return report.html || null
}

export default function ExportPdfDialog({ open, onOpenChange, reportId, mode, reportSchema }: ExportPdfDialogProps) {
  const { getReport } = useReportStore()
  const { addToast } = useUIStore()
  const t = useT()
  const report = getReport(reportId)
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadPdf = async () => {
    const html = getPrintableHtml(report, mode, reportSchema)
    if (!html) return

    setIsLoading(true)
    try {
      // Dynamically load html2pdf.js from CDN
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js')

      // Create a hidden iframe so that <script> tags (Tailwind, Chart.js) execute properly
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.left = '-9999px'
      iframe.style.top = '0'
      iframe.style.width = '1200px'
      iframe.style.height = '1000px'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      // Inject CSS override to remove width constraints for PDF capture
      const pdfHtml = html.replace(
        '</head>',
        `<style>
          body.pdf-export { padding: 0 !important; }
          body.pdf-export .max-w-6xl { max-width: none !important; }
        </style></head>`
      ).replace(
        '<body',
        '<body class="pdf-export"'
      )

      // Write HTML to the iframe — scripts will execute in this context
      const iframeDoc = iframe.contentDocument!
      iframeDoc.open()
      iframeDoc.write(pdfHtml)
      iframeDoc.close()

      // Wait for scripts (Tailwind CDN, Chart.js) to fully load and render
      await Promise.race([
        new Promise<void>((resolve) => {
          iframe.onload = () => resolve()
          setTimeout(() => resolve(), 5000)
        }),
      ])
      // Additional wait for async script processing (Tailwind class scanning)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // @ts-expect-error - html2pdf is loaded from CDN
      await html2pdf()
        .set({
          margin: [5, 5, 5, 5],
          filename: `${report?.name || 'report'}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(iframeDoc.body)
        .save()

      document.body.removeChild(iframe)
      onOpenChange(false)
      addToast('PDF downloaded successfully', 'success')
    } catch (err) {
      addToast(`PDF generation failed: ${(err as Error).message}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> {t('pdf.title')}
          </DialogTitle>
          <DialogDescription>{t('pdf.desc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div
            className={`border rounded-lg p-4 transition-colors ${isLoading ? 'opacity-50 pointer-events-none' : 'hover:bg-accent/30 cursor-pointer'}`}
            onClick={isLoading ? undefined : handleDownloadPdf}
          >
            <div className="flex items-start gap-3">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5 animate-spin" />
              ) : (
                <FileText className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="font-medium">{t('pdf.fullTitle')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('pdf.fullDesc')}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5"
                  disabled={isLoading}
                  onClick={(e) => { e.stopPropagation(); handleDownloadPdf() }}
                >
                  {isLoading ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating PDF...</>
                  ) : (
                    <><FileText className="w-3.5 h-3.5" /> {t('pdf.fullAction')}</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Dynamically load a script from a URL */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}
