import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function History() {
  const [items, setItems] = useState([])
  const nav = useNavigate()
  useEffect(() => { api.get('/history').then(r => setItems(r.data.items)).catch(()=>{}) }, [])
  const del = async (id) => { await api.delete(`/history/${id}`); setItems(items.filter(i=>i.id!==id)) }
  return (
    <div className="min-h-screen bg-dark-bg text-white px-4 py-8 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl mb-6">Analysis history</h1>
      {items.length === 0 ? <p className="text-zinc-500">No analyses yet. Go analyze a product!</p> : (
        <div className="space-y-2">{items.map(item=>(
          <div key={item.id} className="bg-dark-surface border border-dark-border rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1"><p className="text-white font-medium">{item.product_name}</p><p className="text-zinc-500 text-xs mt-0.5">{item.platform} · {new Date(item.created_at).toLocaleDateString()}</p></div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${item.sentiment_score>=70?'bg-emerald-900/50 text-emerald-400':item.sentiment_score>=50?'bg-amber-900/50 text-amber-400':'bg-red-900/50 text-red-400'}`}>{item.sentiment_score}/100</span>
            <button onClick={()=>nav(`/analyze?id=${item.id}`)} className="text-xs text-zinc-400 hover:text-accent border border-dark-border px-3 py-1.5 rounded-lg">View</button>
            <button onClick={()=>del(item.id)} className="text-xs text-zinc-400 hover:text-red-400 border border-dark-border px-3 py-1.5 rounded-lg">Delete</button>
          </div>
        ))}</div>
      )}
    </div>
  )
}