/**
 * Fixed-mode report schema.
 * In fixed mode, the LLM outputs structured JSON conforming to this schema,
 * and the frontend renders it using pre-built React components.
 */

export type MetricStatus = 'normal' | 'warning' | 'critical'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type Priority = 'p0' | 'p1' | 'p2' | 'p3'

export interface Metric {
  name: string
  value: string
  threshold: string
  status: MetricStatus
  description: string
}

export interface Issue {
  type: MetricStatus
  text: string
}

export interface Suggestion {
  priority: Priority
  title: string
  description: string
  effort: string
  category: string
}

export interface ReportSchema {
  /** Report title */
  title: string
  /** Diagnostic subject */
  subject: string
  /** Optional remarks */
  remarks?: string
  /** Report ID */
  reportId: string
  /** Generation timestamp */
  generatedAt: string
  /** Metrics data table */
  metrics: Metric[]
  /** Diagnosis summary */
  summary: {
    /** Overall score (0-100) */
    score: number
    /** Risk level */
    riskLevel: RiskLevel
    /** Core issues list */
    issues: Issue[]
    /** Key findings text */
    keyFindings: string
  }
  /** Optimization suggestions */
  suggestions: Suggestion[]
}

/**
 * Convert a ReportSchema to a complete, self-contained HTML document.
 * Used for copy-to-clipboard, download, and PDF generation in fixed mode.
 */
export function schemaToHtml(data: ReportSchema): string {
  const statusLabel = (s: MetricStatus) =>
    s === 'normal' ? '正常' : s === 'warning' ? '警告' : '异常'
  const riskLabel = (r: RiskLevel) =>
    r === 'low' ? '低风险' : r === 'medium' ? '中风险' : r === 'high' ? '高风险' : '严重'
  const priorityLabel = (p: Priority) =>
    p === 'p0' ? 'P0 立即' : p === 'p1' ? 'P1 高优' : p === 'p2' ? 'P2 中优' : 'P3 低优'

  const scoreColor =
    data.summary.score >= 80 ? '#22c55e' : data.summary.score >= 60 ? '#eab308' : '#ef4444'

  const metricsRows = data.metrics
    .map(
      (m) => `
            <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <td class="py-3 px-3 font-medium text-gray-800">${m.name}</td>
              <td class="py-3 px-3 text-right font-mono text-gray-800">${m.value}</td>
              <td class="py-3 px-3 text-right font-mono text-gray-400">${m.threshold}</td>
              <td class="py-3 px-3 text-center"><span class="status-${m.status}">${statusLabel(m.status)}</span></td>
              <td class="py-3 px-3 text-gray-500 max-w-[200px]">${m.description || '—'}</td>
            </tr>`,
    )
    .join('')

  const issuesList = data.summary.issues
    .map(
      (iss) => `
            <li class="flex items-start gap-2 text-sm text-gray-600">
              <span class="dot-${iss.type} mt-1.5 shrink-0"></span>
              <span>${iss.text}</span>
            </li>`,
    )
    .join('')

  const suggestionsCards = data.suggestions
    .map(
      (s) => `
            <div class="border border-gray-200 rounded-lg p-4 report-card hover:bg-gray-50/30 transition-colors">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold priority-${s.priority}">${s.priority.toUpperCase()}</span>
                    <h3 class="text-sm font-semibold text-gray-800">${s.title}</h3>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">${s.description}</p>
                  <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>${s.effort}</span>
                    <span>${s.category}</span>
                  </div>
                </div>
              </div>
            </div>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - 诊断报告</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif; }
    .status-normal { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.125rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: #f0fdf4; color: #15803d; }
    .status-normal::before { content: ''; display: inline-block; width: 0.5rem; height: 0.5rem; border-radius: 9999px; background: #22c55e; }
    .status-warning { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.125rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: #fefce8; color: #a16207; }
    .status-warning::before { content: ''; display: inline-block; width: 0; height: 0; border-left: 0.3rem solid transparent; border-right: 0.3rem solid transparent; border-bottom: 0.5rem solid #eab308; }
    .status-critical { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.125rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: #fef2f2; color: #b91c1c; }
    .status-critical::before { content: ''; display: inline-block; width: 0.5rem; height: 0.5rem; transform: rotate(45deg); background: #ef4444; }
    .risk-low { background: #f0fdf4; color: #15803d; }
    .risk-medium { background: #fefce8; color: #a16207; }
    .risk-high { background: #fff7ed; color: #c2410c; }
    .risk-critical { background: #fef2f2; color: #b91c1c; }
    .priority-p0 { background: #fef2f2; color: #b91c1c; }
    .priority-p1 { background: #fff7ed; color: #c2410c; }
    .priority-p2 { background: #fefce8; color: #a16207; }
    .priority-p3 { background: #f0fdf4; color: #15803d; }
    .score-ring { width: 8rem; height: 8rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 2.25rem; font-weight: 700; position: relative; }
    .score-ring::before { content: ''; position: absolute; inset: 0.25rem; border-radius: 9999px; background: white; }
    .score-ring span { position: relative; z-index: 1; }
    .report-card { transition: box-shadow 0.2s ease; }
    .report-card:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    .dot-normal { width: 0.625rem; height: 0.625rem; border-radius: 9999px; background: #22c55e; display: inline-block; }
    .dot-warning { width: 0; height: 0; border-left: 0.35rem solid transparent; border-right: 0.35rem solid transparent; border-bottom: 0.6rem solid #eab308; display: inline-block; }
    .dot-critical { width: 0.625rem; height: 0.625rem; transform: rotate(45deg); background: #ef4444; display: inline-block; }
    @media print { body { background: white !important; } .report-card { break-inside: avoid; box-shadow: none !important; border: 1px solid #e5e7eb !important; } }
  </style>
</head>
<body class="bg-gray-50 min-h-screen p-4 md:p-6 lg:p-8">
  <div class="max-w-6xl mx-auto">

    <!-- SECTION 1: Report Header -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6 report-card">
      <div class="flex items-center gap-3 mb-3">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">${data.title}</h1>
      </div>
      <div class="space-y-1.5 text-sm text-gray-500 ml-6">
        <p><span class="font-medium text-gray-700">诊断主体：</span>${data.subject}</p>
        ${data.remarks ? `<p><span class="font-medium text-gray-700">备注说明：</span>${data.remarks}</p>` : ''}
      </div>
      <div class="flex flex-wrap items-center gap-4 mt-4 ml-6">
        <div class="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
          <p class="text-gray-400 text-xs">报告编号</p>
          <p class="text-gray-800 font-mono font-medium text-xs">${data.reportId}</p>
        </div>
        <div class="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
          <p class="text-gray-400 text-xs">生成时间</p>
          <p class="text-gray-800 font-medium text-xs">${data.generatedAt}</p>
        </div>
      </div>
    </div>

    <!-- SECTION 2: Metrics Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6 report-card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">指标监测数据</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b-2 border-gray-100">
              <th class="text-left py-3 px-3 font-semibold text-gray-600 text-xs uppercase">指标名称</th>
              <th class="text-right py-3 px-3 font-semibold text-gray-600 text-xs uppercase">监测值</th>
              <th class="text-right py-3 px-3 font-semibold text-gray-600 text-xs uppercase">标准阈值</th>
              <th class="text-center py-3 px-3 font-semibold text-gray-600 text-xs uppercase">健康状态</th>
              <th class="text-left py-3 px-3 font-semibold text-gray-600 text-xs uppercase">异常说明</th>
            </tr>
          </thead>
          <tbody>
            ${metricsRows}
          </tbody>
        </table>
      </div>
    </div>

    <!-- SECTION 3: Diagnosis Summary -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6 report-card">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">诊断综述</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="flex flex-col items-center">
          <div class="score-ring" style="background: conic-gradient(${scoreColor} ${data.summary.score}%, #e5e7eb 0);">
            <span style="color: ${scoreColor};">${data.summary.score}</span>
          </div>
          <p class="text-sm text-gray-500 mt-3">综合评分</p>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mt-1 risk-${data.summary.riskLevel}">${riskLabel(data.summary.riskLevel)}</span>
        </div>
        <div class="md:col-span-2 space-y-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">核心问题</h3>
          <ul class="space-y-2">
            ${issuesList}
          </ul>
          <div class="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p class="text-xs text-blue-600 font-medium mb-1">核心发现</p>
            <p class="text-sm text-blue-800">${data.summary.keyFindings}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION 4: Optimization Suggestions -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6 report-card">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">优化建议</h2>
      <div class="space-y-3">
        ${suggestionsCards}
      </div>
    </div>

    <!-- SECTION 5: Footer -->
    <footer class="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
      ${data.title} — ${data.reportId} — ${data.generatedAt}
    </footer>

  </div>
</body>
</html>`
}
