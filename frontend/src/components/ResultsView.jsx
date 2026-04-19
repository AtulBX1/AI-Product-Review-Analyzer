import { useState } from 'react'

export default function ResultsView({ data }) {
  const [tab, setTab] = useState(0)
  const tabs = ['Key Insights','Hidden Patterns','Personas','Feature Requests','Reviews']
  const verdict = data.verdict || {}
  const vColor = { YES: 'border-emerald-500 text-emerald-400', MAYBE: 'border-amber-500 text-amber-400', NO: 'border-red-500 text-red-400' }[verdict.decision] || 'border-zinc-500 text-zinc-400'

  const downloadFile = async (type) => {
    const res = await fetch(`/api/export/${data.id}/${type}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`${data.product_name}_report.${type}`; a.click()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Sentiment Score',`${data.sentiment_score}/100`],['Reviews Analyzed',data.total_reviews],['Positive',`${data.sentiment?.positive_pct?.toFixed(1)}%`],['Recommendation',`${data.sentiment?.recommendation_rate?.toFixed(1)}%`]].map(([l,v])=>(
          <div key={l} className="bg-dark-surface border border-dark-border rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-medium">{v}</p>
          </div>
        ))}
      </div>
      <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
        <p className="text-zinc-500 text-xs mb-2">Sentiment breakdown</p>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          <div className="bg-emerald-500 rounded-l-full transition-all" style={{width:`${data.sentiment?.positive_pct}%`}}/>
          <div className="bg-zinc-500 transition-all" style={{width:`${data.sentiment?.neutral_pct}%`}}/>
          <div className="bg-red-500 rounded-r-full transition-all" style={{width:`${data.sentiment?.negative_pct}%`}}/>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-zinc-500">
          <span className="text-emerald-400">Positive {data.sentiment?.positive_pct?.toFixed(1)}%</span>
          <span>Neutral {data.sentiment?.neutral_pct?.toFixed(1)}%</span>
          <span className="text-red-400">Negative {data.sentiment?.negative_pct?.toFixed(1)}%</span>
        </div>
      </div>
      <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
        <div className="flex border-b border-dark-border overflow-x-auto">
          {tabs.map((t,i)=><button key={t} onClick={()=>setTab(i)} className={`px-4 py-3 text-sm whitespace-nowrap transition-colors ${tab===i?'text-accent border-b-2 border-accent':'text-zinc-500 hover:text-zinc-300'}`}>{t}</button>)}
        </div>
        <div className="p-5">
          {tab===0&&<div className="grid md:grid-cols-2 gap-6"><div><p className="text-emerald-400 text-xs font-medium mb-3">TOP PROS</p><div className="space-y-2">{(data.pros||[]).map((p,i)=><div key={i} className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">+</span><span className="text-zinc-300 text-sm flex-1">{p.text}</span><span className="text-xs text-zinc-500 bg-dark-card px-2 py-0.5 rounded-full">{p.frequency}x</span></div>)}</div></div><div><p className="text-red-400 text-xs font-medium mb-3">TOP CONS</p><div className="space-y-2">{(data.cons||[]).map((c,i)=><div key={i} className="flex items-start gap-2"><span className="text-red-400 mt-0.5">-</span><span className="text-zinc-300 text-sm flex-1">{c.text}</span><span className="text-xs text-zinc-500 bg-dark-card px-2 py-0.5 rounded-full">{c.frequency}x</span></div>)}</div></div></div>}
          {tab===1&&<div className="space-y-3">{(data.hidden_patterns||[]).map((p,i)=><div key={i} className="border-l-2 border-accent pl-4"><p className="text-white text-sm font-medium">{p.pattern}</p><p className="text-zinc-400 text-sm mt-1">{p.explanation}</p>{p.quote&&<p className="text-zinc-500 text-xs mt-2 italic">"{p.quote}"</p>}</div>)}</div>}
          {tab===2&&<div className="grid md:grid-cols-3 gap-4">{(data.personas||[]).map((p,i)=><div key={i} className="bg-dark-card rounded-xl p-4 border border-dark-border"><div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-medium text-sm mb-3">{p.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div><p className="text-white font-medium text-sm">{p.name}</p><p className="text-zinc-500 text-xs mt-1">{p.use_case}</p><div className="mt-3 h-1.5 bg-dark-border rounded-full"><div className="h-1.5 bg-accent rounded-full" style={{width:`${p.satisfaction}%`}}/></div><p className="text-zinc-500 text-xs mt-1">{p.satisfaction}% satisfied</p>{p.quote&&<p className="text-zinc-400 text-xs mt-2 italic">"{p.quote}"</p>}</div>)}</div>}
          {tab===3&&<div className="space-y-3">{(data.feature_requests||[]).map((f,i)=><div key={i} className="flex items-center gap-3"><span className="text-zinc-300 text-sm flex-1">{f.feature}</span><div className="w-32 h-2 bg-dark-border rounded-full"><div className="h-2 bg-accent rounded-full" style={{width:`${f.demand_pct}%`}}/></div><span className="text-xs text-zinc-500 w-12 text-right">{f.demand_pct?.toFixed(1)}%</span></div>)}</div>}
          {tab===4&&<div className="space-y-3">{(data.sample_reviews||[]).map((r,i)=><div key={i} className="bg-dark-card rounded-xl p-4 border border-dark-border"><div className="flex items-center gap-2 mb-2"><span className="text-amber-400 text-xs">{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</span><span className={`text-xs px-2 py-0.5 rounded-full ${r.type==='positive'?'bg-emerald-900/50 text-emerald-400':r.type==='negative'?'bg-red-900/50 text-red-400':'bg-zinc-800 text-zinc-400'}`}>{r.type}</span></div><p className="text-zinc-300 text-sm">{r.snippet}</p></div>)}</div>}
        </div>
      </div>
      <div className={`border-2 ${vColor} rounded-2xl p-6`}>
        <div className="flex items-center gap-3 mb-4"><span className={`text-2xl font-bold ${vColor.split(' ')[1]}`}>{verdict.decision}</span><span className="text-zinc-400 text-sm">— Should you buy this?</span></div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div><p className="text-xs text-zinc-500 mb-2">IDEAL FOR</p>{(verdict.ideal_for||[]).map((x,i)=><p key={i} className="text-zinc-300 text-sm">+ {x}</p>)}</div>
          <div><p className="text-xs text-zinc-500 mb-2">AVOID IF</p>{(verdict.avoid_if||[]).map((x,i)=><p key={i} className="text-zinc-300 text-sm">- {x}</p>)}</div>
        </div>
        {verdict.vs_competitors&&<p className="text-zinc-400 text-sm border-t border-dark-border pt-4">{verdict.vs_competitors}</p>}
      </div>
      <div className="flex gap-3">
        <button onClick={()=>downloadFile('pdf')} className="flex-1 border border-dark-border text-zinc-300 py-3 rounded-xl hover:border-accent hover:text-accent transition-colors text-sm">Export PDF</button>
        <button onClick={()=>downloadFile('csv')} className="flex-1 border border-dark-border text-zinc-300 py-3 rounded-xl hover:border-accent hover:text-accent transition-colors text-sm">Export CSV</button>
        <button onClick={()=>{navigator.clipboard.writeText(window.location.href);alert('Link copied!')}} className="flex-1 border border-dark-border text-zinc-300 py-3 rounded-xl hover:border-accent hover:text-accent transition-colors text-sm">Copy Link</button>
      </div>
    </div>
  )
}