import { useState } from 'react'
import api from '../lib/api'

export default function Compare() {
  const [a, setA] = useState(''); const [b, setB] = useState('')
  const [results, setResults] = useState(null); const [loading, setLoading] = useState(false)
  const run = async () => {
    if (!a.trim() || !b.trim()) return
    setLoading(true); setResults(null)
    try { const r = await api.post('/compare', {product_a:a,product_b:b,platform:'all',depth:'quick'}); setResults(r.data) }
    catch(e){} finally{setLoading(false)}
  }
  const Col = ({d}) => d ? (
    <div className="space-y-3">
      <p className="font-serif text-xl text-white">{d.product_name}</p>
      <div className="grid grid-cols-2 gap-2">
        {[['Score',`${d.sentiment?.score}/100`],['Positive',`${d.sentiment?.positive_pct?.toFixed(1)}%`]].map(([l,v])=>(
          <div key={l} className="bg-dark-card rounded-xl p-3 border border-dark-border"><p className="text-zinc-500 text-xs">{l}</p><p className="text-white text-xl font-medium">{v}</p></div>
        ))}
      </div>
      <div><p className="text-emerald-400 text-xs mb-2">PROS</p>{(d.pros||[]).slice(0,3).map((p,i)=><p key={i} className="text-zinc-300 text-sm">+ {p.text}</p>)}</div>
      <div><p className="text-red-400 text-xs mb-2">CONS</p>{(d.cons||[]).slice(0,3).map((c,i)=><p key={i} className="text-zinc-300 text-sm">- {c.text}</p>)}</div>
      <div className={`border-2 rounded-xl p-3 ${{YES:'border-emerald-500',MAYBE:'border-amber-500',NO:'border-red-500'}[d.verdict?.decision]||'border-zinc-500'}`}>
        <span className="font-bold text-lg text-white">{d.verdict?.decision}</span>
      </div>
    </div>
  ) : null
  return (
    <div className="min-h-screen bg-dark-bg text-white px-4 py-8 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl mb-6">Compare products</h1>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <input value={a} onChange={e=>setA(e.target.value)} placeholder="Product A..." className="bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-accent"/>
        <input value={b} onChange={e=>setB(e.target.value)} placeholder="Product B..." className="bg-dark-surface border border-dark-border rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-accent"/>
      </div>
      <button onClick={run} disabled={loading} className="w-full bg-accent text-black font-medium py-3 rounded-xl hover:bg-accent/90 disabled:opacity-50 mb-6">{loading?'Comparing...':'Compare'}</button>
      {results && <div className="grid grid-cols-2 gap-6"><Col d={results.product_a}/><Col d={results.product_b}/></div>}
    </div>
  )
}