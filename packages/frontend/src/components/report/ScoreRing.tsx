interface ScoreRingProps {
  score: number
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#eab308'
  return '#ef4444'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 60) return '一般'
  if (score >= 30) return '较差'
  return '严重'
}

export default function ScoreRing({ score }: ScoreRingProps) {
  const color = getScoreColor(score)
  return (
    <div className="flex flex-col items-center">
      <div
        className="score-ring"
        style={{ background: `conic-gradient(${color} ${score}%, #e5e7eb 0)` }}
      >
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
      </div>
      <p className="text-sm text-gray-500 mt-3">综合评分</p>
      <span className="text-xs text-gray-400 mt-0.5">{getScoreLabel(score)}</span>
    </div>
  )
}
