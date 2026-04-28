import { useState } from 'react'
import SentimentDonut from './SentimentDonut'
import TrustScoreCard from './TrustScoreCard'
import { useToast } from '../context/ToastContext'

export default function ResultsView({ data }) {
  const { success, error: toastError } = useToast()
  const mode = data.mode || 'advanced'
  const isBasic = mode === 'basic'

  const downloadFile = async (type) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${baseUrl}/api/export/${data.id}/${type}`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.product_name}_report.${type}`
      a.click()
      URL.revokeObjectURL(url)
      success(`${type.toUpperCase()} exported successfully`)
    } catch {
      toastError('Failed to export report')
    }
  }

  if (isBasic) return <BasicResultsView data={data} downloadFile={downloadFile} />
  return <AdvancedResultsView data={data} downloadFile={downloadFile} />
}

/* ========== BASIC MODE ========== */
function BasicResultsView({ data, downloadFile }) {
  const sentiment = data.sentiment_summary || {}

  return (
    <div className="space-y-6 animate-fade-in">
      <ResultHeader data={data} downloadFile={downloadFile} />

      {/* Summary */}
      {data.summary && (
        <div className="card-flat p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Summary</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{data.summary}</p>
        </div>
      )}

      {/* Sentiment + Donut */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-flat p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Sentiment</p>
          <div className="space-y-3">
            <SentimentBar label="Positive" value={sentiment.positive} color="#22c55e" />
            <SentimentBar label="Negative" value={sentiment.negative} color="#ef4444" />
            <SentimentBar label="Neutral" value={sentiment.neutral} color="#64748b" />
          </div>
        </div>
        <div className="card-flat p-5 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Breakdown</p>
          <SentimentDonut
            positive={sentiment.positive || 0}
            neutral={sentiment.neutral || 0}
            negative={sentiment.negative || 0}
          />
        </div>
      </div>

      {/* Pros & Cons */}
      <ProsConsList pros={data.pros || []} cons={data.cons || []} />
    </div>
  )
}

/* ========== ADVANCED MODE ========== */
function AdvancedResultsView({ data, downloadFile }) {
  const [tab, setTab] = useState(0)
  const sentiment = data.sentiment_summary || {}
  const trustScore = data.trust_score || {}
  const painPoints = data.pain_points || []
  const emotions = data.emotion_insights || []
  const timeline = data.timeline_insight || {}
  const personalizedAdvice = data.personalized_advice || {}
  const fitBreakdown = data.fit_breakdown || []
  const suggestions = data.suggestions || []
  const hiddenInsights = data.hidden_insights || []
  const verdict = data.final_verdict || {}
  const clarification = data.clarification_needed || false
  const questions = data.clarification_questions || []

  const tabs = ['Pros & Cons', 'Pain Points', 'Emotions', 'Hidden Insights']
  if (timeline.available) tabs.push('Timeline')

  return (
    <div className="space-y-6 animate-fade-in">
      <ResultHeader data={data} downloadFile={downloadFile} />

      {/* Overall Summary */}
      {data.overall_summary && (
        <div className="card-flat p-5 md:p-6 border-l-4 border-accent">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>AI Analysis Summary</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{data.overall_summary}</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Trust Score"
          value={`${trustScore.score ?? '—'}`}
          sub="/100"
          color={trustScore.score >= 75 ? 'text-success' : trustScore.score >= 40 ? 'text-warning' : 'text-danger'}
        />
        <StatCard
          label="Positive"
          value={`${sentiment.positive ?? 0}%`}
          color="text-success"
        />
        <StatCard
          label="Negative"
          value={`${sentiment.negative ?? 0}%`}
          color="text-danger"
        />
        <StatCard
          label="Verdict"
          value={verdict.decision || '—'}
          color={verdict.decision === 'Recommended' ? 'text-success' : verdict.decision === 'Not Recommended' ? 'text-danger' : 'text-warning'}
        />
      </div>

      {/* Trust Score + Sentiment Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <TrustScoreCard trustScore={trustScore} />
        <div className="card-flat p-5 md:p-6 flex flex-col items-center">
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Sentiment Breakdown</p>
          <SentimentDonut
            positive={sentiment.positive || 0}
            neutral={sentiment.neutral || 0}
            negative={sentiment.negative || 0}
          />
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="card-flat overflow-hidden">
        <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--border-color)' }}>
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                tab === i
                  ? 'text-accent border-accent'
                  : 'border-transparent hover:bg-[var(--bg-hover)]'
              }`}
              style={tab !== i ? { color: 'var(--text-muted)' } : {}}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-5 md:p-6">
          {tab === 0 && <ProsConsList pros={data.pros || []} cons={data.cons || []} />}
          {tab === 1 && <PainPointsTab painPoints={painPoints} />}
          {tab === 2 && <EmotionsTab emotions={emotions} />}
          {tab === 3 && <HiddenInsightsTab insights={hiddenInsights} />}
          {tab === 4 && timeline.available && <TimelineTab timeline={timeline} />}
        </div>
      </div>

      {/* Personalized Advice */}
      {personalizedAdvice.available && (
        <PersonalizedAdviceCard advice={personalizedAdvice} />
      )}

      {/* Fit Breakdown */}
      {fitBreakdown.length > 0 && (
        <FitBreakdownCard breakdown={fitBreakdown} />
      )}

      {/* Alternative Suggestions */}
      {suggestions.length > 0 && (
        <SuggestionsCard suggestions={suggestions} />
      )}

      {/* Final Verdict */}
      <VerdictCard verdict={verdict} />

      {/* Clarification Needed */}
      {clarification && questions.length > 0 && (
        <div className="card-flat border-accent/30 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs">?</span>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Follow-up Questions</p>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            More context could improve this analysis:
          </p>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-accent mt-0.5 flex-shrink-0">→</span>
                <span style={{ color: 'var(--text-secondary)' }}>{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ========== SHARED COMPONENTS ========== */

function ResultHeader({ data, downloadFile }) {
  const modeBadge = {
    basic: { bg: 'bg-accent/10', text: 'text-accent-light', label: 'Basic' },
    advanced: { bg: 'bg-success/10', text: 'text-success', label: 'Advanced' },
    comparison: { bg: 'bg-warning/10', text: 'text-warning', label: 'Comparison' },
  }[data.mode] || { bg: 'bg-accent/10', text: 'text-accent-light', label: data.mode }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.product_name}</h2>
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${modeBadge.bg} ${modeBadge.text}`}>
            {modeBadge.label}
          </span>
        </div>
        {data.created_at && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Analyzed on {new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => downloadFile('pdf')} className="btn-outline text-sm flex items-center gap-2">
          <DownloadIcon className="w-4 h-4" /> PDF
        </button>
        <button onClick={() => downloadFile('csv')} className="btn-outline text-sm flex items-center gap-2">
          <DownloadIcon className="w-4 h-4" /> CSV
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card-flat p-4 md:p-5">
      <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className={`text-2xl font-bold ${color || ''}`} style={!color ? { color: 'var(--text-primary)' } : {}}>
        {value}
        {sub && <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>{sub}</span>}
      </p>
    </div>
  )
}

function SentimentBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="font-semibold" style={{ color }}>{value ?? 0}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'var(--border-color)' }}>
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(value || 0, 100)}%`, background: color }}
        />
      </div>
    </div>
  )
}

function ProsConsList({ pros = [], cons = [] }) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-success mb-4">Pros</p>
        <div className="space-y-2.5">
          {pros.map((p, i) => {
            const text = typeof p === 'string' ? p : p.text || String(p)
            return (
              <div key={i} className="flex items-start gap-2.5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <span className="mt-0.5 w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center text-xs flex-shrink-0">✓</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            )
          })}
          {pros.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No pros identified.</p>}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-danger mb-4">Cons</p>
        <div className="space-y-2.5">
          {cons.map((c, i) => {
            const text = typeof c === 'string' ? c : c.text || String(c)
            return (
              <div key={i} className="flex items-start gap-2.5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <span className="mt-0.5 w-5 h-5 rounded-full bg-danger/10 text-danger flex items-center justify-center text-xs flex-shrink-0">✕</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            )
          })}
          {cons.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No cons identified.</p>}
        </div>
      </div>
    </div>
  )
}

/* ========== TAB COMPONENTS ========== */

function PainPointsTab({ painPoints = [] }) {
  const severityColor = {
    Critical: 'badge-danger',
    Moderate: 'badge-warning',
    Minor: 'badge-accent',
  }
  const frequencyColor = {
    High: 'text-danger',
    Medium: 'text-warning',
    Low: 'text-accent-light',
  }

  return (
    <div className="space-y-4">
      {painPoints.map((pp, i) => (
        <div key={i} className="border-l-2 border-danger/30 pl-4 py-2 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{pp.category}</span>
            <span className={`badge ${severityColor[pp.severity] || 'badge-accent'}`}>{pp.severity}</span>
            <span className={`text-xs font-medium ${frequencyColor[pp.frequency] || ''}`}>
              {pp.frequency} frequency
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{pp.description}</p>
          {pp.example_quote && (
            <p className="text-xs mt-2 italic pl-3 border-l-2" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
              "{pp.example_quote}"
            </p>
          )}
        </div>
      ))}
      {painPoints.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No significant pain points detected.</p>}
    </div>
  )
}

function EmotionsTab({ emotions = [] }) {
  const intensityStyle = {
    High: { dot: 'bg-danger', text: 'text-danger' },
    Medium: { dot: 'bg-warning', text: 'text-warning' },
    Low: { dot: 'bg-accent', text: 'text-accent-light' },
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {emotions.map((e, i) => {
        const style = intensityStyle[e.intensity] || intensityStyle.Medium
        return (
          <div key={i} className="card p-4 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{e.emotion}</span>
              <span className={`text-xs font-medium ${style.text}`}>{e.intensity}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Trigger:</span> {e.trigger}
            </p>
            {e.user_segment && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Segment: {e.user_segment}
              </p>
            )}
          </div>
        )
      })}
      {emotions.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No emotion insights available.</p>}
    </div>
  )
}

function HiddenInsightsTab({ insights = [] }) {
  const confColor = {
    High: 'badge-success',
    Medium: 'badge-warning',
    Low: 'badge-danger',
  }

  return (
    <div className="space-y-4">
      {insights.map((h, i) => (
        <div key={i} className="card p-4 border-l-4 border-accent/40 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="flex items-start gap-2 mb-2">
            <span className="text-accent text-lg mt-0.5">💡</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{h.insight}</p>
                <span className={`badge ${confColor[h.confidence] || 'badge-accent'}`}>
                  {h.confidence} confidence
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="font-medium">Basis:</span> {h.basis}
              </p>
            </div>
          </div>
        </div>
      ))}
      {insights.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hidden insights detected.</p>}
    </div>
  )
}

function TimelineTab({ timeline = {} }) {
  const trendColor = {
    Improving: { text: 'text-success', icon: '↑', bg: 'bg-success/10' },
    Declining: { text: 'text-danger', icon: '↓', bg: 'bg-danger/10' },
    Stable: { text: 'text-accent-light', icon: '→', bg: 'bg-accent/10' },
    Mixed: { text: 'text-warning', icon: '~', bg: 'bg-warning/10' },
  }[timeline.trend] || { text: '', icon: '—', bg: 'bg-[var(--bg-card)]' }

  return (
    <div className="space-y-4">
      {timeline.trend && (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${trendColor.bg}`}>
          <span className={`text-lg font-bold ${trendColor.text}`}>{trendColor.icon}</span>
          <span className={`text-sm font-semibold ${trendColor.text}`}>{timeline.trend}</span>
        </div>
      )}
      {timeline.pattern && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Pattern</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{timeline.pattern}</p>
        </div>
      )}
      {timeline.early_vs_recent && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Early vs Recent</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{timeline.early_vs_recent}</p>
        </div>
      )}
      {timeline.long_term_reliability && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Long-term Reliability</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{timeline.long_term_reliability}</p>
        </div>
      )}
    </div>
  )
}

function PersonalizedAdviceCard({ advice = {} }) {
  const fitColor = advice.fit_score >= 70 ? 'text-success' : advice.fit_score >= 40 ? 'text-warning' : 'text-danger'
  const suitableIcon = advice.suitable === true ? '✓' : advice.suitable === false ? '✕' : '~'
  const suitableColor = advice.suitable === true ? 'text-success' : advice.suitable === false ? 'text-danger' : 'text-warning'

  return (
    <div className="card-flat border-accent/20 p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎯</span>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Personalized For You</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        {advice.fit_score != null && (
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Fit Score</p>
            <p className={`text-3xl font-bold ${fitColor}`}>
              {advice.fit_score}<span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>/100</span>
            </p>
          </div>
        )}
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Suitable?</p>
          <p className={`text-xl font-bold ${suitableColor}`}>
            {suitableIcon} {advice.suitable === true ? 'Yes' : advice.suitable === false ? 'No' : 'Maybe'}
          </p>
        </div>
      </div>

      {advice.reason && (
        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{advice.reason}</p>
      )}
      {advice.recommendation && (
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          💬 {advice.recommendation}
        </p>
      )}
      {advice.alternatives_suggested && (
        <p className="text-xs mt-2 text-warning">Consider looking at alternatives for a better fit.</p>
      )}
    </div>
  )
}

function VerdictCard({ verdict = {} }) {
  const vStyle = {
    'Recommended': { border: 'border-success/50', text: 'text-success', bg: 'bg-success/5', icon: '✓', gradient: 'from-success/10 to-transparent' },
    'Not Recommended': { border: 'border-danger/50', text: 'text-danger', bg: 'bg-danger/5', icon: '✕', gradient: 'from-danger/10 to-transparent' },
    'Conditional': { border: 'border-warning/50', text: 'text-warning', bg: 'bg-warning/5', icon: '~', gradient: 'from-warning/10 to-transparent' },
  }[verdict.decision] || { border: 'border-[var(--border-color)]', text: '', bg: '', icon: '?', gradient: '' }

  const confBadge = {
    High: 'badge-success',
    Medium: 'badge-warning',
    Low: 'badge-danger',
  }[verdict.confidence] || 'badge-accent'

  return (
    <div className={`border-2 ${vStyle.border} ${vStyle.bg} rounded-2xl p-6 transition-all`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-3xl font-extrabold ${vStyle.text}`}>{verdict.decision || '—'}</span>
        <span className={`badge ${confBadge}`}>{verdict.confidence} confidence</span>
      </div>

      {verdict.one_line_verdict && (
        <p className="text-base font-medium mb-5" style={{ color: 'var(--text-primary)' }}>
          {verdict.one_line_verdict}
        </p>
      )}

      {verdict.condition && (
        <p className="text-sm mb-4 italic" style={{ color: 'var(--text-muted)' }}>
          Condition: {verdict.condition}
        </p>
      )}

      {(verdict.key_reasons || []).length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Key Reasons</p>
          <div className="space-y-2">
            {verdict.key_reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 flex-shrink-0 ${vStyle.text}`}>•</span>
                <span style={{ color: 'var(--text-secondary)' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ========== FIT BREAKDOWN ========== */
function FitBreakdownCard({ breakdown = [] }) {
  const getScoreColor = (s) => {
    if (s >= 70) return { bar: '#22c55e', text: 'text-success' }
    if (s >= 40) return { bar: '#f59e0b', text: 'text-warning' }
    return { bar: '#ef4444', text: 'text-danger' }
  }

  return (
    <div className="card-flat p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Field-by-Field Fit Analysis
        </p>
      </div>
      <div className="space-y-4">
        {breakdown.map((item, i) => {
          const c = getScoreColor(item.score)
          return (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                <span className={`text-xs font-bold ${c.text}`}>{item.score}/100</span>
              </div>
              <div className="h-1.5 rounded-full mb-1.5" style={{ background: 'var(--border-color)' }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(item.score, 100)}%`, background: c.bar }}
                />
              </div>
              <p className="text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>{item.evidence}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ========== SUGGESTIONS ========== */
function SuggestionsCard({ suggestions = [] }) {
  return (
    <div className="card-flat p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💡</span>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Alternative Products to Consider
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="border rounded-xl p-4 space-y-2.5 transition-all hover:border-accent/40 animate-slide-up"
            style={{ borderColor: 'var(--border-color)', animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.product_name}</p>
              {s.estimated_price_range && (
                <span className="text-[10px] font-medium whitespace-nowrap px-2 py-0.5 rounded-full bg-accent/10 text-accent-light">
                  {s.estimated_price_range}
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.why_suggested}</p>
            {(s.key_matching_features || []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {s.key_matching_features.map((f, j) => (
                  <span key={j} className="text-[10px] px-2 py-0.5 rounded-full border"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                    {f}
                  </span>
                ))}
              </div>
            )}
            {s.search_query && (
              <a
                href={`https://www.amazon.in/s?k=${encodeURIComponent(s.search_query)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                Search on Amazon →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ========== ICONS ========== */
function DownloadIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}