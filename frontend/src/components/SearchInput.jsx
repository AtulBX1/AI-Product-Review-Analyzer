import { useState } from 'react'
export default function SearchInput({ onAnalyze, onReset }) {
  const [q, setQ] = useState('')
  const [platform, setPlatform] = useState('all')
  const [depth, setDepth] = useState('quick')
  const platforms = ['all','amazon','flipkart','g2','trustpilot']
  const depths = ['quick','deep','expert']
  const go = () => { if (q.trim().length >= 3) { onReset(); onAnalyze(q.trim(), platform, depth) } }
  return (
    <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 mb-6">
      <div className="flex gap-2 mb-3">
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key==='Enter' && go()} placeholder="Enter product name..." className="flex-1 bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-accent" />
        <button onClick={go} className="bg-accent text-black font-medium px-5 py-3 rounded-xl hover:bg-accent/90 transition-colors">Analyze</button>
      </div>
      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-1">{platforms.map(p=><button key={p} onClick={()=>setPlatform(p)} className={`text-xs px-3 py-1 rounded-full border capitalize transition-colors ${platform===p?'border-accent text-accent':'border-dark-border text-zinc-500'}`}>{p}</button>)}</div>
        <div className="flex gap-1">{depths.map(d=><button key={d} onClick={()=>setDepth(d)} className={`text-xs px-3 py-1 rounded-full border capitalize transition-colors ${depth===d?'border-emerald-400 text-emerald-400':'border-dark-border text-zinc-500'}`}>{d}</button>)}</div>
      </div>
    </div>
  )
}