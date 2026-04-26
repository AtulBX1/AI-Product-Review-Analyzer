import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const nav = useNavigate()
  const { success, error: toastError } = useToast()

  const fetchHistory = async (p = 1) => {
    setLoading(true)
    try {
      const res = await api.get(`/history?page=${p}`)
      setItems(res.data.items || [])
      setTotalPages(res.data.pages || 1)
      setPage(p)
    } catch {
      toastError('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/history/${id}`)
      setItems((prev) => prev.filter((i) => i.id !== id))
      success('Analysis deleted')
    } catch {
      toastError('Failed to delete')
    }
  }

  const getScoreColor = (score) => {
    if (score >= 70) return { badge: 'badge-success', ring: 'ring-success/20' }
    if (score >= 50) return { badge: 'badge-warning', ring: 'ring-warning/20' }
    return { badge: 'badge-danger', ring: 'ring-danger/20' }
  }

  const getVerdictStyle = (verdict) => {
    if (verdict === 'Recommended') return 'text-success'
    if (verdict === 'Not Recommended') return 'text-danger'
    if (verdict === 'Conditional') return 'text-warning'
    return ''
  }

  const getModeBadge = (mode) => {
    if (mode === 'basic') return { bg: 'bg-accent/10', text: 'text-accent-light' }
    if (mode === 'advanced') return { bg: 'bg-success/10', text: 'text-success' }
    if (mode === 'comparison') return { bg: 'bg-warning/10', text: 'text-warning' }
    return { bg: 'bg-accent/10', text: 'text-accent-light' }
  }

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Analysis History</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {items.length > 0 ? `${items.length} past analyses` : 'Your past analyses will appear here'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card-flat p-5 flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="skeleton h-5 w-48" />
                <div className="skeleton h-3 w-32" />
              </div>
              <div className="skeleton h-8 w-16 rounded-full" />
              <div className="skeleton h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="No analyses yet"
          description="Start by analyzing a product on the home page. Your results will be saved here for future reference."
          action={
            <button onClick={() => nav('/')} className="btn-primary text-sm">
              Analyze a Product
            </button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item, idx) => {
              const sc = getScoreColor(item.sentiment_score)
              const mb = getModeBadge(item.mode)
              return (
                <div
                  key={item.id}
                  className="card group flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 md:p-5 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${idx * 40}ms` }}
                  onClick={() => nav(`/?id=${item.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold truncate group-hover:text-accent transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {item.product_name}
                      </p>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${mb.bg} ${mb.text}`}>
                        {item.mode || 'advanced'}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {item.platform?.toUpperCase()} · {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {item.verdict_decision && (
                        <span className={`ml-2 font-medium ${getVerdictStyle(item.verdict_decision)}`}>
                          · {item.verdict_decision}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`badge ${sc.badge} font-semibold`}>
                      {item.sentiment_score}/100
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); nav(`/?id=${item.id}`) }}
                      className="btn-outline text-xs px-3 py-1.5"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                      className="text-xs px-3 py-1.5 rounded-xl border transition-all hover:border-danger hover:text-danger"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchHistory(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    page === i + 1
                      ? 'bg-accent text-white'
                      : 'hover:bg-[var(--bg-hover)]'
                  }`}
                  style={page !== i + 1 ? { color: 'var(--text-muted)' } : {}}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}