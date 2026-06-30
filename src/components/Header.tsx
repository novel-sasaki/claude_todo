'use client'

import { useTodo } from '@/context/TodoContext'

interface Props {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: Props) {
  const { state, dispatch } = useTodo()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4"
      style={{
        height: 'var(--header-h)',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Sidebar toggle + Logo */}
      <div className="flex items-center gap-3" style={{ width: 'var(--sidebar-w)', flexShrink: 0 }}>
        <button
          onClick={onToggleSidebar}
          aria-label="サイドバー切り替え"
          className="flex items-center justify-center w-8 h-8 rounded-sm transition-colors"
          style={{ color: 'var(--tx-2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-2 font-bold text-base" style={{ color: 'var(--accent)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          Claude Todo
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div
          className="flex items-center gap-2 rounded-sm transition-all px-3 py-2"
          style={{
            background: 'var(--ground)',
            border: '1.5px solid var(--border)',
          }}
          onFocusCapture={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--accent)'
            el.style.boxShadow = '0 0 0 3px var(--accent-tint)'
          }}
          onBlurCapture={e => {
            const el = e.currentTarget
            el.style.borderColor = 'var(--border)'
            el.style.boxShadow = ''
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               style={{ color: 'var(--tx-m)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={state.search}
            onChange={e => dispatch({ type: 'SET_SEARCH', value: e.target.value })}
            placeholder="タスクを検索... (Ctrl+K)"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--tx)', minWidth: 0 }}
          />
          {state.search && (
            <button
              onClick={() => dispatch({ type: 'SET_SEARCH', value: '' })}
              style={{ color: 'var(--tx-m)' }}
              aria-label="クリア"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <kbd
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--tx-m)',
              fontFamily: 'monospace',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Theme toggle */}
      <div className="ml-auto">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          aria-label={state.theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          className="flex items-center justify-center w-8 h-8 rounded-sm transition-colors"
          style={{ color: 'var(--tx-2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}
        >
          {state.theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
