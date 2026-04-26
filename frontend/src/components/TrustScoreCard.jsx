import { useEffect, useState } from 'react'

export default function TrustScoreCard({ trustScore = {} }) {
  const score = trustScore.score ?? 0
  const label = trustScore.label ?? 'N/A'
  const suspicious = trustScore.suspicious_patterns ?? []
  const reliable = trustScore.reliable_signals ?? []
  const explanation = trustScore.explanation ?? ''

  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 150)
    return () => clearTimeout(timer)
  }, [score])

  const getColor = (s) => {
    if (s >= 75) return { stroke: '#22c55e', text: 'text-success', label: 'High Trust', bg: 'rgba(34,197,94,0.1)', glow: 'rgba(34,197,94,0.3)' }
    if (s >= 40) return { stroke: '#f59e0b', text: 'text-warning', label: 'Medium Trust', bg: 'rgba(245,158,11,0.1)', glow: 'rgba(245,158,11,0.3)' }
    return { stroke: '#ef4444', text: 'text-danger', label: 'Low Trust', bg: 'rgba(239,68,68,0.1)', glow: 'rgba(239,68,68,0.3)' }
  }

  const color = getColor(score)
  const size = 120
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  return (
    <div className="card-flat p-5 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
        Trust Score
      </p>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Gauge */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke={color.stroke} strokeWidth={strokeWidth}
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 6px ${color.glow})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${color.text}`}>{score}</span>
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>/100</span>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${color.text}`} style={{ background: color.bg }}>
            {label}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-4 w-full">
          {explanation && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {explanation}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reliable Signals */}
            {reliable.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-success mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Reliable Signals
                </p>
                <div className="space-y-1.5">
                  {reliable.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                      <span className="text-success mt-0.5 flex-shrink-0">✓</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suspicious Patterns */}
            {suspicious.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-danger mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                  Suspicious Patterns
                </p>
                <div className="space-y-1.5">
                  {suspicious.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                      <span className="text-danger mt-0.5 flex-shrink-0">⚠</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
