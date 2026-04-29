import type { ReportSchema } from '@/lib/report-schema'
import ScoreRing from './ScoreRing'
import { StatusBadge, RiskBadge, PriorityBadge, IssueDot } from './ReportBadges'

interface ReportViewProps {
  data: ReportSchema
}

export default function ReportView({ data }: ReportViewProps) {
  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Section 1: Report Header */}
        <section className="bg-white rounded-xl border shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{data.title}</h1>
          </div>
          <div className="space-y-1.5 text-sm text-gray-500 ml-6">
            <p><span className="font-medium text-gray-700">诊断主体：</span>{data.subject}</p>
            {data.remarks && <p><span className="font-medium text-gray-700">备注说明：</span>{data.remarks}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4 ml-6">
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <p className="text-gray-400 text-xs">报告编号</p>
              <p className="text-gray-800 font-mono font-medium text-xs">{data.reportId}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <p className="text-gray-400 text-xs">生成时间</p>
              <p className="text-gray-800 font-medium text-xs">{data.generatedAt}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 ml-6">本报告由系统自动生成，仅供参考</p>
        </section>

        {/* Section 2: Metrics Data Table */}
        <section className="bg-white rounded-xl border shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">指标监测数据</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 text-xs uppercase">指标名称</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs uppercase">监测值</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs uppercase">标准阈值</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600 text-xs uppercase">健康状态</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 text-xs uppercase">异常说明</th>
                </tr>
              </thead>
              <tbody>
                {data.metrics.map((m, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-800">{m.name}</td>
                    <td className="py-3 px-3 text-right font-mono text-gray-800">{m.value}</td>
                    <td className="py-3 px-3 text-right font-mono text-gray-400">{m.threshold}</td>
                    <td className="py-3 px-3 text-center"><StatusBadge status={m.status} /></td>
                    <td className="py-3 px-3 text-gray-500 max-w-[200px]">{m.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Diagnosis Summary */}
        <section className="bg-white rounded-xl border shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">诊断综述</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <ScoreRing score={data.summary.score} />
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">风险等级：</span>
                <RiskBadge level={data.summary.riskLevel} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">核心问题</h3>
                <ul className="space-y-2">
                  {data.summary.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <IssueDot type={issue.type} />
                      <span>{issue.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">核心发现</p>
                <p className="text-sm text-blue-800">{data.summary.keyFindings}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Optimization Suggestions */}
        <section className="bg-white rounded-xl border shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">优化建议</h2>
          <div className="space-y-3">
            {data.suggestions.map((s, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50/30 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <PriorityBadge priority={s.priority} />
                  <h3 className="text-sm font-semibold text-gray-800">{s.title}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{s.effort}</span>
                  <span>{s.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Footer */}
        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
          {data.title} — {data.reportId} — {data.generatedAt}
        </footer>
      </div>
    </div>
  )
}
