import { useState, useEffect } from 'react'
import { LLMProvider, ProviderType, PROVIDER_DEFAULTS, useProviderStore } from '@/stores/provider-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { useUIStore } from '@/stores/ui-store'
import { useT } from '@/lib/i18n/store'

const providerTypes: { value: ProviderType; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'azure', label: 'Azure OpenAI' },
  { value: 'ollama', label: 'Ollama' },
  { value: 'custom', label: 'Custom' },
]

interface ProviderFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editProvider?: LLMProvider
}

export default function ProviderForm({ open, onOpenChange, editProvider }: ProviderFormProps) {
  const { addProvider, updateProvider } = useProviderStore()
  const { addToast } = useUIStore()
  const t = useT()

  const [type, setType] = useState<ProviderType>(editProvider?.type || 'openai')
  const [name, setName] = useState(editProvider?.name || '')
  const [apiKey, setApiKey] = useState(editProvider?.apiKey || '')
  const [baseUrl, setBaseUrl] = useState(editProvider?.baseUrl || PROVIDER_DEFAULTS.openai.baseUrl)
  const [model, setModel] = useState(editProvider?.model || PROVIDER_DEFAULTS.openai.model)

  // Sync form state when editProvider changes (editing different provider)
  useEffect(() => {
    if (editProvider) {
      setType(editProvider.type)
      setName(editProvider.name)
      setApiKey(editProvider.apiKey)
      setBaseUrl(editProvider.baseUrl)
      setModel(editProvider.model)
    } else {
      const defaults = PROVIDER_DEFAULTS.openai
      setType('openai')
      setName('')
      setApiKey('')
      setBaseUrl(defaults.baseUrl)
      setModel(defaults.model)
    }
  }, [editProvider])

  const handleTypeChange = (val: string) => {
    const t = val as ProviderType
    setType(t)
    if (!editProvider) {
      setBaseUrl(PROVIDER_DEFAULTS[t].baseUrl)
      setModel(PROVIDER_DEFAULTS[t].model)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      addToast(t('providers.nameRequired'), 'error')
      return
    }
    if (editProvider) {
      updateProvider(editProvider.id, { name, type, apiKey, baseUrl, model })
      addToast(t('providers.updated'), 'success')
    } else {
      addProvider({ name, type, apiKey, baseUrl, model, isActive: false })
      addToast(t('providers.added'), 'success')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editProvider ? t('providers.edit') : t('providers.add')}</DialogTitle>
          <DialogDescription>{t('providers.desc')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('providers.name')}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Provider" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('providers.type')}</label>
            <Select value={type} onValueChange={handleTypeChange}>
              {providerTypes.map((pt) => (
                <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('providers.baseUrl')}</label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('providers.model')}</label>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4o" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('providers.apiKey')}</label>
            <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" placeholder="sk-..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button type="submit">{editProvider ? t('common.save') : t('providers.add')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
