import { useRef, useEffect } from 'react'
import { useT } from '@/lib/i18n/store'
import { Eye, FileCode } from 'lucide-react'

interface StreamingOutputProps {
  html: string
  isLoading: boolean
  mode?: 'free' | 'fixed'
}

export default function StreamingOutput({ html, isLoading, mode }: StreamingOutputProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const t = useT()

  useEffect(() => {
    if (iframeRef.current && html && mode !== 'fixed') {
      iframeRef.current.srcdoc = html
    }
  }, [html, mode])

  if (!html && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
        <Eye className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">{t('editor.previewPlaceholder')}</p>
      </div>
    )
  }

  return (
    <div className="relative bg-white">
      {isLoading && (
        <div className="sticky top-0 z-10 flex items-center gap-2 bg-status-warning/5 border-b border-status-warning/20 px-4 py-2 text-xs text-status-warning">
          {mode === 'fixed' ? (
            <FileCode className="w-3 h-3" />
          ) : (
            <span className="animate-spin h-3 w-3 border-2 border-status-warning border-t-transparent rounded-full" />
          )}
          {t('editor.streaming')}
          {html && <span className="ml-auto">{(html.length / 1024).toFixed(1)} KB</span>}
        </div>
      )}
      {mode === 'fixed' ? (
        <div className="overflow-auto p-4 font-mono text-xs leading-relaxed" style={{ height: '600px' }}>
          {html ? (
            <pre className="text-gray-700 whitespace-pre-wrap break-all">{html}</pre>
          ) : (
            !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Eye className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">{t('editor.previewPlaceholder')}</p>
              </div>
            )
          )}
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts"
          className="w-full border-0"
          style={{ height: '600px' }}
          title="Report Preview"
        />
      )}
    </div>
  )
}
