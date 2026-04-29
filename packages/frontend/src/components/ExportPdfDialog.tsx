import { useReportStore } from '@/stores/report-store'
import { useUIStore } from '@/stores/ui-store'
import { useT } from '@/lib/i18n/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, FileText } from 'lucide-react'

interface ExportPdfDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
}

export default function ExportPdfDialog({ open, onOpenChange, reportId }: ExportPdfDialogProps) {
  const { getReport } = useReportStore()
  const { addToast } = useUIStore()
  const t = useT()
  const report = getReport(reportId)

  const handlePrintPdf = () => {
    if (!report?.html) return
    const win = window.open('', '_blank')
    if (!win) {
      addToast(t('pdf.popupError'), 'error')
      return
    }
    win.document.write(report.html)
    win.document.close()
    win.onload = () => {
      win.print()
    }
  }

  const handleSummaryPdf = () => {
    if (!report) return
    addToast('Summary PDF generation (requires @react-pdf/renderer)', 'info')
    handlePrintPdf()
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
          <div className="border rounded-lg p-4 hover:bg-accent/30 transition-colors cursor-pointer" onClick={handlePrintPdf}>
            <div className="flex items-start gap-3">
              <Printer className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">{t('pdf.fullTitle')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('pdf.fullDesc')}</p>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={(e) => { e.stopPropagation(); handlePrintPdf() }}>
                  <Printer className="w-3.5 h-3.5" /> {t('pdf.fullAction')}
                </Button>
              </div>
            </div>
          </div>
          <div className="border rounded-lg p-4 hover:bg-accent/30 transition-colors cursor-pointer" onClick={handleSummaryPdf}>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">{t('pdf.summaryTitle')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('pdf.summaryDesc')}</p>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={(e) => { e.stopPropagation(); handleSummaryPdf() }}>
                  <FileText className="w-3.5 h-3.5" /> {t('pdf.summaryAction')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
