import { buildSystemPrompt, ReportMode, toPromptLang } from './skill-prompt'
import type { ReportSchema } from './report-schema'

const CDN_TAILWIND = '<script src="https://cdn.tailwindcss.com"></script>'
const CDN_CHARTJS = '<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>'
const CDN_FAVICON = '<link rel="icon" type="image/svg+xml" href=\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%233b82f6"/><stop offset="100%" stop-color="%238b5cf6"/></linearGradient></defs><rect width="32" height="32" rx="6" fill="url(%23b)"/><path d="M8 20h16v2H8zm0-5h16v2H8zm0-5h12v2H8z" fill="%23fff" opacity=".9"/><rect x="20" y="6" width="5" height="14" rx="1" fill="%2322c55e" opacity=".9"/><rect x="14" y="9" width="5" height="11" rx="1" fill="%2322c55e" opacity=".7"/><rect x="8" y="12" width="5" height="8" rx="1" fill="%2322c55e" opacity=".5"/></svg>\' />'

/** Extract and parse JSON content from ```json ... ``` fences */
function parseJsonFences(raw: string): { json: string; parsed?: ReportSchema } {
  let json = raw.trim()
  // Strip ```json ... ``` fences
  json = json.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '')
  json = json.trim()
  try {
    return { json, parsed: JSON.parse(json) as ReportSchema }
  } catch {
    return { json }
  }
}

function postProcessHtml(raw: string, mode: ReportMode): string {
  if (mode === 'fixed') {
    return parseJsonFences(raw).json
  }
  // Free mode: strip ```html fences (wherever they appear, not just at string boundaries)
  let clean = raw
    .replace(/^[\s\S]*?```html\s*/i, '')  // Remove everything before and including opening ```html
    .replace(/```[\s\S]*$/i, '')            // Remove everything after and including closing ```
    .trim()
  clean = clean.replace(/<!--CDN_FAVICON-->/g, CDN_FAVICON)
  clean = clean.replace(/<!--CDN_TAILWIND-->/g, CDN_TAILWIND)
  clean = clean.replace(/<!--CDN_CHARTJS-->/g, CDN_CHARTJS)
  return clean
}

/** Exported for use in streaming preview processing */
export { postProcessHtml }

export interface LLMRequest {
  provider: {
    type: string
    apiKey: string
    baseUrl: string
    model: string
  }
  userInput: string
  systemPrompt?: string
  /** Report generation mode: 'free' (Chart.js, flexible) or 'fixed' (CSS-only, strict components) */
  mode?: ReportMode
  /** Language for report content: 'zh-CN' (default) or 'en-US' */
  language?: string
  /** Provider-specific extra body params (e.g. { thinking: { type: "enabled" }, reasoning_effort: "high" } for DeepSeek) */
  extraBody?: Record<string, unknown>
}

export interface LLMResponse {
  /** For free mode: the generated HTML. For fixed mode: the JSON string (or empty). */
  html: string
  /** Parsed report schema (only available in fixed mode on success) */
  schema?: ReportSchema
  error?: string
}

export async function generateReport(
  request: LLMRequest,
  onChunk?: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<LLMResponse> {
  const { provider, userInput, systemPrompt, extraBody, mode = 'free', language } = request

  // Build system prompt based on mode and language
  const lang = toPromptLang(language)
  const systemMessage = systemPrompt || buildSystemPrompt(mode, lang)

  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userInput },
  ]

  const isOllama = provider.type === 'ollama'

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(provider.apiKey && !isOllama ? { Authorization: `Bearer ${provider.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        stream: !!onChunk,
        temperature: 0.3,
        max_tokens: 16384,
        ...extraBody,
      }),
      signal,
    })

    if (!response.ok) {
      const errBody = await response.text().catch(() => '')
      return { html: '', error: `API error ${response.status}: ${errBody}` }
    }

    if (onChunk && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullHtml = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content || ''
            if (content) {
              fullHtml += content
              onChunk(fullHtml)
            }
          } catch {
            // non-JSON chunk, skip
          }
        }
      }
      const processedHtml = postProcessHtml(fullHtml, mode)
      const { parsed } = parseJsonFences(fullHtml)
      return { html: processedHtml, schema: parsed }
    } else {
      const data = await response.json()
      const html = data.choices?.[0]?.message?.content || ''
      const processedHtml = postProcessHtml(html, mode)
      const { parsed } = parseJsonFences(html)
      return { html: processedHtml, schema: parsed }
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { html: '', error: 'cancelled' }
    }
    return { html: '', error: (err as Error).message }
  }
}
