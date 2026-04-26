import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = {
  Positive: '#22c55e',
  Neutral: '#64748b',
  Negative: '#ef4444',
}

export default function SentimentDonut({ positive = 0, neutral = 0, negative = 0 }) {
  const data = [
    { name: 'Positive', value: positive },
    { name: 'Neutral', value: neutral },
    { name: 'Negative', value: negative },
  ].filter((d) => d.value > 0)

  return (
    <div className="flex flex-col items-center">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              animationBegin={200}
              animationDuration={800}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} style={{ filter: `drop-shadow(0 0 4px ${COLORS[entry.name]}40)` }} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.75rem',
                fontSize: '0.75rem',
                color: 'var(--text-primary)',
              }}
              formatter={(value) => [`${value.toFixed(1)}%`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[d.name] }} />
            <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
            <span style={{ color: COLORS[d.name] }}>{d.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
