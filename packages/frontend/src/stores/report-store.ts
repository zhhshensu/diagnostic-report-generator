import { create } from 'zustand'
import { loadReports, saveReports } from '@/lib/db'

export interface Report {
  id: string
  name: string
  html: string
  createdAt: string
  provider: string
  model: string
  status: 'generating' | 'completed' | 'error'
  score?: number
  error?: string
  isStarred: boolean
  shareId?: string
  mode?: 'free' | 'fixed'
  /** Original user prompt used to generate this report */
  prompt?: string
}

interface ReportStore {
  reports: Report[]
  _hydrated: boolean
  hydrate: () => Promise<void>
  addReport: (report: Omit<Report, 'createdAt' | 'isStarred'>) => void
  updateReport: (id: string, data: Partial<Report>) => void
  removeReport: (id: string) => void
  getReport: (id: string) => Report | undefined
  getReportByShareId: (shareId: string) => Report | undefined
  toggleStar: (id: string) => void
  generateShareId: (id: string) => string
  clearAll: () => void
}

export const useReportStore = create<ReportStore>()((set, get) => ({
  reports: [],
  _hydrated: false,

  hydrate: async () => {
    const reports = await loadReports()
    set({ reports, _hydrated: true })
  },

  addReport: (report) => {
    const newReport = { ...report, createdAt: new Date().toISOString(), isStarred: false }
    set((state) => {
      const reports = [newReport, ...state.reports]
      saveReports(reports)
      return { reports }
    })
  },

  updateReport: (id, data) => {
    set((state) => {
      const reports = state.reports.map((r) => (r.id === id ? { ...r, ...data } : r))
      saveReports(reports)
      return { reports }
    })
  },

  removeReport: (id) => {
    set((state) => {
      const reports = state.reports.filter((r) => r.id !== id)
      saveReports(reports)
      return { reports }
    })
  },

  getReport: (id) => get().reports.find((r) => r.id === id),

  getReportByShareId: (shareId) => get().reports.find((r) => r.shareId === shareId),

  toggleStar: (id) => {
    set((state) => {
      const reports = state.reports.map((r) =>
        r.id === id ? { ...r, isStarred: !r.isStarred } : r,
      )
      saveReports(reports)
      return { reports }
    })
  },

  generateShareId: (id) => {
    const shareId = Math.random().toString(36).substring(2, 10)
    set((state) => {
      const reports = state.reports.map((r) => (r.id === id ? { ...r, shareId } : r))
      saveReports(reports)
      return { reports }
    })
    return shareId
  },

  clearAll: () => {
    set((state) => {
      const reports: Report[] = []
      saveReports(reports)
      return { reports }
    })
  },
}))
