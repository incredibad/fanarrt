import { useState, useCallback } from 'react'

let _addToast = null

export function useToastSetup() {
  const [toasts, setToasts] = useState([])

  _addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  return { toasts }
}

export function toast(message, type = 'info') {
  if (_addToast) _addToast(message, type)
}

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' && '✓'}
          {t.type === 'error' && '✕'}
          {t.type === 'info' && '·'}
          {t.message}
        </div>
      ))}
    </div>
  )
}
