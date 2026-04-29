import { Link, useNavigate } from 'react-router-dom'
import { useReportStore } from '@/stores/report-store'
import { useT } from '@/lib/i18n/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/StatusBadge'
import { FileText, Activity, AlertTriangle, AlertCircle, Plus, List, Settings } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const t = useT()
  const { reports } = useReportStore()

  const total = reports.length
  const completed = reports.filter((r) => r.status === 'completed').length
  const warning = reports.filter((r) => r.score && r.score < 60).length
  const critical = reports.filter((r) => r.score && r.score < 30).length
  const recent = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const stats = [
    { label: t('dashboard.totalReports'), value: total, color: 'text-blue-600', icon: FileText },
    { label: t('dashboard.completed'), value: completed, color: 'text-status-normal', icon: Activity },
    { label: t('dashboard.warning'), value: warning, color: 'text-status-warning', icon: AlertTriangle },
    { label: t('dashboard.critical'), value: critical, color: 'text-status-critical', icon: AlertCircle },
  ]

  if (total === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('dashboard.welcome')}</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t('dashboard.welcomeDesc')}</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/reports/new')} className="gap-2">
              <Plus className="w-4 h-4" /> {t('dashboard.generateReport')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/providers')} className="gap-2">
              <Settings className="w-4 h-4" /> {t('dashboard.configureProvider')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('dashboard.recentReports')}</span>
                <Link to="/reports" className="text-sm font-normal text-primary hover:underline">
                  {t('dashboard.viewAll')}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.noReports')}</p>
              ) : (
                <div className="space-y-1">
                  {recent.map((r) => (
                    <Link
                      key={r.id}
                      to={`/reports/${r.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-medium truncate">{r.name}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        {r.score != null && <span>{t('dashboard.score')}: {r.score}</span>}
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate('/reports/new')}>
                <Plus className="w-4 h-4" /> {t('dashboard.newReport')}
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate('/reports')}>
                <List className="w-4 h-4" /> {t('dashboard.viewReports')}
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate('/providers')}>
                <Settings className="w-4 h-4" /> {t('dashboard.manageProviders')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
