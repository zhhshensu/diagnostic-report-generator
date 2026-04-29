---
name: diagnostic-report
description: Generate professional, self-contained diagnostic report HTML pages with interactive charts, metrics tables, health status visualization, and optimization recommendations. Use when the user asks for diagnostic reports, health checks, system monitoring reports, performance analysis, fault diagnosis, status reports, or any data-driven inspection report generation.
license: MIT
metadata:
  version: "2.0"
  author: Cocoon AI (hello@cocoon-ai.com)
---

# Diagnostic Report HTML Generator

Generate standardized, production-ready diagnostic report pages as self-contained HTML files with interactive charts (Chart.js), structured data tables, and professional business UI styling.

## Output Constraints (Global, Mandatory)

1. Output **only the complete single-file self-contained HTML**. No explanations, no markdown wrapping, no extra text, no comments outside the HTML.
2. All styles, icons, and chart scripts must be loaded via CDN. Zero local dependencies, zero cross-origin restrictions. The file must work when opened directly in a browser by double-clicking.
3. Model-agnostic — compatible with all LLMs. Output must render correctly in any browser, internal network environments, or frontend platforms.
4. Output supports: live preview, download/save, print-to-PDF, embedding in platforms.

## Design System

### Color Palette

Use these semantic colors for report components:

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Normal / Healthy | Green | `#22c55e` | Healthy metrics, P3 priorities, success badges |
| Warning / Degraded | Yellow | `#eab308` | Degraded metrics, P2 priorities, warning badges |
| Critical / Abnormal | Red | `#ef4444` | Abnormal metrics, P0 priorities, error badges |
| Primary Accent | Blue | `#3b82f6` | Info boxes, primary buttons, chart accent |
| Secondary | Purple | `#8b5cf6` | Chart accent, secondary visual elements |
| Text Primary | Dark Gray | `#111827` | Main body text |
| Text Muted | Medium Gray | `#6b7280` | Secondary text, metadata |

### Typography

Use the cross-platform sans-serif font stack for Chinese/English compatibility:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans SC', sans-serif;
```

### Status Badges (CSS Patterns)

Status indicators use CSS pseudo-elements for visual hierarchy:

**Normal（正常）** — Green circle:
```css
.status-normal {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.125rem 0.75rem; border-radius: 9999px;
  font-size: 0.75rem; font-weight: 600;
  background: #f0fdf4; color: #15803d;
}
.status-normal::before {
  content: ''; display: inline-block; width: 0.5rem; height: 0.5rem;
  border-radius: 9999px; background: #22c55e;
}
```

**Warning（警告）** — Yellow triangle:
```css
.status-warning::before {
  content: ''; display: inline-block; width: 0; height: 0;
  border-left: 0.3rem solid transparent;
  border-right: 0.3rem solid transparent;
  border-bottom: 0.5rem solid #eab308;
}
```

**Critical（异常）** — Red diamond:
```css
.status-critical::before {
  content: ''; display: inline-block; width: 0.5rem; height: 0.5rem;
  transform: rotate(45deg); background: #ef4444;
}
```

### Score Ring (CSS Pattern)

Circular score display using conic gradient:
```css
.score-ring {
  width: 8rem; height: 8rem; border-radius: 9999px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.25rem; font-weight: 700;
  position: relative;
  background: conic-gradient(COLOR PERCENTAGE%, #e5e7eb 0);
}
.score-ring::before {
  content: ''; position: absolute; inset: 0.25rem;
  border-radius: 9999px; background: white;
}
.score-ring span { position: relative; z-index: 1; }
```

### Risk Level Badges

| Level | Class | Style |
|-------|-------|-------|
| 低风险（Low Risk） | `.risk-low` | `#f0fdf4` bg, `#15803d` text |
| 中风险（Medium Risk） | `.risk-medium` | `#fefce8` bg, `#a16207` text |
| 高风险（High Risk） | `.risk-high` | `#fff7ed` bg, `#c2410c` text |
| 严重（Critical） | `.risk-critical` | `#fef2f2` bg, `#b91c1c` text |

### Priority Badges

| Priority | Class | Style |
|----------|-------|-------|
| P0 | `.priority-p0` | `#fef2f2` bg, `#b91c1c` text |
| P1 | `.priority-p1` | `#fff7ed` bg, `#c2410c` text |
| P2 | `.priority-p2` | `#fefce8` bg, `#a16207` text |
| P3 | `.priority-p3` | `#f0fdf4` bg, `#15803d` text |

### Layout Structure

1. **Report Header** — Title with pulsing dot, subject, report ID, timestamp
2. **Metrics Table** — Data table with status badges
3. **Data Visualization** — Chart.js charts (2+ types)
4. **Diagnosis Summary** — Score ring, risk level, core issues, key findings
5. **Optimization Suggestions** — Priority-tagged recommendation cards
6. **Footer** — Metadata line

### Spacing Rules

- **Card padding:** `p-6 md:p-8` (24px base, 32px on desktop)
- **Between cards:** `mb-6` (24px gap)
- **Max content width:** `max-w-6xl` (1152px)
- **Body padding:** `p-4 md:p-6 lg:p-8` (responsive)

## Component Specifications

### 1. Report Header Pattern

```html
<!-- Status Pulse Dot + Title -->
<div class="flex items-center gap-3 mb-3">
  <span class="flex h-3 w-3 relative">
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
  </span>
  <h1 class="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">[REPORT TITLE]</h1>
</div>

<!-- Subject & Notes -->
<div class="space-y-1.5 text-sm text-gray-500 ml-6">
  <p><span class="font-medium text-gray-700">诊断主体（Subject）：</span>[DIAGNOSTIC SUBJECT]</p>
  <p><span class="font-medium text-gray-700">备注说明（Notes）：</span>[REMARKS]</p>
</div>

<!-- Report Meta (Right Side) -->
<div class="flex flex-col items-start md:items-end gap-1.5 text-sm shrink-0">
  <div class="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
    <p class="text-gray-400 text-xs">报告编号（Report ID）</p>
    <p class="text-gray-800 font-mono font-medium text-xs">[REPORT ID]</p>
  </div>
  <div class="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
    <p class="text-gray-400 text-xs">生成时间（Generated At）</p>
    <p class="text-gray-800 font-medium text-xs">[GENERATION TIMESTAMP]</p>
  </div>
</div>
```

### 2. Metrics Table Pattern

```html
<table class="w-full text-sm">
  <thead>
    <tr class="border-b-2 border-gray-100">
      <th class="text-left py-3 px-3 font-semibold text-gray-600 text-xs uppercase">指标名称（Metric）</th>
      <th class="text-right py-3 px-3 font-semibold text-gray-600 text-xs uppercase">监测值（Value）</th>
      <th class="text-right py-3 px-3 font-semibold text-gray-600 text-xs uppercase">标准阈值（Threshold）</th>
      <th class="text-center py-3 px-3 font-semibold text-gray-600 text-xs uppercase">健康状态（Status）</th>
      <th class="text-left py-3 px-3 font-semibold text-gray-600 text-xs uppercase">异常说明（Description）</th>
    </tr>
  </thead>
  <tbody>
    <!-- Row pattern: status-normal / status-warning / status-critical -->
    <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
      <td class="py-3 px-3 font-medium text-gray-800">[METRIC NAME]</td>
      <td class="py-3 px-3 text-right font-mono text-gray-800">[VALUE]</td>
      <td class="py-3 px-3 text-right font-mono text-gray-400">[THRESHOLD]</td>
      <td class="py-3 px-3 text-center"><span class="status-normal">正常</span></td>
      <td class="py-3 px-3 text-gray-500 max-w-[200px] truncate">[DESCRIPTION]</td>
    </tr>
  </tbody>
</table>
```

### 3. Chart.js Initialization Pattern

Chart.js is loaded via CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js`

**Color palette for charts:**
```javascript
const COLORS = {
  green: '#22c55e', yellow: '#eab308', red: '#ef4444',
  blue: '#3b82f6', purple: '#8b5cf6', cyan: '#06b6d4',
  orange: '#f97316', gray: '#9ca3af'
};
const GREEN_SHADES = ['rgba(34,197,94,0.8)', 'rgba(34,197,94,0.5)', 'rgba(34,197,94,0.2)'];
const WARNING_SHADES = ['rgba(234,179,8,0.8)', 'rgba(234,179,8,0.5)', 'rgba(234,179,8,0.2)'];
const RED_SHADES = ['rgba(239,68,68,0.8)', 'rgba(239,68,68,0.5)', 'rgba(239,68,68,0.2)'];
const BLUE_SHADES = ['rgba(59,130,246,0.8)', 'rgba(59,130,246,0.5)', 'rgba(59,130,246,0.2)'];
```

**Bar chart pattern (for metric comparison):**
```javascript
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['CPU', 'Memory', 'Disk', 'Network', 'Response', 'Error'],
    datasets: [{
      label: 'Usage %',
      data: [85, 72, 91, 45, 38, 12],
      backgroundColor: [GREEN_SHADES[0], GREEN_SHADES[1], WARNING_SHADES[0], ...],
      borderColor: [COLORS.green, COLORS.green, COLORS.yellow, ...],
      borderWidth: 1, borderRadius: 4, maxBarThickness: 40
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  }
});
```

**Line chart pattern (for trends):**
```javascript
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Latency', data: [...], borderColor: COLORS.blue, fill: true, tension: 0.3 },
      { label: 'Threshold', data: [...], borderColor: COLORS.red, fill: false, borderDash: [5, 5] }
    ]
  },
  options: { responsive: true, maintainAspectRatio: false }
});
```

**Doughnut chart pattern (for proportions):**
```javascript
new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['正常（Normal）', '警告（Warning）', '异常（Critical）'],
    datasets: [{ data: [65, 25, 10], backgroundColor: [COLORS.green, COLORS.yellow, COLORS.red] }]
  },
  options: { responsive: true, cutout: '60%' }
});
```

### 4. Diagnosis Summary Pattern

```html
<!-- Score Ring -->
<div class="score-ring" style="background: conic-gradient(#22c55e 75%, #e5e7eb 0);">
  <span class="score-value" style="color: #22c55e;">85</span>
</div>
<p class="text-sm text-gray-500 mt-3">综合评分（Overall Score）</p>
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold risk-low">低风险（Low Risk）</span>

<!-- Core Issues List -->
<ul class="space-y-2">
  <li class="flex items-start gap-2 text-sm text-gray-600">
    <span class="dot-critical mt-1.5 shrink-0"></span>
    <span>[Critical issue description]</span>
  </li>
  <li class="flex items-start gap-2 text-sm text-gray-600">
    <span class="dot-warning mt-1.5 shrink-0"></span>
    <span>[Warning issue description]</span>
  </li>
  <li class="flex items-start gap-2 text-sm text-gray-600">
    <span class="dot-normal mt-1.5 shrink-0"></span>
    <span>[Normal finding]</span>
  </li>
</ul>

<!-- Key Findings Box -->
<div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
  <p class="text-xs text-blue-600 font-medium">核心发现（Key Findings）</p>
  <p class="text-sm text-blue-800 mt-1">[Key findings summary]</p>
</div>
```

### 5. Optimization Suggestion Card Pattern

```html
<div class="border border-gray-200 rounded-lg p-4 report-card">
  <div class="flex items-center gap-2 mb-1">
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold priority-p0">P0</span>
    <h3 class="text-sm font-semibold text-gray-800">[Suggestion Title]</h3>
  </div>
  <p class="text-sm text-gray-500 mt-1">[Description]</p>
  <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
    <span>[Estimated effort]</span>
    <span>[Category]</span>
  </div>
</div>
```

## Template

Copy and customize the template at `assets/template.html`. The template contains all 6 required sections with placeholder markers (bracketed like `[REPORT TITLE]`). Key customization points:

1. Update `<title>` and header text
2. Replace `[REPORT TITLE]`, `[REPORT ID]`, `[GENERATION TIMESTAMP]`, `[DIAGNOSTIC SUBJECT]`
3. Populate metrics table rows (add/remove `<tr>` elements)
4. Configure Chart.js datasets, labels, and chart types in the inline `<script>`
5. Fill diagnosis summary: `[OVERALL SCORE]`, `[RISK LEVEL]`, issue bullets
6. Add optimization suggestion cards with priority badges
7. Update footer metadata

## Output

Always produce a single self-contained `.html` file with:
- Tailwind CSS loaded via CDN (`cdn.tailwindcss.com`)
- Chart.js loaded via CDN (`cdn.jsdelivr.net/npm/chart.js`)
- Inline `<script>` blocks for Chart.js initialization
- Embedded `<style>` for custom CSS overrides (status badges, score ring, etc.)

The file must render correctly when opened directly in any modern browser with no network dependencies beyond CDN availability.

## MCP Tool Definition

```json
{
  "name": "diagnostic-report-generator",
  "description": "Generate a standalone HTML diagnostic report with interactive charts, metrics tables, health status visualization, and optimization recommendations based on natural language requirements or structured diagnostic data.",
  "input": "User natural language requirements / custom diagnostic data",
  "output": "Complete standalone HTML document"
}
```
