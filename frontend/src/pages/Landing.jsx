import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../lib/api'

export default function Landing() {
  const [q, setQ] = useState('')
  const [platform, setPlatform] = useState('all')
  const [popular, setPopular] = useState([])
  const nav = useNavigate()

  useEffect(() => { api.get('/analyze/popular').then(r => setPopular(r.data)).catch(() => {}) }, [])

  const go = () => { if (q.trim().length >= 3) nav(`/analyze?product=${encodeURIComponent(q)}&platform=${platform}`) }

  const platforms = ['all','amazon','flipkart','g2','trustpilot']

  return (
    <main className="min-h-screen bg-dark-bg text-white flex flex-col items-center justify-center px-4 py-20">
      <h1 className="font-serif text-5xl md:text-6xl text-center mb-4 leading-tight">Understand what customers<br/>really think</h1>
      <p className="text-zinc-400 text-lg text-center mb-10">Paste any product name. AI reads hundreds of reviews in seconds.</p>
      <div className="w-full max-w-2xl">
        <div className="flex gap-2 mb-3">
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} placeholder="e.g. Sony WH-1000XM5 headphones..." className="flex-1 bg-dark-surface border border-dark-border rounded-xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-accent text-base" />
          <button onClick={go} className="bg-accent text-black font-medium px-6 py-4 rounded-xl hover:bg-accent/90 transition-colors whitespace-nowrap">Analyze</button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {platforms.map(p => <button key={p} onClick={() => setPlatform(p)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${platform===p ? 'border-accent text-accent' : 'border-dark-border text-zinc-500 hover:border-zinc-500'}`}>{p}</button>)}
        </div>
      </div>
      {popular.length > 0 && (
        <div className="mt-12 w-full max-w-2xl">
          <p className="text-zinc-500 text-sm mb-3">Trending products</p>
          <div className="flex gap-2 flex-wrap">{popular.map(p => <button key={p.name} onClick={() => setQ(p.name)} className="text-sm bg-dark-surface border border-dark-border text-zinc-300 px-4 py-2 rounded-full hover:border-accent hover:text-accent transition-colors">{p.name}</button>)}</div>
        </div>
      )}
    </main>
  )
}