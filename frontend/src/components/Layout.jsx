import { NavLink, Outlet } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useState, useEffect } from 'react'
import api from '../lib/api'

const navItems = [
  { to: '/', label: 'Analyze', icon: SearchIcon },
  { to: '/history', label: 'History', icon: ClockIcon },
  { to: '/compare', label: 'Compare', icon: CompareIcon },
]

export default function Layout() {
  const { dark, toggle } = useTheme()
  const [health, setHealth] = useState(null)

  useEffect(() => {
    api.get('/health').then((r) => setHealth(r.data)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] fixed inset-y-0 left-0 z-40 border-r transition-colors"
        style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
              <SparkleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>ReviewAI</h1>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Product Analyzer</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'hover:bg-[var(--bg-hover)]'
                }`
              }
              style={({ isActive }) => ({ color: isActive ? undefined : 'var(--text-secondary)' })}
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 space-y-3">
          <button onClick={toggle}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}>
            {dark ? <SunIcon className="w-[18px] h-[18px]" /> : <MoonIcon className="w-[18px] h-[18px]" />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {health && (
            <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>API Connected</span>
              </div>
              <p style={{ color: 'var(--text-muted)' }}>Model: {health.model}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 px-4 py-3 flex items-center justify-between border-b backdrop-blur-md"
        style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
            <SparkleIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>ReviewAI</span>
        </div>
        <button onClick={toggle} className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]" style={{ color: 'var(--text-secondary)' }}>
          {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-[260px] pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-md"
        style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
                  isActive ? 'text-accent' : ''
                }`
              }
              style={({ isActive }) => ({ color: isActive ? undefined : 'var(--text-muted)' })}
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

/* Inline SVG Icons */
function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CompareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

function SparkleIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  )
}

function SunIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function MoonIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}
