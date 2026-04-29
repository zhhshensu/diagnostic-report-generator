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
