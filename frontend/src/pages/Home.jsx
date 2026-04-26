import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import ResultsView from '../components/ResultsView'
import SkeletonLoader from '../components/SkeletonLoader'
import { useToast } from '../context/ToastContext'

export default function Home() {
  const [params] = useSearchParams()
  const { success, error: toastError } = useToast()

  const [product, setProduct] = useState('')
  const [platform, setPlatform] = useState('all')
  const [mode, setMode] = useState('advanced')
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [data, setData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [popular, setPopular] = useState([])

  // Dynamic catalog state
  const [showCatalog, setShowCatalog] = useState(false)
  const [catalog, setCatalog] = useState(null)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogProduct, setCatalogProduct] = useState('') // track which product the catalog is for
  const [catalogValues, setCatalogValues] = useState({})  // { field_id: value }
  const [budgetValue, setBudgetValue] = useState(null)

  const platforms = ['all', 'amazon', 'flipkart', 'g2', 'trustpilot']
  const modes = ['basic', 'advanced']

  useEffect(() => {
    api.get('/analyze/popular').then((r) => setPopular(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const id = params.get('id')
    const prod = params.get('product')
    const plat = params.get('platform')
    if (id) {
      loadAnalysis(id)
    } else if (prod) {
      setProduct(prod)
      if (plat) setPlatform(plat)
      runAnalysis(prod, plat || 'all', 'advanced')
    }
  }, [])

  const loadAnalysis = async (id) => {
    setStatus('loading')
    try {
      const res = await api.get(`/analyze/${id}`)
      setData(res.data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
      toastError('Failed to load analysis')
    }
  }

  const fetchCatalog = useCallback(async () => {
    const prod = product.trim()
    if (prod.length < 3) {
      toastError('Enter a product name first (at least 3 characters)')
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
      // Set default budget to midpoint
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
  }, [product, catalogProduct, catalog])

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
    return {
      budget: budgetValue || 'Not specified',
      catalog_fields: catalogFields,
    }
  }

  const runAnalysis = async (prod, plat, m) => {
    setStatus('loading')
    setData(null)
    setErrorMsg('')
    try {
      const userContext = buildUserContext()
      const res = await api.post('/analyze', {
        product: prod,
        platform: plat,
        mode: m,
        ...(userContext && { user_context: userContext }),
      })
      setData(res.data)
      setStatus('done')
      success('Analysis complete!')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
      toastError(err.message || 'Analysis failed')
    }
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (product.trim().length < 3) return
    runAnalysis(product.trim(), platform, mode)
  }

  const updateCatalogValue = (fieldId, value) => {
    setCatalogValues(prev => ({ ...prev, [fieldId]: value }))
  }

  const toggleMultiSelect = (fieldId, optionValue) => {
    setCatalogValues(prev => {
      const current = prev[fieldId] || []
      const exists = current.includes(optionValue)
      return {
        ...prev,
        [fieldId]: exists ? current.filter(v => v !== optionValue) : [...current, optionValue]
      }
    })
  }

  // Count filled catalog fields
  const filledCount = Object.values(catalogValues).filter(v => v != null && v !== '' && !(Array.isArray(v) && v.length === 0)).length

  return (
    <div className="page-transition">
      {/* Hero Section */}
      {status === 'idle' && !data && (
        <div className="text-center py-12 md:py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 bg-accent/10 text-accent-light border border-accent/20">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            AI-Powered Decision Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            <span style={{ color: 'var(--text-primary)' }}>Make confident</span>
            <br />
            <span className="gradient-text">buying decisions</span>
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto mb-10" style={{ color: 'var(--text-muted)' }}>
            Enter any product name. Our AI analyzes real reviews and delivers trust scores, pain points, emotions, and a clear verdict.
          </p>
        </div>
      )}

      {/* Search Form */}
      <div className={`card-flat p-5 md:p-6 mb-6 ${status === 'idle' && !data ? 'max-w-2xl mx-auto' : ''}`}>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 mb-4">
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Sony WH-1000XM5, iPhone 15 Pro, Kindle Paperwhite..."
              className="input-field flex-1 text-base"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={product.trim().length < 3 || status === 'loading'}
              className="btn-primary whitespace-nowrap flex items-center gap-2"
            >
              {status === 'loading' ? (
                <><LoadingSpinner /> Analyzing...</>
              ) : (
                <><SearchIcon className="w-4 h-4" /> Analyze</>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Platform selector */}
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-xs font-medium mr-1" style={{ color: 'var(--text-muted)' }}>Platform:</span>
              {platforms.map((p) => (
                <button key={p} type="button" onClick={() => setPlatform(p)} disabled={status === 'loading'}
                  className={`text-xs px-3 py-1 rounded-full border capitalize transition-all ${
                    platform === p ? 'border-accent text-accent bg-accent/5 font-medium' : 'hover:border-accent/50'
                  }`}
                  style={platform !== p ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
                >{p}</button>
              ))}
            </div>

            <div className="w-px h-5 hidden md:block" style={{ background: 'var(--border-color)' }} />

            {/* Mode selector */}
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-xs font-medium mr-1" style={{ color: 'var(--text-muted)' }}>Mode:</span>
              {modes.map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)} disabled={status === 'loading'}
                  className={`text-xs px-3 py-1 rounded-full border capitalize transition-all ${
                    mode === m ? 'border-success text-success bg-success/5 font-medium' : 'hover:border-success/50'
                  }`}
                  style={mode !== m ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
                >{m}</button>
              ))}
            </div>

            <div className="w-px h-5 hidden md:block" style={{ background: 'var(--border-color)' }} />

            {/* Personalize toggle */}
            <button type="button" onClick={fetchCatalog} disabled={status === 'loading' || catalogLoading}
              className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                showCatalog ? 'border-accent text-accent bg-accent/5' : 'hover:border-accent/50'
              }`}
              style={!showCatalog ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
            >
              {catalogLoading ? <LoadingSpinner size="sm" /> : <span>🎯</span>}
              {catalogLoading ? 'Loading...' : showCatalog && catalog ? `Personalize (${filledCount})` : 'Personalize'}
            </button>
          </div>

          {/* Dynamic Catalog */}
          {showCatalog && (
            <div className="mt-4 pt-4 border-t animate-fade-in" style={{ borderColor: 'var(--border-color)' }}>
              {catalogLoading ? (
                <CatalogSkeleton />
              ) : catalog ? (
                <DynamicCatalog
                  catalog={catalog}
                  values={catalogValues}
                  budgetValue={budgetValue}
                  onChange={updateCatalogValue}
                  onToggleMulti={toggleMultiSelect}
                  onBudgetChange={setBudgetValue}
                  disabled={status === 'loading'}
                />
              ) : null}
            </div>
          )}
        </form>
      </div>

      {/* Popular Products */}
      {status === 'idle' && !data && popular.length > 0 && (
        <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Trending Products</p>
          <div className="flex gap-2 flex-wrap">
            {popular.map((p) => (
              <button key={p.name} onClick={() => setProduct(p.name)}
                className="text-sm px-4 py-2 rounded-full border transition-all hover:border-accent hover:text-accent"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}
              >{p.name}</button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {status === 'loading' && (
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-6">
            <LoadingSpinner />
            <p className="text-sm font-medium text-accent animate-pulse">
              AI is analyzing reviews and generating insights... This may take a moment.
            </p>
          </div>
          <SkeletonLoader />
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="mt-4 card-flat border-danger/30 p-5 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-danger/10 text-danger flex items-center justify-center flex-shrink-0 font-bold">!</span>
            <div>
              <p className="font-semibold text-danger mb-1">Analysis Failed</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{errorMsg}</p>
              <button onClick={() => { setStatus('idle'); setErrorMsg('') }} className="btn-outline text-sm mt-3">Try Again</button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {status === 'done' && data && <ResultsView data={data} />}
    </div>
  )
}

/* ========== DYNAMIC CATALOG COMPONENT ========== */
function DynamicCatalog({ catalog, values, budgetValue, onChange, onToggleMulti, onBudgetChange, disabled }) {
  const fields = catalog.personalization_fields || []
  const bc = catalog.budget_config

  return (
    <div>
      {/* Category Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{catalog.category_icon || '📦'}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Personalize for {catalog.detected_category || 'this product'}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Fill in your preferences for a tailored recommendation
          </p>
        </div>
      </div>

      {/* Budget Slider */}
      {bc?.enabled && (
        <div className="mb-5 p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              💰 {bc.label || 'Budget'}
            </label>
            <span className="text-sm font-bold text-accent">
              {bc.currency === 'INR' ? '₹' : '$'}{(budgetValue || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min={bc.min} max={bc.max} step={bc.step}
            value={budgetValue || bc.min}
            onChange={(e) => onBudgetChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full accent-[var(--accent)] h-2 rounded-full cursor-pointer"
          />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            <span>{bc.currency === 'INR' ? '₹' : '$'}{bc.min.toLocaleString('en-IN')}</span>
            <span>{bc.currency === 'INR' ? '₹' : '$'}{bc.max.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* Dynamic Fields Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <CatalogField
            key={field.field_id}
            field={field}
            value={values[field.field_id]}
            onChange={(val) => onChange(field.field_id, val)}
            onToggleMulti={(optVal) => onToggleMulti(field.field_id, optVal)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

function CatalogField({ field, value, onChange, onToggleMulti, disabled }) {
  const { type, label, icon, options, range_config, placeholder, required, help_text } = field

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
        {icon && <span>{icon}</span>}
        {label}
        {required && <span className="text-danger text-[10px]">*</span>}
      </label>

      {type === 'single_select' && options && (
        <div className="flex flex-wrap gap-1.5">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              disabled={disabled}
              title={opt.description || ''}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                value === opt.value
                  ? 'border-accent text-accent bg-accent/10 font-medium'
                  : 'hover:border-accent/40'
              }`}
              style={value !== opt.value ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {type === 'multi_select' && options && (
        <div className="flex flex-wrap gap-1.5">
          {options.map((opt) => {
            const selected = (value || []).includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onToggleMulti(opt.value)}
                disabled={disabled}
                title={opt.description || ''}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  selected
                    ? 'border-accent text-accent bg-accent/10 font-medium'
                    : 'hover:border-accent/40'
                }`}
                style={!selected ? { borderColor: 'var(--border-color)', color: 'var(--text-muted)' } : {}}
              >
                {selected && <span className="mr-1">✓</span>}
                {opt.label}
              </button>
            )
          })}
        </div>
      )}

      {type === 'range' && range_config && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {range_config.prefix || ''}{range_config.min}{range_config.unit || ''}
            </span>
            <span className="text-xs font-semibold text-accent">
              {range_config.prefix || ''}{value ?? range_config.min}{range_config.unit || ''}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {range_config.prefix || ''}{range_config.max}{range_config.unit || ''}
            </span>
          </div>
          <input
            type="range"
            min={range_config.min} max={range_config.max} step={range_config.step}
            value={value ?? range_config.min}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full accent-[var(--accent)] h-1.5 rounded-full cursor-pointer"
          />
        </div>
      )}

      {type === 'text' && (
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ''}
          disabled={disabled}
          className="input-field text-sm"
        />
      )}

      {help_text && (
        <p className="text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>{help_text}</p>
      )}
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <div className="skeleton w-8 h-8 rounded-lg" />
        <div className="skeleton h-4 w-48" />
      </div>
      <div className="skeleton h-14 rounded-xl" />
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton h-3 w-24" />
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, j) => <div key={j} className="skeleton h-7 w-20 rounded-lg" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ========== ICONS ========== */
function LoadingSpinner({ size }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <svg className={`${cls} animate-spin text-accent`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}
