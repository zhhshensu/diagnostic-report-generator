import { LLMProvider, ProviderType, PROVIDER_DEFAULTS, useProviderStore } from '@/stores/provider-store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { useT } from '@/lib/i18n/store'
import { Play, Edit, Trash2, CheckCircle, Wifi } from 'lucide-react'

const PROVIDER_LABELS: Record<ProviderType, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  azure: 'Azure OpenAI',
  ollama: 'Ollama',
  custom: 'Custom',
}

const PROVIDER_COLORS: Record<ProviderType, string> = {
  openai: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  anthropic: 'bg-orange-100 text-orange-800 border-orange-200',
  gemini: 'bg-blue-100 text-blue-800 border-blue-200',
  azure: 'bg-sky-100 text-sky-800 border-sky-200',
  ollama: 'bg-purple-100 text-purple-800 border-purple-200',
  custom: 'bg-gray-100 text-gray-800 border-gray-200',
}

interface ProviderCardProps {
  provider: LLMProvider
  onEdit: () => void
}

export default function ProviderCard({ provider, onEdit }: ProviderCardProps) {
  const { removeProvider, setActiveProvider } = useProviderStore()
  const { addToast } = useUIStore()
  const t = useT()

  const handleTest = async () => {
    addToast(t('providers.testing'), 'info')
    try {
      const res = await fetch(`${provider.baseUrl}/models`, {
        headers: provider.apiKey
          ? { Authorization: `Bearer ${provider.apiKey}` }
          : {},
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        addToast(t('providers.testSuccess'), 'success')
      } else {
        addToast(t('providers.testFail', { status: String(res.status) }), 'error')
      }
    } catch {
      addToast(t('providers.testTimeout'), 'error')
    }
  }

  return (
    <Card className={`relative transition-shadow hover:shadow-md ${provider.isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold truncate">{provider.name}</h3>
              <Badge className={PROVIDER_COLORS[provider.type]}>
                {PROVIDER_LABELS[provider.type]}
              </Badge>
              {provider.isActive && (
                <Badge variant="default" className="text-xs gap-1">
                  <CheckCircle className="w-3 h-3" /> {t('providers.active')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono truncate">{provider.model}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => { setActiveProvider(provider.id); addToast(t('providers.activated'), 'success') }}
          >
            <CheckCircle className="w-3.5 h-3.5" /> {t('providers.activate')}
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleTest}>
            <Wifi className="w-3.5 h-3.5" /> {t('providers.test')}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1" onClick={onEdit}>
            <Edit className="w-3.5 h-3.5" /> {t('common.edit')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={() => { removeProvider(provider.id); addToast(t('providers.removed'), 'info') }}
          >
            <Trash2 className="w-3.5 h-3.5" /> {t('common.delete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export { PROVIDER_LABELS, PROVIDER_COLORS }
