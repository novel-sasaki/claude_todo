'use client'

import { useEffect } from 'react'
import { useTodo } from '@/context/TodoContext'

export default function Toast() {
  const { state, dispatch } = useTodo()

  useEffect(() => {
    if (state.toasts.length === 0) return
    const latest = state.toasts[state.toasts.length - 1]
    const timer = setTimeout(() => {
      dispatch({ type: 'POP_TOAST', id: latest.id })
    }, 2400)
    return () => clearTimeout(timer)
  }, [state.toasts, dispatch])

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[200] flex flex-col-reverse gap-2 pointer-events-none"
      style={{ transform: 'translateX(-50%)' }}
    >
      {state.toasts.map(t => (
        <div
          key={t.id}
          className="animate-toast-in px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg whitespace-nowrap pointer-events-auto"
          style={
            t.type === 'success'
              ? { background: 'var(--ok)', color: '#fff' }
              : t.type === 'error'
              ? { background: 'var(--err)', color: '#fff' }
              : { background: 'var(--tx)', color: 'var(--ground)' }
          }
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
