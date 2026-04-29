import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useT, useLanguage, useI18nStore } from '@/lib/i18n/store'
import type { Language } from '@/lib/i18n/store'

const navItems = [
  { path: '/', labelKey: 'nav.dashboard' as const, icon: '◉' },
  { path: '/reports', labelKey: 'nav.reports' as const, icon: '◇' },
  { path: '/reports/new', labelKey: 'nav.newReport' as const, icon: '+' },
  { path: '/settings', labelKey: 'nav.settings' as const, icon: '⚙' },
]

export default function Layout() {
  const location = useLocation()
  const t = useT()
  const language = useLanguage()
  const setLanguage = useI18nStore((s) => s.setLanguage)

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-scroll">
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="font-bold text-lg tracking-tight">
            {t('app.name')}
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <span>{item.icon}</span>
                <span>{t(item.labelKey)}</span>
              </Link>
            ))}
            <div className="ml-2 pl-2 border-l">
              <button
                onClick={() => setLanguage(language === 'zh-CN' ? 'en-US' : 'zh-CN')}
                className="inline-flex items-center rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                title={t('nav.language')}
              >
                {language === 'zh-CN' ? 'EN' : '中文'}
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
