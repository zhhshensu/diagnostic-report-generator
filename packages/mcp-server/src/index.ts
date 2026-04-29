#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

type PromptLang = 'zh' | 'en'

function buildSystemPrompt(lang: PromptLang = 'zh'): string {
  const statusZh = lang === 'zh' ? '正常/警告/异常' : 'Normal/Warning/Critical'
  const riskLevels = lang === 'zh'
    ? '低风险（Low Risk）/ 中风险（Medium Risk）/ 高风险（High Risk）/ 严重（Critical）'
    : 'Low Risk / Medium Risk / High Risk / Critical'

  return `You are a diagnostic report generator. Generate a standalone HTML diagnostic report.
Output ONLY the complete HTML file. No explanations, no markdown wrapping.
The HTML must include:
1. Report header with title, ID, timestamp, subject, notes
2. Metrics data table with health status badges (${statusZh})
3. Data visualization area with Chart.js charts (at least 2 types)
4. Health status labels (green circle=normal, yellow triangle=warning, red diamond=critical)
5. Comprehensive diagnosis summary with score, risk level, core issues
6. Optimization suggestions with priority indicators (P0/P1/P2/P3)

Use ${lang === 'zh' ? 'Chinese' : 'English'} for all user-facing labels and text in the report.

Use Tailwind CSS via CDN and Chart.js via CDN. The file must work standalone in a browser.

Technology Stack:
- Styling: Tailwind CSS (CDN)
- Charts: Chart.js (CDN) - bar, line, doughnut, radar as appropriate
- Layout: Responsive, card-based, risk-control color scheme
- Colors: Green (#22c55e) for normal, Yellow (#eab308) for warning, Red (#ef4444) for critical

Label mapping (${lang === 'zh' ? 'Chinese primary, English in parentheses' : 'English primary, Chinese in parentheses'}):
- 诊断主体（Subject）
- 备注说明（Notes）
- 指标名称（Metric） | 监测值（Value） | 标准阈值（Threshold） | 健康状态（Status） | 异常说明（Description）
- 正常（Normal）
- 警告（Warning）
- 异常（Critical）
- 综合评分（Overall Score）
- 核心发现（Key Findings）
- ${riskLevels}`
}

async function callLLM(provider: { type: string; apiKey: string; baseUrl: string; model: string }, userInput: string, lang: PromptLang): Promise<string> {
  const isOllama = provider.type === 'ollama'

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(provider.apiKey && !isOllama ? { Authorization: `Bearer ${provider.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: buildSystemPrompt(lang) },
        { role: 'user', content: userInput },
      ],
      temperature: 0.3,
      max_tokens: 16384,
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`API error ${response.status}: ${errBody}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

const server = new Server(
  { name: 'diagnostic-report-generator', version: '0.1.0' },
  { capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'diagnostic-report-generator',
      description: 'Generate a standalone HTML diagnostic report with interactive charts, metrics tables, health status visualization, and optimization recommendations.',
      inputSchema: {
        type: 'object',
        properties: {
          userInput: {
            type: 'string',
            description: 'Natural language description of the diagnostic report to generate',
          },
          language: {
            type: 'string',
            description: 'Language for report labels and text: "zh-CN" (Chinese, default) or "en-US" (English)',
            enum: ['zh-CN', 'en-US'],
          },
          provider: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'Provider type (openai, anthropic, gemini, azure, ollama, custom)',
              },
              apiKey: {
                type: 'string',
                description: 'API key for the provider',
              },
              baseUrl: {
                type: 'string',
                description: 'Base URL for the provider API',
              },
              model: {
                type: 'string',
                description: 'Model name to use',
              },
            },
            required: ['type', 'baseUrl', 'model'],
          },
        },
        required: ['userInput', 'provider'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'diagnostic-report-generator') {
    throw new Error(`Unknown tool: ${request.params.name}`)
  }

  const args = request.params.arguments as { userInput: string; language?: string; provider: { type: string; apiKey: string; baseUrl: string; model: string } }
  if (!args?.userInput || !args?.provider) {
    throw new Error('Missing required arguments: userInput and provider')
  }

  const lang: PromptLang = args.language === 'en-US' ? 'en' : 'zh'

  try {
    const html = await callLLM(args.provider, args.userInput, lang)
    return {
      content: [{ type: 'text', text: html }],
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error generating report: ${(error as Error).message}` }],
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Diagnostic Report MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
