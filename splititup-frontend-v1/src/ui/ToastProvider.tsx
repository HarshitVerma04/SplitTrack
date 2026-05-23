import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'

type ToastTone = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  title: string
  tone: ToastTone
}

type ToastContextValue = {
  showToast: (title: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function toneClass(tone: ToastTone) {
  if (tone === 'success') {
    return 'border-[#86efac] bg-[#f0fdf4] text-[#14532d] dark:border-[#166534] dark:bg-[#052e16] dark:text-[#bbf7d0]'
  }
  if (tone === 'error') {
    return 'border-[#fecaca] bg-[#fef2f2] text-[#7f1d1d] dark:border-[#7f1d1d] dark:bg-[#3f0d0d] dark:text-[#fecaca]'
  }
  return 'border-[#cbd5e1] bg-white text-[#1e293b] dark:border-[#334155] dark:bg-[#1e293b] dark:text-[#e2e8f0]'
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((title: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, title, tone }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'rounded-lg border px-3 py-2 text-sm font-semibold shadow-lg backdrop-blur',
              toneClass(toast.tone),
            ].join(' ')}
          >
            {toast.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
