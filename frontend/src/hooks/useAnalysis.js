import { useState } from 'react'
import api from '../lib/api'

export function useAnalysis() {
  const [status, setStatus] = useState('idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  async function analyze(product, platform, depth) {
    setStatus('fetching')
    setError(null)
    try {
      await new Promise(r => setTimeout(r, 1200))
      setStatus('analyzing')
      const res = await api.post('/analyze', { product, platform, depth })
      setData(res.data)
      setStatus('done')
      const recent = JSON.parse(localStorage.getItem('recent_analyses') || '[]')
      const updated = [{ id: res.data.id, product_name: res.data.product_name, sentiment_score: res.data.sentiment_score, created_at: res.data.created_at }, ...recent].slice(0, 5)
      localStorage.setItem('recent_analyses', JSON.stringify(updated))
    } catch (err) {
      setError(err.detail || err.error || 'Analysis failed')
      setStatus('error')
    }
  }

  function reset() { setStatus('idle'); setData(null); setError(null) }
  return { status, data, error, analyze, reset }
}