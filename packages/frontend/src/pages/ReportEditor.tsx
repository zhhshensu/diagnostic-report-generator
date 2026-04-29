import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProviderStore } from '@/stores/provider-store'
import { useReportStore } from '@/stores/report-store'
import { useUIStore } from '@/stores/ui-store'
import { useT, useLanguage } from '@/lib/i18n/store'
import { generateReport } from '@/lib/llm-client'
import { generateId } from '@/lib/utils'
import type { ReportMode } from '@/lib/skill-prompt'
import ProviderSelector from '@/components/ProviderSelector'
import StreamingOutput from '@/components/StreamingOutput'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Send, X, Sparkles, FileText, LayoutTemplate, Palette } from 'lucide-react'

const SAMPLE_PROMPTS = [
  'Generate a system health check report for a production server cluster with CPU, memory, disk, and network metrics',
  'Create a database performance diagnostic report covering query latency, connection pool, cache hit ratio, and replication lag',
  'Generate a network security audit report with firewall rules, intrusion detection, vulnerability scan, and compliance status',
]

export default function ReportEditor() {
  const navigate = useNavigate()
  const t = useT()
  const language = useLanguage()
  const { providers, getActiveProvider } = useProviderStore()
  const { addReport, updateReport } = useReportStore()
  const { addToast } = useUIStore()

  const activeProvider = getActiveProvider()
  const [selectedProviderId, setSelectedProviderId] = useState(activeProvider?.id || '')
  const [model, setModel] = useState(activeProvider?.model || '')
  const [prompt, setPrompt] = useState('')
  const [reportMode, setReportMode] = useState<ReportMode>('fixed')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamedHtml, setStreamedHtml] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const selectedProvider = providers.find((p) => p.id === selectedProviderId)

  const handleGenerate = async () => {
    if (!selectedProvider || !model || !prompt.trim()) {
      addToast(t('editor.providerRequired'), 'error')
      return
    }

    const reportId = generateId()
    addReport({
      id: reportId,
      name: prompt.slice(0, 50),
      html: '',
      provider: selectedProvider.name,
      model,
      status: 'generating',
      mode: reportMode,
    })

    setIsGenerating(true)
    setStreamedHtml('')
    abortRef.current = new AbortController()

    // Construct provider-specific extra body params (e.g. DeepSeek needs thinking/reasoning_effort)
    const isDeepSeek =
      selectedProvider.baseUrl.toLowerCase().includes('deepseek') ||
      model.toLowerCase().includes('deepseek')
    const extraBody = isDeepSeek
      ? { thinking: { type: 'enabled' }, reasoning_effort: 'high' }
      : undefined

    const result = await generateReport(
      {
        provider: { ...selectedProvider, model },
        userInput: prompt,
        mode: reportMode,
        language,
        extraBody,
      },
      (content) => {
        setStreamedHtml(content)
        if (reportMode === 'fixed') {
          try {
            const parsed = JSON.parse(content)
            const title = parsed.title || prompt.slice(0, 50)
            updateReport(reportId, { html: content, name: title })
          } catch {
            updateReport(reportId, { html: content })
          }
        } else {
          updateReport(reportId, {
            html: content,
            name: content.match(/<title>(.*?)<\/title>/)?.[1] || prompt.slice(0, 50),
          })
        }
      },
      abortRef.current.signal,
    )

    setIsGenerating(false)

    if (result.error === 'cancelled') {
      updateReport(reportId, { status: 'error', error: 'Cancelled' })
      addToast(t('editor.cancelled'), 'info')
      return
    }

    if (result.error) {
      updateReport(reportId, { status: 'error', error: result.error })
      addToast(result.error, 'error')
      return
    }

    let score: number | undefined
    let name: string = prompt.slice(0, 50)

    if (reportMode === 'fixed' && result.schema) {
      score = result.schema.summary.score
      name = result.schema.title
    } else {
      const scoreMatch = result.html.match(/(\d{1,3})\s*分/i) || result.html.match(/(\d+)\s*\/\s*100/)
      score = scoreMatch ? parseInt(scoreMatch[1]) : undefined
      const titleMatch = result.html.match(/<title>(.*?)<\/title>/)
      name = titleMatch?.[1] || prompt.slice(0, 50)
    }

    updateReport(reportId, { html: result.html, status: 'completed', score, name })
    addToast(t('editor.generated'), 'success')
    navigate(`/reports/${reportId}`)
  }

  const handleCancel = () => {
    abortRef.current?.abort()
    setIsGenerating(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{t('editor.title')}</h1>
        {isGenerating && (
          <span className="inline-flex items-center gap-1.5 text-sm text-status-warning">
            <span className="animate-spin h-3 w-3 border-2 border-status-warning border-t-transparent rounded-full" />
            {t('editor.generating')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Input Panel */}
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProviderSelector
                selectedProviderId={selectedProviderId}
                onProviderChange={(id) => {
                  setSelectedProviderId(id)
                  const p = providers.find((pr) => pr.id === id)
                  if (p) setModel(p.model)
                }}
                model={model}
                onModelChange={setModel}
                disabled={isGenerating}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                {t('editor.mode')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReportMode('fixed')}
                  disabled={isGenerating}
                  className={`relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm transition-colors ${
                    reportMode === 'fixed'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-muted-foreground hover:border-gray-300 hover:bg-accent'
                  }`}
                >
                  <LayoutTemplate className="w-5 h-5" />
                  <span className="font-medium text-xs">{t('editor.modeFixed')}</span>
                  <span className="text-[10px] opacity-70">{t('editor.modeFixedDesc')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportMode('free')}
                  disabled={isGenerating}
                  className={`relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm transition-colors ${
                    reportMode === 'free'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-muted-foreground hover:border-gray-300 hover:bg-accent'
                  }`}
                >
                  <Palette className="w-5 h-5" />
                  <span className="font-medium text-xs">{t('editor.modeFree')}</span>
                  <span className="text-[10px] opacity-70">{t('editor.modeFreeDesc')}</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  {t('editor.prompt')}
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  {prompt.length} {t('editor.chars')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('editor.placeholder')}
                disabled={isGenerating}
                rows={10}
                className="resize-none"
              />

              <div>
                <p className="text-xs text-muted-foreground mb-2">{t('editor.samplePrompts')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PROMPTS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className="text-xs bg-muted px-2.5 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground text-left transition-colors max-w-full truncate"
                      onClick={() => setPrompt(s)}
                      disabled={isGenerating}
                    >
                      {s.slice(0, 45)}...
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedProvider || !prompt.trim()}
              className="flex-1 gap-2"
              size="lg"
            >
              {isGenerating ? (
                <><span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> {t('editor.generating')}</>
              ) : (
                <><Send className="w-4 h-4" /> {t('editor.generate')}</>
              )}
            </Button>
            {isGenerating && (
              <Button variant="destructive" onClick={handleCancel} className="gap-2" size="lg">
                <X className="w-4 h-4" /> {t('editor.cancel')}
              </Button>
            )}
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="xl:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                {t('editor.livePreview')}
                {isGenerating && streamedHtml && (
                  <span className="text-xs text-muted-foreground font-normal ml-auto">
                    {(streamedHtml.length / 1024).toFixed(1)} KB
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <StreamingOutput html={streamedHtml} isLoading={isGenerating} mode={reportMode} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
