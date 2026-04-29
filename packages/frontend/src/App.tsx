import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import { Toaster } from './components/ui/toaster'
import Layout from './components/Layout'
import { useProviderStore } from './stores/provider-store'
import { useReportStore } from './stores/report-store'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Providers = lazy(() => import('./pages/Providers'))
const ReportEditor = lazy(() => import('./pages/ReportEditor'))
const ReportDetail = lazy(() => import('./pages/ReportDetail'))
const ReportHistory = lazy(() => import('./pages/ReportHistory'))
const SharedReport = lazy(() => import('./pages/SharedReport'))
const Settings = lazy(() => import('./pages/Settings'))

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function init() {
      await useProviderStore.getState().hydrate()
      await useReportStore.getState().hydrate()
      setReady(true)
    }
    init()
  }, [])

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-sm text-muted-foreground">Initializing database...</p>
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  return (
    <AppInitializer>
      <Toaster />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/shared/:shareId" element={<SharedReport />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/reports/new" element={<ReportEditor />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/reports" element={<ReportHistory />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </AppInitializer>
  )
}
