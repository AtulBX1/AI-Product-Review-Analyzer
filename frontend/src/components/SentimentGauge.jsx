import { useEffect, useState } from 'react'

export default function SentimentGauge({ score = 0, size = 160, strokeWidth = 12 }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const getColor = (s) => {
    if (s >= 70) return { stroke: '#22c55e', text: 'text-success', label: 'Positive', bg: 'rgba(34,197,94,0.1)' }
    if (s >= 50) return { stroke: '#f59e0b', text: 'text-warning', label: 'Mixed', bg: 'rgba(245,158,11,0.1)' }
    return { stroke: '#ef4444', text: 'text-danger', label: 'Negative', bg: 'rgba(239,68,68,0.1)' }
  }

  const color = getColor(score)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${color.stroke}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${color.text}`}>{score}</span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>/100</span>
        </div>
      </div>
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${color.text}`}
        style={{ background: color.bg }}
      >
        {color.label}
      </span>
    </div>
  )
}
