import { useCopyToClipboard } from '@reactuses/core'
import { useReportStore } from '@/stores/report-store'
import { useUIStore } from '@/stores/ui-store'
import { useT } from '@/lib/i18n/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Code, Link, Share2 } from 'lucide-react'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
}

export default function ShareDialog({ open, onOpenChange, reportId }: ShareDialogProps) {
  const { getReport, generateShareId } = useReportStore()
  const { addToast } = useUIStore()
  const t = useT()
  const [, copyToClipboard] = useCopyToClipboard()
  const report = getReport(reportId)

  const shareId = report?.shareId || generateShareId(reportId)
  const shareUrl = `${window.location.origin}/shared/${shareId}`
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="800px" frameborder="0"></iframe>`

  const handleCopy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text)
    } catch {
      // fallback: 直接使用原生 clipboard API
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        // 剪贴板不可用时，提示用户手动复制
      }
    }
    addToast(t('share.copied', { label }), 'success')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-4 h-4" /> {t('share.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-muted-foreground" /> {t('share.link')}
            </label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={() => handleCopy(shareUrl, t('share.link'))}>
                <Copy className="w-3.5 h-3.5" /> {t('common.copy')}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-muted-foreground" /> {t('share.embed')}
            </label>
            <div className="flex gap-2">
              <Input value={embedCode} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={() => handleCopy(embedCode, t('share.embed'))}>
                <Copy className="w-3.5 h-3.5" /> {t('common.copy')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
