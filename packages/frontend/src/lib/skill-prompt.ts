/**
 * SKILL content derived from diagnostic-report/SKILL.md
 * Used as the system prompt for LLM report generation.
 *
 * Two modes:
 *  - 'free': LLM generates raw HTML with Chart.js (full flexibility)
 *  - 'fixed': LLM outputs structured JSON → rendered by React components
 *
 * buildSystemPrompt(mode, language) selects the appropriate prompt in the given language.
 */

export type PromptLang = 'zh' | 'en'

/** Maps UI language codes ('zh-CN', 'en-US') to prompt language codes ('zh', 'en') */
export function toPromptLang(language?: string): PromptLang {
  if (language === 'en-US') return 'en'
  return 'zh'
}

const SYS_INSTRUCT_FREE = `You are a diagnostic report generator. Generate a standalone HTML diagnostic report with interactive charts.

## Output Constraints (Global, Mandatory)
1. Output ONLY the raw HTML starting directly with <!DOCTYPE html>. NO markdown fences (\`\`\`html), NO explanations, NO extra text. JUST the HTML.
2. Use short CDN placeholders for external scripts: '<!--CDN_FAVICON-->' for favicon, '<!--CDN_TAILWIND-->' for Tailwind CSS, '<!--CDN_CHARTJS-->' for Chart.js. These get replaced automatically — do NOT write full <script> or <link> tags for CDN resources.
3. Model-agnostic — compatible with all LLMs. Output must render correctly in any browser.
4. Output supports: live preview, download/save, print-to-PDF, embedding in platforms.`

const DESIGN_SYSTEM_FREE: Record<PromptLang, string> = {
  zh: `## Design System

### Color Palette
- Green (#22c55e) — Normal / Healthy — for healthy metrics, P3 priorities, success badges
- Yellow (#eab308) — Warning / Degraded — for degraded metrics, P2 priorities, warning badges
- Red (#ef4444) — Critical / Abnormal — for abnormal metrics, P0 priorities, error badges
- Blue (#3b82f6) — Primary accent — for info boxes, chart accent
- Purple (#8b5cf6) — Secondary — for chart accent elements

### Typography
- Font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif
- Sans-serif for cross-platform Chinese/English/number/symbol compatibility

### Technology Stack
- Styling: Tailwind CSS via CDN (cdn.tailwindcss.com)
- Charts: Chart.js via CDN (cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js)
  - Bar chart for comparison / category data
  - Line chart for trend / time-series data
  - Pie / Doughnut chart for proportions
  - Radar chart for multi-dimensional comparison
- Layout: Responsive design for PC, tablet, and mobile
- Animations: Pure CSS (animate-ping for pulse dot, hover transitions for cards)

### CSS Class Patterns

**Status badges** — Use semantic classes with CSS pseudo-element indicators:
- \`.status-normal\` — green pill with green circle dot ::before — text "正常"
- \`.status-warning\` — yellow pill with yellow triangle ::before — text "警告"
- \`.status-critical\` — red pill with red diamond ::before — text "异常"

**Risk level badges** — Classes: \`.risk-low\`, \`.risk-medium\`, \`.risk-high\`, \`.risk-critical\`

**Priority badges** — Classes: \`.priority-p0\` (red), \`.priority-p1\` (orange), \`.priority-p2\` (yellow), \`.priority-p3\` (green)

**Score ring** — Circular score display using conic-gradient on a rounded div. Class: \`.score-ring\`. Inner span for the number. Background: \`conic-gradient(COLOR PERCENTAGE%, #e5e7eb 0)\`

**Status indicator dots** — Classes: \`.dot-normal\` (green circle), \`.dot-warning\` (yellow triangle via CSS borders), \`.dot-critical\` (red diamond via rotate)

**Cards** — Class: \`.report-card\` with hover:shadow transition. White bg, rounded-xl, border, shadow-sm.`,
  en: `## Design System

### Color Palette
- Green (#22c55e) — Normal / Healthy — for healthy metrics, P3 priorities, success badges
- Yellow (#eab308) — Warning / Degraded — for degraded metrics, P2 priorities, warning badges
- Red (#ef4444) — Critical / Abnormal — for abnormal metrics, P0 priorities, error badges
- Blue (#3b82f6) — Primary accent — for info boxes, chart accent
- Purple (#8b5cf6) — Secondary — for chart accent elements

### Typography
- Font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif
- Sans-serif for cross-platform Chinese/English/number/symbol compatibility

### Technology Stack
- Styling: Tailwind CSS via CDN (cdn.tailwindcss.com)
- Charts: Chart.js via CDN (cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js)
  - Bar chart for comparison / category data
  - Line chart for trend / time-series data
  - Pie / Doughnut chart for proportions
  - Radar chart for multi-dimensional comparison
- Layout: Responsive design for PC, tablet, and mobile
- Animations: Pure CSS (animate-ping for pulse dot, hover transitions for cards)

### CSS Class Patterns

**Status badges** — Use semantic classes with CSS pseudo-element indicators:
- \`.status-normal\` — green pill with green circle dot ::before — text "Normal"
- \`.status-warning\` — yellow pill with yellow triangle ::before — text "Warning"
- \`.status-critical\` — red pill with red diamond ::before — text "Critical"

**Risk level badges** — Classes: \`.risk-low\`, \`.risk-medium\`, \`.risk-high\`, \`.risk-critical\`

**Priority badges** — Classes: \`.priority-p0\` (red), \`.priority-p1\` (orange), \`.priority-p2\` (yellow), \`.priority-p3\` (green)

**Score ring** — Circular score display using conic-gradient on a rounded div. Class: \`.score-ring\`. Inner span for the number. Background: \`conic-gradient(COLOR PERCENTAGE%, #e5e7eb 0)\`

**Status indicator dots** — Classes: \`.dot-normal\` (green circle), \`.dot-warning\` (yellow triangle via CSS borders), \`.dot-critical\` (red diamond via rotate)

**Cards** — Class: \`.report-card\` with hover:shadow transition. White bg, rounded-xl, border, shadow-sm.`,
}

const COMPONENTS_FREE: Record<PromptLang, string> = {
  zh: `## Page Components (ALL 6 Required)

### 1. Report Header
- Pulsing emerald dot (animate-ping) for live status
- Report title (text-2xl md:text-3xl font-bold)
- Diagnostic subject with label "诊断主体："
- Notes/remarks with label "备注说明："
- Report ID badge (font-mono, gray background)
- Generation timestamp
- Info notice: "本报告由系统自动生成，仅供参考"

### 2. Metrics Data Table
- Columns: 指标名称 | 监测值 | 标准阈值 | 健康状态 | 异常说明
- Status badges in the 健康状态 column: status-normal(正常), status-warning(警告), status-critical(异常)
- Hover highlight on rows (hover:bg-gray-50/50)
- Font-mono for numeric values
- Table wrapper for horizontal scroll on mobile

### 3. Data Visualization (Chart.js)
- At least TWO different chart types
- Chart 1 (bar): Metric comparison — use risk color palette (green→yellow→red gradient)
- Chart 2 (line): Trend analysis — blue primary line, red dashed threshold line
- Optional Chart 3 (doughnut): Health status proportion — green/yellow/red segments
- Chart labels: 正常(Normal) / 警告(Warning) / 异常(Critical)
- All charts: responsive, maintainAspectRatio: false, consistent risk colors
- Chart color constants: COLORS = { green, yellow, red, blue, purple, cyan, orange, gray }
- Gradient shades: GREEN_SHADES, WARNING_SHADES, RED_SHADES, BLUE_SHADES

### 4. Health Status Labels
- Green circle (dot-normal) for normal items
- Yellow triangle (dot-warning, CSS border trick) for warning items
- Red diamond (dot-critical, rotate(45deg)) for critical items
- Use in the diagnosis summary issue list

### 5. Diagnosis Summary
- Score ring with conic gradient (color based on score: green≥80, yellow≥60, red<60)
- Overall score (numerical, 0-100)
- Risk level text (低风险 / 中风险 / 高风险 / 严重) with risk badge class
- Core issues list with status indicator dots
- Key findings in a blue info box (bg-blue-50, border-blue-100)

### 6. Optimization Suggestions
- Priority-tagged cards: P0 (immediate/critical), P1 (high), P2 (medium), P3 (low)
- Each card: priority badge, suggestion title (font-semibold), description, estimated effort, category
- Hover effect on cards (hover:bg-gray-50/30)

## UI & Experience Requirements
- Card-based layered layout with proper whitespace (p-6 md:p-8), divider lines, zone separation
- Max content width: max-w-6xl centered
- Body padding: p-4 md:p-6 lg:p-8
- Between cards spacing: mb-6
- Professional business dashboard aesthetic (white cards, subtle shadows, clean borders)
- Footer with report title, ID, and generation timestamp`,
  en: `## Page Components (ALL 6 Required)

### 1. Report Header
- Pulsing emerald dot (animate-ping) for live status
- Report title (text-2xl md:text-3xl font-bold)
- Diagnostic subject with label "Subject: "
- Notes/remarks with label "Notes: "
- Report ID badge (font-mono, gray background)
- Generation timestamp
- Info notice: "This report is auto-generated for reference only"

### 2. Metrics Data Table
- Columns: Metric | Value | Threshold | Status | Description
- Status badges in the Status column: status-normal(Normal), status-warning(Warning), status-critical(Critical)
- Hover highlight on rows (hover:bg-gray-50/50)
- Font-mono for numeric values
- Table wrapper for horizontal scroll on mobile

### 3. Data Visualization (Chart.js)
- At least TWO different chart types
- Chart 1 (bar): Metric comparison — use risk color palette (green→yellow→red gradient)
- Chart 2 (line): Trend analysis — blue primary line, red dashed threshold line
- Optional Chart 3 (doughnut): Health status proportion — green/yellow/red segments
- Chart labels: Normal / Warning / Critical
- All charts: responsive, maintainAspectRatio: false, consistent risk colors
- Chart color constants: COLORS = { green, yellow, red, blue, purple, cyan, orange, gray }
- Gradient shades: GREEN_SHADES, WARNING_SHADES, RED_SHADES, BLUE_SHADES

### 4. Health Status Labels
- Green circle (dot-normal) for normal items
- Yellow triangle (dot-warning, CSS border trick) for warning items
- Red diamond (dot-critical, rotate(45deg)) for critical items
- Use in the diagnosis summary issue list

### 5. Diagnosis Summary
- Score ring with conic gradient (color based on score: green≥80, yellow≥60, red<60)
- Overall score (numerical, 0-100)
- Risk level text (Low Risk / Medium Risk / High Risk / Critical) with risk badge class
- Core issues list with status indicator dots
- Key findings in a blue info box (bg-blue-50, border-blue-100)

### 6. Optimization Suggestions
- Priority-tagged cards: P0 (immediate/critical), P1 (high), P2 (medium), P3 (low)
- Each card: priority badge, suggestion title (font-semibold), description, estimated effort, category
- Hover effect on cards (hover:bg-gray-50/30)

## UI & Experience Requirements
- Card-based layered layout with proper whitespace (p-6 md:p-8), divider lines, zone separation
- Max content width: max-w-6xl centered
- Body padding: p-4 md:p-6 lg:p-8
- Between cards spacing: mb-6
- Professional business dashboard aesthetic (white cards, subtle shadows, clean borders)
- Footer with report title, ID, and generation timestamp`,
}

const TEMPLATE_STRUCTURE_FREE: Record<PromptLang, string> = {
  zh: `## Output Template Reference

The generated HTML should follow this structure:

\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[REPORT TITLE] - 诊断报告</title>
  <!--CDN_FAVICON-->
  <!--CDN_TAILWIND-->
  <!--CDN_CHARTJS-->
  <style>
    /* Status badges (.status-normal, .status-warning, .status-critical) */
    /* Risk level badges (.risk-low, .risk-medium, .risk-high, .risk-critical) */
    /* Priority badges (.priority-p0, .priority-p1, .priority-p2, .priority-p3) */
    /* Score ring (.score-ring) */
    /* Status dots (.dot-normal, .dot-warning, .dot-critical) */
    /* Card effects (.report-card) */
    /* Print styles (@media print) */
  </style>
</head>
<body class="bg-gray-50 min-h-screen p-4 md:p-6 lg:p-8">
  <div class="max-w-6xl mx-auto">
    <!-- SECTION 1: Report Header -->
    <!-- SECTION 2: Metrics Data Table -->
    <!-- SECTION 3: Data Visualization (Chart.js) -->
    <!-- SECTION 4: Diagnosis Summary -->
    <!-- SECTION 5: Optimization Suggestions -->
    <!-- SECTION 6: Footer -->
  </div>
  <script>
    // Chart.js color palette constants
    // Chart 1: Bar chart (ctxBar)
    // Chart 2: Line chart (ctxLine)
    // Optional: Doughnut chart (ctxDoughnut)
  </script>
</body>
</html>
\`\`\`

CRITICAL: Output ONLY the raw HTML. Start directly with <!DOCTYPE html>. NO markdown fences, NO explanations. Use CDN placeholders, NOT full script tags.`,
  en: `## Output Template Reference

The generated HTML should follow this structure:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[REPORT TITLE] - Diagnostic Report</title>
  <!--CDN_FAVICON-->
  <!--CDN_TAILWIND-->
  <!--CDN_CHARTJS-->
  <style>
    /* Status badges (.status-normal, .status-warning, .status-critical) */
    /* Risk level badges (.risk-low, .risk-medium, .risk-high, .risk-critical) */
    /* Priority badges (.priority-p0, .priority-p1, .priority-p2, .priority-p3) */
    /* Score ring (.score-ring) */
    /* Status dots (.dot-normal, .dot-warning, .dot-critical) */
    /* Card effects (.report-card) */
    /* Print styles (@media print) */
  </style>
</head>
<body class="bg-gray-50 min-h-screen p-4 md:p-6 lg:p-8">
  <div class="max-w-6xl mx-auto">
    <!-- SECTION 1: Report Header -->
    <!-- SECTION 2: Metrics Data Table -->
    <!-- SECTION 3: Data Visualization (Chart.js) -->
    <!-- SECTION 4: Diagnosis Summary -->
    <!-- SECTION 5: Optimization Suggestions -->
    <!-- SECTION 6: Footer -->
  </div>
  <script>
    // Chart.js color palette constants
    // Chart 1: Bar chart (ctxBar)
    // Chart 2: Line chart (ctxLine)
    // Optional: Doughnut chart (ctxDoughnut)
  </script>
</body>
</html>
\`\`\`

CRITICAL: Output ONLY the raw HTML. Start directly with <!DOCTYPE html>. NO markdown fences, NO explanations. Use CDN placeholders, NOT full script tags.`,
}

/**
 * Build a comprehensive system prompt combining SKILL content and template reference.
 * The user's specific request is sent as a separate user message.
 *
 * @returns Complete system prompt string for guiding the LLM
 */
export type ReportMode = 'free' | 'fixed'

/**
 * Build a comprehensive system prompt for the free/creative mode (Chart.js, full flexibility).
 */
export function buildFreeModePrompt(lang: PromptLang = 'zh'): string {
  return [
    SYS_INSTRUCT_FREE,
    '',
    DESIGN_SYSTEM_FREE[lang],
    '',
    COMPONENTS_FREE[lang],
    '',
    TEMPLATE_STRUCTURE_FREE[lang],
  ].join('\n')
}

export function buildDiagnosticReportSystemPromptFree(lang: PromptLang = 'zh'): string {
  return [
    SYS_INSTRUCT_FREE,
    '',
    DESIGN_SYSTEM_FREE[lang],
    '',
    COMPONENTS_FREE[lang],
    '',
    TEMPLATE_STRUCTURE_FREE[lang],
  ].join('\n')
}

// ===== Fixed Mode Prompt (JSON Schema output, rendered by React components) =====

const SYS_INSTRUCT_FIXED: Record<PromptLang, string> = {
  zh: `You are a diagnostic report generator. Generate a **JSON object** conforming to the schema below.

## Output Constraints (Global, Mandatory)
1. Output ONLY a valid JSON object wrapped in \`\`\`json ... \`\`\` code fences. NO HTML, NO explanations, NO extra text.
2. The JSON must strictly follow the schema below. ALL fields are required unless marked optional.
3. Use appropriate status values, risk levels, and priorities as defined in the schema.
4. Keep text concise and factual. Use Chinese for labels, descriptions, and all user-facing text.`,
  en: `You are a diagnostic report generator. Generate a **JSON object** conforming to the schema below.

## Output Constraints (Global, Mandatory)
1. Output ONLY a valid JSON object wrapped in \`\`\`json ... \`\`\` code fences. NO HTML, NO explanations, NO extra text.
2. The JSON must strictly follow the schema below. ALL fields are required unless marked optional.
3. Use appropriate status values, risk levels, and priorities as defined in the schema.
4. Keep text concise and factual. Use English for labels, descriptions, and all user-facing text.`,
}

const SCHEMA_DEFINITION: Record<PromptLang, string> = {
  zh: `## JSON Schema

### Root Object
{
  "title": "string — 报告标题 (如 '系统健康检查报告')",
  "subject": "string — 诊断主体 (如 '生产服务器集群')",
  "remarks": "string? — 可选备注说明",
  "reportId": "string — 唯一报告编号 (如 'RPT-2024-001')",
  "generatedAt": "string — 生成时间戳 (如 '2024-01-15 14:30:00')",
  "metrics": [...],
  "summary": {...},
  "suggestions": [...]
}

### Metrics Array
Each item:
{
  "name": "string — 指标名称 (如 'CPU 使用率')",
  "value": "string — 监测值 (如 '85%' 或 '120ms')",
  "threshold": "string — 标准阈值 (如 '< 90%')",
  "status": "normal | warning | critical",
  "description": "string — 异常说明，正常则为空字符串"
}

### Summary Object
{
  "score": number — 0-100 综合健康评分,
  "riskLevel": "low | medium | high | critical",
  "issues": [
    { "type": "normal | warning | critical", "text": "string — 问题描述" }
  ],
  "keyFindings": "string — 核心发现总结"
}

### Suggestions Array
Each item:
{
  "priority": "p0 | p1 | p2 | p3",
  "title": "string — 建议标题",
  "description": "string — 详细建议",
  "effort": "string — 预估工作量 (如 '30min', '2小时')",
  "category": "string — 分类 (如 '性能', '安全', '配置')"
}

## Status Semantics
- "normal" — 正常，在正常范围内
- "warning" — 警告，接近阈值
- "critical" — 异常，超过阈值

## Risk Levels
- "low" — 低风险，整体健康，有小问题
- "medium" — 中风险，部分区域需关注
- "high" — 高风险，存在显著问题
- "critical" — 严重，需要立即处理

## Priority Levels
- "p0" — 立即/严重，必须现在修复
- "p1" — 高优先级，尽快修复
- "p2" — 中优先级，计划修复
- "p3" — 低优先级，可暂缓

## Requirements
1. Generate 3-8 metrics based on the diagnostic subject
2. Generate 2-4 issues in the summary.issues array
3. Generate 2-5 optimization suggestions
4. Score should be consistent with metrics status and risk level
5. Make the data realistic and internally consistent`,
  en: `## JSON Schema

### Root Object
{
  "title": "string — report title (e.g. 'System Health Check Report')",
  "subject": "string — diagnostic subject (e.g. 'Production Server Cluster')",
  "remarks": "string? — optional notes",
  "reportId": "string — unique report ID (e.g. 'RPT-2024-001')",
  "generatedAt": "string — generation timestamp (e.g. '2024-01-15 14:30:00')",
  "metrics": [...],
  "summary": {...},
  "suggestions": [...]
}

### Metrics Array
Each item:
{
  "name": "string — metric name (e.g. 'CPU Usage')",
  "value": "string — measured value (e.g. '85%' or '120ms')",
  "threshold": "string — normal threshold (e.g. '< 90%')",
  "status": "normal | warning | critical",
  "description": "string — description if abnormal, empty string if normal"
}

### Summary Object
{
  "score": number — 0-100 overall health score,
  "riskLevel": "low | medium | high | critical",
  "issues": [
    { "type": "normal | warning | critical", "text": "string — issue description" }
  ],
  "keyFindings": "string — summary of key findings"
}

### Suggestions Array
Each item:
{
  "priority": "p0 | p1 | p2 | p3",
  "title": "string — suggestion title",
  "description": "string — detailed suggestion",
  "effort": "string — estimated effort (e.g. '30min', '2 hours')",
  "category": "string — category (e.g. 'Performance', 'Security', 'Configuration')"
}

## Status Semantics
- "normal" — healthy, within normal range
- "warning" — degraded, approaching threshold
- "critical" — abnormal, exceeds threshold

## Risk Levels
- "low" — overall healthy, minor issues
- "medium" — some areas need attention
- "high" — significant issues detected
- "critical" — severe problems requiring immediate action

## Priority Levels
- "p0" — immediate/critical, must fix now
- "p1" — high priority, fix soon
- "p2" — medium priority, plan to fix
- "p3" — low priority, nice to have

## Requirements
1. Generate 3-8 metrics based on the diagnostic subject
2. Generate 2-4 issues in the summary.issues array
3. Generate 2-5 optimization suggestions
4. Score should be consistent with metrics status and risk level
5. Make the data realistic and internally consistent`,
}

const TEMPLATE_STRUCTURE_FIXED: Record<PromptLang, string> = {
  zh: `## Output Format

Wrap the JSON in \`\`\`json ... \`\`\`:

\`\`\`json
{
  "title": "...",
  "subject": "...",
  "remarks": "...",
  "reportId": "...",
  "generatedAt": "...",
  "metrics": [
    { "name": "...", "value": "...", "threshold": "...", "status": "normal", "description": "" }
  ],
  "summary": {
    "score": 85,
    "riskLevel": "low",
    "issues": [
      { "type": "warning", "text": "..." }
    ],
    "keyFindings": "..."
  },
  "suggestions": [
    { "priority": "p1", "title": "...", "description": "...", "effort": "30min", "category": "性能" }
  ]
}
\`\`\`

CRITICAL: Output ONLY valid JSON inside \`\`\`json ... \`\`\`. NO HTML, NO markdown outside the fences.`,
  en: `## Output Format

Wrap the JSON in \`\`\`json ... \`\`\`:

\`\`\`json
{
  "title": "...",
  "subject": "...",
  "remarks": "...",
  "reportId": "...",
  "generatedAt": "...",
  "metrics": [
    { "name": "...", "value": "...", "threshold": "...", "status": "normal", "description": "" }
  ],
  "summary": {
    "score": 85,
    "riskLevel": "low",
    "issues": [
      { "type": "warning", "text": "..." }
    ],
    "keyFindings": "..."
  },
  "suggestions": [
    { "priority": "p1", "title": "...", "description": "...", "effort": "30min", "category": "Performance" }
  ]
}
\`\`\`

CRITICAL: Output ONLY valid JSON inside \`\`\`json ... \`\`\`. NO HTML, NO markdown outside the fences.`,
}

/**
 * Build a comprehensive system prompt for the fixed/components mode (CSS-only, no Chart.js).
 */
export function buildFixedModePrompt(lang: PromptLang = 'zh'): string {
  return [
    SYS_INSTRUCT_FIXED[lang],
    '',
    SCHEMA_DEFINITION[lang],
    '',
    TEMPLATE_STRUCTURE_FIXED[lang],
  ].join('\n')
}

/**
 * Select the appropriate system prompt based on the report generation mode and language.
 */
export function buildSystemPrompt(mode: ReportMode = 'free', lang: PromptLang = 'zh'): string {
  return mode === 'fixed' ? buildFixedModePrompt(lang) : buildFreeModePrompt(lang)
}
