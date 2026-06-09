import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

/**
 * Toast Notification System
 * Provides app-wide toast notifications with auto-dismiss
 */
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, isExiting: false }])

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, isExiting: true } : t))
    )
    // Remove from DOM after exit animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
  }, [])

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />
      case 'error': return <XCircle size={20} />
      case 'info': return <Info size={20} />
      default: return <Info size={20} />
    }
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.isExiting ? 'toast-exit' : ''}`}
          >
            {getIcon(toast.type)}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                opacity: 0.7
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
