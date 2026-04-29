import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useReportStore } from '@/stores/report-store'
import { useUIStore } from '@/stores/ui-store'
import { useT } from '@/lib/i18n/store'
import StatusBadge from '@/components/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Star, Trash2, Plus, FileText, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 10

export default function ReportHistory() {
  const navigate = useNavigate()
  const t = useT()
  const { reports, toggleStar, removeReport } = useReportStore()
  const { addToast } = useUIStore()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score'>('newest')
  const [page, setPage] = useState(0)

  const filtered = reports
    .filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return (b.score || 0) - (a.score || 0)
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (reports.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('history.title')}</h1>
        </div>
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground mb-2">{t('history.empty')}</p>
          <p className="text-sm text-muted-foreground mb-6">{t('history.emptyDesc')}</p>
          <Button onClick={() => navigate('/reports/new')} className="gap-2">
            <Plus className="w-4 h-4" /> {t('history.generateFirst')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('history.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} {reports.length === filtered.length ? 'total' : 'matched'}
          </p>
        </div>
        <Button onClick={() => navigate('/reports/new')} className="gap-2">
          <Plus className="w-4 h-4" /> {t('history.generateFirst')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-9"
              />
            </div>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="newest">{t('history.sortNewest')}</option>
              <option value="oldest">{t('history.sortOldest')}</option>
              <option value="score">{t('history.sortScore')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Empty search state */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-white">
          <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">{t('history.noMatch')}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block border rounded-lg bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('history.name')}</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-24">{t('history.status')}</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-20">{t('history.score')}</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-32">{t('history.provider')}</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-28">{t('history.date')}</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground w-24">{t('history.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/reports/${r.id}`} className="font-medium hover:text-primary hover:underline block truncate max-w-[300px]">
                        {r.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{r.model}</span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3 px-4">
                      {r.score != null ? (
                        <span className={`font-mono font-medium ${
                          r.score >= 80 ? 'text-status-normal' : r.score >= 60 ? 'text-status-warning' : 'text-status-critical'
                        }`}>
                          {r.score}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground truncate max-w-[150px]">{r.provider}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        <button
                          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => { toggleStar(r.id); addToast(r.isStarred ? t('history.unstarred') : t('history.starred'), 'info') }}
                          title={r.isStarred ? t('history.unstarred') : t('history.starred')}
                        >
                          <Star className={`w-4 h-4 ${r.isStarred ? 'fill-status-warning text-status-warning' : ''}`} />
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          onClick={() => { removeReport(r.id); addToast(t('detail.deleted'), 'info') }}
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {paged.map((r) => (
              <Link key={r.id} to={`/reports/${r.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-medium truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.provider} · {r.model}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        {r.score != null && <span>{t('history.score')}: {r.score}</span>}
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.preventDefault()}>
                        <button
                          className="p-1 rounded hover:bg-accent"
                          onClick={() => { toggleStar(r.id); addToast(r.isStarred ? t('history.unstarred') : t('history.starred'), 'info') }}
                        >
                          <Star className={`w-3.5 h-3.5 ${r.isStarred ? 'fill-status-warning text-status-warning' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> {t('history.previous')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('history.page', { current: page + 1, total: totalPages })}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="gap-1">
                {t('history.next')} <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
