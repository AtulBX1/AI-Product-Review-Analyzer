import { Link, useLocation } from 'react-router-dom'
export default function Navbar({ dark, setDark }) {
  const loc = useLocation()
  const link = (to, label) => (
    <Link to={to} className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${loc.pathname === to ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}>{label}</Link>
  )
  return (
    <nav className="border-b border-white/10 dark:border-zinc-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-dark-bg/80">
      <span className="font-serif text-lg text-white">ReviewAI</span>
      <div className="flex gap-1">{link('/','Home')}{link('/analyze','Analyze')}{link('/compare','Compare')}{link('/history','History')}</div>
      <button onClick={() => setDark(!dark)} className="text-zinc-400 hover:text-white text-lg">{dark ? '☀' : '☾'}</button>
    </nav>
  )
}