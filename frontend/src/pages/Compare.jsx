import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'

export default function Compare() {
  const [productA, setProductA] = useState('')
  const [productB, setProductB] = useState('')
  const [platform, setPlatform] = useState('all')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectTarget, setSelectTarget] = useState(null)
  const { success, error: toastError } = useToast()

  // Dynamic catalog state
  const [showCatalog, setShowCatalog] = useState(false)
  const [catalog, setCatalog] = useState(null)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogProduct, setCatalogProduct] = useState('')
  const [catalogValues, setCatalogValues] = useState({})
  const [budgetValue, setBudgetValue] = useState(null)

  const platforms = ['all', 'amazon', 'flipkart', 'g2', 'trustpilot']

  useEffect(() => {
    api.get('/history?page=1').then((r) => setHistory(r.data.items || [])).catch(() => {})
  }, [])

  const fetchCatalog = useCallback(async () => {
    const prod = productA.trim()
    if (prod.length < 3) {
      toastError('Enter Product A first (at least 3 characters)')
      return
    }
    if (catalogProduct === prod && catalog) {
      setShowCatalog(true)
      return
    }
    setCatalogLoading(true)
    setShowCatalog(true)
    setCatalog(null)
    setCatalogValues({})
    setBudgetValue(null)
    try {
      const res = await api.post('/catalog', { product: prod })
      setCatalog(res.data)
      setCatalogProduct(prod)
      const bc = res.data.budget_config
      if (bc?.enabled) {
        setBudgetValue(Math.round((bc.min + bc.max) / 2 / bc.step) * bc.step)
      }
    } catch {
      toastError('Failed to load personalization options')
      setShowCatalog(false)
    } finally {
      setCatalogLoading(false)
    }
  }, [productA, catalogProduct, catalog])

  const buildUserContext = () => {
    if (!catalog || !showCatalog) return null
    const fields = catalog.personalization_fields || []
    const catalogFields = []
    for (const f of fields) {
      const val = catalogValues[f.field_id]
      if (val != null && val !== '' && !(Array.isArray(val) && val.length === 0)) {
        catalogFields.push({
          field_id: f.field_id,
          label: f.label,
          value: Array.isArray(val) ? val.join(', ') : String(val),
        })
      }
    }
    if (catalogFields.length === 0 && !budgetValue) return null
    return { budget: budgetValue || 'Not specified', catalog_fields: catalogFields }
  }

  const runCompare = async () => {
    if (!productA.trim() || !productB.trim()) {
      toastError('Please enter both product names')
      return
    }
    setLoading(true)
    setResults(null)
    try {
      const userContext = buildUserContext()
      const res = await api.post('/compare', {
        product_a: productA.trim(),
        product_b: productB.trim(),
        platform,
        ...(userContext && { user_context: userContext }),
      })
      setResults(res.data)
      success('Comparison complete!')
    } catch (err) {
      toastError(err.message || 'Comparison failed')
    } finally {
      setLoading(false)
    }
  }

  const selectFromHistory = (item) => {
    if (selectTarget === 'a') setProductA(item.product_name)
    else setProductB(item.product_name)
    setShowHistory(false)
    setSelectTarget(null)
  }

  const updateCatalogValue = (fieldId, value) => {
    setCatalogValues(prev => ({ ...prev, [fieldId]: value }))
  }
  const toggleMultiSelect = (fieldId, optionValue) => {
    setCatalogValues(prev => {
      const current = prev[fieldId] || []
      return { ...prev, [fieldId]: current.includes(optionValue) ? current.filter(v => v !== optionValue) : [...current, optionValue] }
    })
  }

  return (
    <div className="page-transition">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Compare Products</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Analyze two products side by side with trust scores, pain points, and a clear winner
        </p>
      </div>

      {/* Input Form */}
      <div className="card-flat p-5 md:p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Product A</label>
            <div className="flex gap-2">
              <input value={productA} onChange={(e) => setProductA(e.target.value)} placeholder="e.g. Sony WH-1000XM5" className="input-field flex-1" disabled={loading} />
              {history.length > 0 && (
                <button onClick={() => { setSelectTarget('a'); setShowHistory(true) }} className="btn-outline text-xs px-3 whitespace-nowrap" disabled={loading}>History</button>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Product B</label>
            <div className="flex gap-2">
              <input value={productB} onChange={(e) => setProductB(e.target.value)} placeholder="e.g. Bose QC Ultra" className="input-field flex-1" disabled={loading} />
              {history.length > 0 && (
                <button onClick={() => { setSelectTarget('b'); setShowHistory(true) }} className="btn-outline text-xs px-3 whitespace-nowrap" disabled={loading}>History</button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Platform:</span>
          {platforms.map((p) => (
            <button key={p} onClick={() => setPlatform(p)} disabled={loading}
              className={`text-xs px-3 py-1 rounded-full border capitalize transition-all ${platform === p ? 'border-accent text-accent bg-accent/5 font-medium' : 'hover:border-accent/50'}`}
              style={platform !== p ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
            >{p}</button>
          ))}

          <div className="w-px h-5 hidden md:block" style={{ background: 'var(--border-color)' }} />

          <button type="button" onClick={fetchCatalog} disabled={loading || catalogLoading}
            className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${showCatalog ? 'border-accent text-accent bg-accent/5' : 'hover:border-accent/50'}`}
            style={!showCatalog ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
          >
            {catalogLoading ? <MiniSpinner /> : <span>🎯</span>}
            {catalogLoading ? 'Loading...' : 'Personalize'}
          </button>
        </div>

        {/* Dynamic Catalog */}
        {showCatalog && (
          <div className="mb-4 pt-4 border-t animate-fade-in" style={{ borderColor: 'var(--border-color)' }}>
            {catalogLoading ? (
              <CompareCatalogSkeleton />
            ) : catalog ? (
              <CompareCatalog catalog={catalog} values={catalogValues} budgetValue={budgetValue}
                onChange={updateCatalogValue} onToggleMulti={toggleMultiSelect} onBudgetChange={setBudgetValue} disabled={loading} />
            ) : null}
          </div>
        )}

        <button
          onClick={runCompare}
          disabled={loading || !productA.trim() || !productB.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner /> Comparing...
            </>
          ) : (
            <>
              <CompareIcon className="w-4 h-4" /> Compare Products
            </>
          )}
        </button>
      </div>

      {/* History Selector Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
          <div className="w-full max-w-md rounded-2xl p-5 max-h-[60vh] overflow-y-auto animate-slide-up"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Select Product {selectTarget === 'a' ? 'A' : 'B'}
            </h3>
            <div className="space-y-2">
              {history.filter(h => h.mode !== 'comparison').map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectFromHistory(item)}
                  className="w-full text-left p-3 rounded-xl border transition-all hover:border-accent"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.product_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Score: {item.sentiment_score}/100 · {item.verdict_decision || 'N/A'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <LoadingSpinner />
            <p className="text-sm font-medium text-accent animate-pulse">
              AI is comparing products... This may take a moment.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="card-flat p-6 space-y-4">
                <div className="skeleton h-6 w-40" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => <div key={j} className="skeleton h-4" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results yet */}
      {!loading && !results && (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          }
          title="Compare two products"
          description="Enter two product names above and click Compare to see a detailed side-by-side analysis with trust scores and a clear winner."
        />
      )}

      {/* Comparison Results */}
      {results && <ComparisonResults data={results} />}
    </div>
  )
}

/* ========== COMPARISON RESULTS ========== */
function ComparisonResults({ data }) {
  const products = data.products || []
  const compTable = data.comparison_table || []
  const winner = data.winner || {}
  const personalRec = data.personalized_recommendation || {}

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Winner Banner */}
      {winner.product_name && (
        <div className="card-flat border-2 border-success/40 bg-success/5 p-5 md:p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-success mb-2">🏆 Winner</p>
          <h3 className="text-2xl font-bold text-success mb-2">{winner.product_name}</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{winner.reason}</p>
          {winner.best_for && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Best for: {winner.best_for}
            </p>
          )}
        </div>
      )}

      {/* Product Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {products.map((p, idx) => (
          <ProductCard key={idx} product={p} isWinner={p.product_name === winner.product_name} />
        ))}
      </div>

      {/* Comparison Table */}
      {compTable.length > 0 && (
        <div className="card-flat overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider p-5 pb-0" style={{ color: 'var(--text-muted)' }}>
            Dimension-by-Dimension Comparison
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Dimension</th>
                  {products.map((p) => (
                    <th key={p.product_name} className="text-left p-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {p.product_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compTable.map((row, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="p-4 font-medium" style={{ color: 'var(--text-primary)' }}>{row.dimension}</td>
                    {products.map((p) => (
                      <td key={p.product_name} className="p-4" style={{ color: 'var(--text-secondary)' }}>
                        {row.values?.[p.product_name] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Personalized Recommendation */}
      {personalRec.available && personalRec.recommended_product && (
        <div className="card-flat border-accent/20 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🎯</span>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>For You</p>
          </div>
          <p className="text-lg font-bold text-accent mb-2">
            We recommend: {personalRec.recommended_product}
          </p>
          {personalRec.reason && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{personalRec.reason}</p>
          )}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, isWinner }) {
  const p = product
  const sentiment = p.sentiment_summary || {}
  const trust = p.trust_score || {}
  const verdict = p.final_verdict || {}

  const trustColor = (trust.score ?? 0) >= 75 ? 'text-success' : (trust.score ?? 0) >= 40 ? 'text-warning' : 'text-danger'
  const verdictColor = {
    'Recommended': 'text-success border-success/40',
    'Not Recommended': 'text-danger border-danger/40',
    'Conditional': 'text-warning border-warning/40',
  }[verdict.decision] || ''

  return (
    <div className={`card-flat p-5 md:p-6 space-y-5 animate-slide-up ${isWinner ? 'ring-2 ring-success/30' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          {isWinner && <span className="text-xs text-success font-semibold">🏆 Winner</span>}
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{p.product_name}</h3>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${trustColor}`}>{trust.score ?? '—'}</p>
          <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Trust</p>
        </div>
      </div>

      {p.overall_summary && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {p.overall_summary}
        </p>
      )}

      {/* Sentiment Bars */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Positive" value={`${sentiment.positive ?? 0}%`} color="text-success" />
        <MiniStat label="Negative" value={`${sentiment.negative ?? 0}%`} color="text-danger" />
        <MiniStat label="Neutral" value={`${sentiment.neutral ?? 0}%`} color="" />
      </div>

      {/* Pros */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-success mb-2">Top Pros</p>
        <div className="space-y-1.5">
          {(p.top_pros || []).slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-success mt-0.5 flex-shrink-0">✓</span>
              <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cons */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-danger mb-2">Top Cons</p>
        <div className="space-y-1.5">
          {(p.top_cons || []).slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-danger mt-0.5 flex-shrink-0">✕</span>
              <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pain Points */}
      {(p.top_pain_points || []).length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Top Pain Points</p>
          <div className="space-y-1">
            {p.top_pain_points.slice(0, 3).map((pp, i) => (
              <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {pp}</p>
            ))}
          </div>
        </div>
      )}

      {/* Verdict */}
      <div className={`border-2 ${verdictColor} rounded-xl p-4 text-center`}>
        <p className="text-lg font-extrabold">{verdict.decision || '—'}</p>
        {verdict.one_line_verdict && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{verdict.one_line_verdict}</p>
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <p className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className={`text-sm font-bold ${color}`} style={!color ? { color: 'var(--text-primary)' } : {}}>{value}</p>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function MiniSpinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function CompareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  )
}

/* ========== COMPARE CATALOG ========== */
function CompareCatalog({ catalog, values, budgetValue, onChange, onToggleMulti, onBudgetChange, disabled }) {
  const fields = catalog.personalization_fields || []
  const bc = catalog.budget_config

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{catalog.category_icon || '📦'}</span>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Personalize for {catalog.detected_category || 'this category'}
        </p>
      </div>

      {bc?.enabled && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>💰 {bc.label || 'Budget'}</label>
            <span className="text-sm font-bold text-accent">{bc.currency === 'INR' ? '₹' : '$'}{(budgetValue || 0).toLocaleString('en-IN')}</span>
          </div>
          <input type="range" min={bc.min} max={bc.max} step={bc.step} value={budgetValue || bc.min}
            onChange={(e) => onBudgetChange(Number(e.target.value))} disabled={disabled}
            className="w-full accent-[var(--accent)] h-1.5 rounded-full cursor-pointer" />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            <span>{bc.currency === 'INR' ? '₹' : '$'}{bc.min.toLocaleString('en-IN')}</span>
            <span>{bc.currency === 'INR' ? '₹' : '$'}{bc.max.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {fields.map((field) => (
          <div key={field.field_id} className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
              {field.icon && <span>{field.icon}</span>} {field.label}
              {field.required && <span className="text-danger text-[10px]">*</span>}
            </label>

            {field.type === 'single_select' && field.options && (
              <div className="flex flex-wrap gap-1">
                {field.options.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => onChange(field.field_id, opt.value)} disabled={disabled}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${values[field.field_id] === opt.value ? 'border-accent text-accent bg-accent/10 font-medium' : 'hover:border-accent/40'}`}
                    style={values[field.field_id] !== opt.value ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
                  >{opt.label}</button>
                ))}
              </div>
            )}

            {field.type === 'multi_select' && field.options && (
              <div className="flex flex-wrap gap-1">
                {field.options.map((opt) => {
                  const sel = (values[field.field_id] || []).includes(opt.value)
                  return (
                    <button key={opt.value} type="button" onClick={() => onToggleMulti(field.field_id, opt.value)} disabled={disabled}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${sel ? 'border-accent text-accent bg-accent/10 font-medium' : 'hover:border-accent/40'}`}
                      style={!sel ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
                    >{sel && '✓ '}{opt.label}</button>
                  )
                })}
              </div>
            )}

            {field.type === 'range' && field.range_config && (
              <div>
                <div className="flex justify-between text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>
                  <span>{field.range_config.min}{field.range_config.unit}</span>
                  <span className="font-semibold text-accent">{values[field.field_id] ?? field.range_config.min}{field.range_config.unit}</span>
                  <span>{field.range_config.max}{field.range_config.unit}</span>
                </div>
                <input type="range" min={field.range_config.min} max={field.range_config.max} step={field.range_config.step}
                  value={values[field.field_id] ?? field.range_config.min} onChange={(e) => onChange(field.field_id, Number(e.target.value))}
                  disabled={disabled} className="w-full accent-[var(--accent)] h-1.5 rounded-full cursor-pointer" />
              </div>
            )}

            {field.type === 'text' && (
              <input value={values[field.field_id] || ''} onChange={(e) => onChange(field.field_id, e.target.value)}
                placeholder={field.placeholder || ''} disabled={disabled} className="input-field text-sm" />
            )}

            {field.help_text && <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{field.help_text}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function CompareCatalogSkeleton() {
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="skeleton w-7 h-7 rounded-lg" />
        <div className="skeleton h-3 w-40" />
      </div>
      <div className="skeleton h-12 rounded-xl" />
      <div className="grid md:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="skeleton h-3 w-20" />
            <div className="flex gap-1">{[...Array(3)].map((_, j) => <div key={j} className="skeleton h-6 w-16 rounded-lg" />)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}