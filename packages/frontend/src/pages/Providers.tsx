import { useState } from 'react'
import ProviderCard from '@/components/ProviderCard'
import ProviderForm from '@/components/ProviderForm'
import { useProviderStore } from '@/stores/provider-store'
import { useT } from '@/lib/i18n/store'
import { Button } from '@/components/ui/button'
import { Plus, Server } from 'lucide-react'

export default function Providers() {
  const { providers } = useProviderStore()
  const t = useT()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editProvider = editingId ? providers.find((p) => p.id === editingId) : undefined

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('providers.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('providers.desc')}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> {t('providers.add')}
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Server className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground mb-2">{t('providers.empty')}</p>
          <p className="text-sm text-muted-foreground mb-6">{t('providers.emptyDesc')}</p>
          <Button onClick={() => setShowForm(true)}>{t('providers.addFirst')}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              onEdit={() => setEditingId(p.id)}
            />
          ))}
        </div>
      )}

      <ProviderForm
        open={showForm || !!editingId}
        onOpenChange={(open) => {
          setShowForm(open)
          if (!open) setEditingId(null)
        }}
        editProvider={editProvider}
      />
    </div>
  )
}
