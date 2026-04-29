import { Badge } from '@/components/ui/badge'
import { useT } from '@/lib/i18n/store'

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const t = useT()
  switch (status) {
    case 'completed': return <Badge variant="success">{t('status.completed')}</Badge>
    case 'generating': return <Badge variant="warning">{t('status.generating')}</Badge>
    case 'error': return <Badge variant="destructive">{t('status.error')}</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}
