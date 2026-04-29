import type { MetricStatus, RiskLevel, Priority } from '@/lib/report-schema'

const statusConfig: Record<MetricStatus, { bg: string; text: string; dot: string }> = {
  normal: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

const statusLabel: Record<MetricStatus, string> = {
  normal: '正常',
  warning: '警告',
  critical: '异常',
}

const riskConfig: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-green-50', text: 'text-green-700', label: '低风险' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: '中风险' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', label: '高风险' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', label: '严重' },
}

const priorityConfig: Record<Priority, { bg: string; text: string }> = {
  p0: { bg: 'bg-red-50', text: 'text-red-700' },
  p1: { bg: 'bg-orange-50', text: 'text-orange-700' },
  p2: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  p3: { bg: 'bg-green-50', text: 'text-green-700' },
}

export function StatusBadge({ status }: { status: MetricStatus }) {
  const c = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {statusLabel[status]}
    </span>
  )
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const c = riskConfig[level]
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const c = priorityConfig[priority]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${c.bg} ${c.text}`}>
      {priority.toUpperCase()}
    </span>
  )
}

export function IssueDot({ type }: { type: MetricStatus }) {
  const colors = {
    normal: 'bg-green-500 rounded-full',
    warning: 'border-l-[5px] border-l-yellow-500 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent',
    critical: 'bg-red-500 rotate-45',
  }
  return (
    <span className={`inline-block w-2.5 h-2.5 shrink-0 mt-1 ${colors[type]}`} />
  )
}
