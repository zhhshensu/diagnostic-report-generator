import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCopyToClipboard } from '@reactuses/core'
import { useReportStore } from '@/stores/report-store'
import { useUIStore } from '@/stores/ui-store'
import { useT } from '@/lib/i18n/store'
import type { ReportSchema } from '@/lib/report-schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/StatusBadge'
import ShareDialog from '@/components/ShareDialog'
import ExportPdfDialog from '@/components/ExportPdfDialog'
import ReportView from '@/components/report/ReportView'
import { ArrowLeft, Copy, Download, Share2, FileText, RotateCcw, Trash2, Clock, Cpu } from 'lucide-react'

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const t = useT()
  const { getReport, removeReport } = useReportStore()
  const { addToast } = useUIStore()
  const [, copyToClipboard] = useCopyToClipboard()
  const [showShare, setShowShare] = useState(false)
  const [showPdf, setShowPdf] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const report = getReport(id || '')

  // Parse schema for fixed-mode reports
  const reportSchema = useMemo<ReportSchema | null>(() => {
    if (report?.mode === 'fixed' && report.html) {
      try {
        return JSON.parse(report.html) as ReportSchema
      } catch { return null }
    }
    return null
  }, [report?.html, report?.mode])

  const isFixedMode = report?.mode === 'fixed' && reportSchema

  useEffect(() => {
    if (iframeRef.current && report?.html && !isFixedMode) {
      iframeRef.current.srcdoc = report.html
    }
  }, [report?.html, isFixedMode])

  if (!report) {
    return (
      <div className="text-center py-20">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-lg text-muted-foreground mb-2">{t('detail.reportNotFound')}</p>
        <Button onClick={() => navigate('/reports')} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> {t('detail.backToReports')}
        </Button>
      </div>
    )
  }

  const handleCopyHtml = async () => {
    await copyToClipboard(report.html)
    addToast(t('detail.htmlCopied'), 'success')
  }

  const handleDownloadHtml = () => {
    const blob = new Blob([report.html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.name || 'report'}.html`
    a.click()
    URL.revokeObjectURL(url)
    addToast(t('detail.htmlDownloaded'), 'success')
  }

  const handleDelete = () => {
    removeReport(report.id)
    addToast(t('detail.deleted'), 'info')
    navigate('/reports')
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/reports" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> {t('history.title')}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{report.name}</span>
      </div>

      {/* Sticky Toolbar */}
      <div className="sticky top-14 z-30 bg-white border-b shadow-sm rounded-t-lg -mx-4 px-4">
        <div className="flex items-center justify-between py-3 flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-bold truncate max-w-md">{report.name}</h1>
            <StatusBadge status={report.status} />
            {report.score != null && (
              <Badge variant="outline" className={`gap-1 ${
                report.score >= 80 ? 'text-status-normal border-status-normal/30' :
                report.score >= 60 ? 'text-status-warning border-status-warning/30' :
                'text-status-critical border-status-critical/30'
              }`}>
                {t('history.score')}: {report.score}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button variant="ghost" size="sm" onClick={handleCopyHtml} className="gap-1.5">
              <Copy className="w-3.5 h-3.5" /> {t('detail.copyHtml')}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownloadHtml} className="gap-1.5">
              <Download className="w-3.5 h-3.5" /> {t('detail.download')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowShare(true)} className="gap-1.5">
              <Share2 className="w-3.5 h-3.5" /> {t('detail.share')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowPdf(true)} className="gap-1.5">
              <FileText className="w-3.5 h-3.5" /> {t('detail.pdf')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports/new')} className="gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> {t('detail.regenerate')}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="gap-1.5 text-destructive hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" /> {t('detail.delete')}
            </Button>
          </div>
        </div>
        {/* Metadata bar */}
        <div className="flex items-center gap-4 pb-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3" /> {t('detail.provider')}: {report.provider}
          </span>
          <span className="font-mono text-[10px]">{report.model}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {t('detail.created')}: {new Date(report.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Report Content */}
      <div className="border-x border-b rounded-b-lg bg-white overflow-hidden -mx-4 px-0">
        {isFixedMode && reportSchema ? (
          <div className="overflow-auto" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
            <ReportView data={reportSchema} />
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            sandbox="allow-scripts"
            className="w-full border-0"
            style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}
            title={report.name}
          />
        )}
      </div>

      <ShareDialog open={showShare} onOpenChange={setShowShare} reportId={report.id} />
      <ExportPdfDialog open={showPdf} onOpenChange={setShowPdf} reportId={report.id} />
    </div>
  )
}
