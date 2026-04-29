import { create } from 'zustand'
import { loadProviders, saveProviders } from '@/lib/db'

export type ProviderType = 'openai' | 'anthropic' | 'gemini' | 'azure' | 'ollama' | 'custom'

export interface LLMProvider {
  id: string
  name: string
  type: ProviderType
  apiKey: string
  baseUrl: string
  model: string
  isActive: boolean
}

interface ProviderStore {
  providers: LLMProvider[]
  _hydrated: boolean
  hydrate: () => Promise<void>
  addProvider: (provider: Omit<LLMProvider, 'id'>) => void
  updateProvider: (id: string, data: Partial<LLMProvider>) => void
  removeProvider: (id: string) => void
  setActiveProvider: (id: string) => void
  getActiveProvider: () => LLMProvider | undefined
}

const PROVIDER_DEFAULTS: Record<ProviderType, { baseUrl: string; model: string }> = {
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  anthropic: { baseUrl: 'https://api.anthropic.com/v1', model: 'claude-sonnet-4-20250514' },
  gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.5-pro-exp-03-25' },
  azure: { baseUrl: 'https://YOUR_RESOURCE.openai.azure.com', model: 'gpt-4o' },
  ollama: { baseUrl: 'http://localhost:11434/v1', model: 'llama3' },
  custom: { baseUrl: '', model: '' },
}

export const useProviderStore = create<ProviderStore>()((set, get) => ({
  providers: [],
  _hydrated: false,

  hydrate: async () => {
    const providers = await loadProviders()
    set({ providers, _hydrated: true })
  },

  addProvider: (provider) => {
    const newProvider = { ...provider, id: Date.now().toString() }
    set((state) => {
      const providers = [
        ...state.providers.map((p) => ({ ...p, isActive: false })),
        newProvider,
      ]
      saveProviders(providers)
      return { providers }
    })
  },

  updateProvider: (id, data) => {
    set((state) => {
      const providers = state.providers.map((p) => (p.id === id ? { ...p, ...data } : p))
      saveProviders(providers)
      return { providers }
    })
  },

  removeProvider: (id) => {
    set((state) => {
      const providers = state.providers.filter((p) => p.id !== id)
      saveProviders(providers)
      return { providers }
    })
  },

  setActiveProvider: (id) => {
    set((state) => {
      const providers = state.providers.map((p) => ({ ...p, isActive: p.id === id }))
      saveProviders(providers)
      return { providers }
    })
  },

  getActiveProvider: () => get().providers.find((p) => p.isActive),
}))

export { PROVIDER_DEFAULTS }
