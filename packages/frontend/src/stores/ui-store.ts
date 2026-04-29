import { create } from 'zustand'
import { toast } from 'sonner'

interface UIStore {
  loading: boolean
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  loading: false,
  addToast: (message, type = 'info') => {
    toast[type](message)
  },
  setLoading: (loading) => set({ loading }),
}))
