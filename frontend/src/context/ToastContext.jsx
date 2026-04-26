import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast])
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast])
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none md:bottom-6 md:right-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto animate-slide-up cursor-pointer px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border max-w-sm text-sm font-medium transition-all
              ${toast.type === 'success' ? 'bg-success/10 border-success/30 text-success' : ''}
              ${toast.type === 'error' ? 'bg-danger/10 border-danger/30 text-danger' : ''}
              ${toast.type === 'info' ? 'bg-accent/10 border-accent/30 text-accent-light' : ''}
            `}
          >
            <div className="flex items-center gap-2">
              <span>
                {toast.type === 'success' && '✓'}
                {toast.type === 'error' && '✕'}
                {toast.type === 'info' && 'ℹ'}
              </span>
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
