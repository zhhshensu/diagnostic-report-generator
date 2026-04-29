import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { zhCN } from './locales/zh-CN'
import { enUS } from './locales/en-US'

export type Language = 'zh-CN' | 'en-US'

const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

type TranslationKey = keyof typeof zhCN

interface I18nStore {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

export function useT() {
  const language = useI18nStore((s) => s.language)
  const store = useI18nStore
  return (key: TranslationKey, params?: Record<string, string | number>) => {
    const locale = locales[store.getState().language]
    let text = locale[key] as string
    if (!text) {
      text = zhCN[key] as string || key
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v))
      })
    }
    return text
  }
}

export function useLanguage() {
  return useI18nStore((s) => s.language)
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set, get) => ({
      language: 'zh-CN',
      setLanguage: (language) => set({ language }),
      t: (key, params) => {
        const locale = locales[get().language]
        let text = locale[key] as string
        if (!text) {
          // fallback to zh-CN
          text = zhCN[key] as string || key
        }
        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, String(v))
          })
        }
        return text
      },
    }),
    { name: 'diagnostic-report-language' },
  ),
)
