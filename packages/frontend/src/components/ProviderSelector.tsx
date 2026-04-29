import { useProviderStore } from '@/stores/provider-store'
import { useT } from '@/lib/i18n/store'
import { Select, SelectItem } from '@/components/ui/select'

interface ProviderSelectorProps {
  selectedProviderId: string
  onProviderChange: (id: string) => void
  model: string
  onModelChange: (model: string) => void
  disabled?: boolean
}

export default function ProviderSelector({
  selectedProviderId,
  onProviderChange,
  model,
  onModelChange,
  disabled,
}: ProviderSelectorProps) {
  const { providers } = useProviderStore()
  const t = useT()
  const selected = providers.find((p) => p.id === selectedProviderId)

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">{t('providers.type')}</label>
        {providers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('providers.emptyDesc')}</p>
        ) : (
          <Select value={selectedProviderId} onValueChange={onProviderChange} disabled={disabled}>
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name} ({p.type})</SelectItem>
            ))}
          </Select>
        )}
      </div>
      {selected && (
        <div>
          <label className="text-sm font-medium mb-1 block">{t('providers.model')}</label>
          <input
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            placeholder="gpt-4o"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}
