import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useReportStore } from '@/stores/report-store'
import { useT } from '@/lib/i18n/store'
import type { ReportSchema } from '@/lib/report-schema'
import ReportView from '@/components/report/ReportView'
import { FileText } from 'lucide-react'

export default function SharedReport() {
  const { shareId } = useParams<{ shareId: string }>()
  const t = useT()
  const { getReportByShareId } = useReportStore()
  const report = getReportByShareId(shareId || '')

  const reportSchema = useMemo<ReportSchema | null>(() => {
    if (report?.mode === 'fixed' && report.html) {
      try { return JSON.parse(report.html) as ReportSchema } catch { return null }
    }
    return null
  }, [report?.html, report?.mode])

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('detail.reportNotFound')}</h1>
          <p className="text-muted-foreground">{t('detail.backToReports')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {reportSchema ? (
        <ReportView data={reportSchema} />
      ) : (
        <iframe
          srcDoc={report.html}
          sandbox="allow-scripts"
          className="w-full border-0"
          style={{ height: '100vh' }}
          title={report.name}
        />
      )}
    </div>
  )
}
