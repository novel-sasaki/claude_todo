'use client'

import { useEffect, useState } from 'react'
import { TodoProvider, useTodo } from '@/context/TodoContext'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import QuickAdd from '@/components/QuickAdd'
import TodoList from '@/components/TodoList'
import TodoModal from '@/components/TodoModal'
import Toast from '@/components/Toast'

function App() {
  const { dispatch } = useTodo()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  /* Keyboard shortcuts */
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[placeholder*="検索"]')?.focus()
        return
      }

      if (typing) return

      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); dispatch({ type: 'OPEN_MODAL' }) }
      if (e.key === 'd' || e.key === 'D') { e.preventDefault(); dispatch({ type: 'TOGGLE_THEME' }) }
      if (e.key === 'Escape') dispatch({ type: 'CLOSE_MODAL' })
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [dispatch])

  /* Close sidebar on mobile when window resizes to desktop */
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768) setSidebarOpen(true)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--ground)' }}>
      <Header onToggleSidebar={() => setSidebarOpen(o => !o)} />
      <Sidebar open={sidebarOpen} />

      <main
        className="transition-all duration-200"
        style={{
          paddingTop: 'calc(var(--header-h) + 28px)',
          paddingBottom: '80px',
          paddingLeft: '32px',
          paddingRight: '32px',
          marginLeft: sidebarOpen ? 'var(--sidebar-w)' : '0',
          maxWidth: sidebarOpen ? 'calc(var(--sidebar-w) + 860px)' : '860px',
        }}
      >
        <QuickAdd />
        <TodoList />
      </main>

      {/* FAB (mobile) */}
      <button
        onClick={() => dispatch({ type: 'OPEN_MODAL' })}
        aria-label="タスクを追加 (N)"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform md:hidden"
        style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = '')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <TodoModal />
      <Toast />
    </div>
  )
}

export default function Page() {
  return (
    <TodoProvider>
      <App />
    </TodoProvider>
  )
}
