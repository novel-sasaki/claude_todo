'use client'

import { useState, useRef } from 'react'
import { useTodo } from '@/context/TodoContext'

export default function QuickAdd() {
  const { dispatch, toast } = useTodo()
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function submit() {
    const title = value.trim()
    if (!title) return
    dispatch({ type: 'ADD_TODO', payload: { title, description: '', priority: 'medium', category: '', dueDate: '' } })
    setValue('')
    toast('タスクを追加しました', 'success')
    inputRef.current?.focus()
  }

  function openDetail() {
    if (value.trim()) {
      /* Pre-fill modal title with whatever is typed */
      dispatch({ type: 'OPEN_MODAL' })
      /* We'll pass the value via a custom event the modal can pick up */
      window.dispatchEvent(new CustomEvent('quick-add-prefill', { detail: value.trim() }))
      setValue('')
    } else {
      dispatch({ type: 'OPEN_MODAL' })
    }
  }

  return (
    <div
      className="flex items-center gap-2 rounded px-3 py-2.5 mb-4 transition-all"
      style={{
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onFocusCapture={e => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--accent)'
        el.style.boxShadow = '0 0 0 3px var(--accent-tint)'
      }}
      onBlurCapture={e => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--border)'
        el.style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      <button
        onClick={submit}
        aria-label="追加"
        className="flex-shrink-0"
        style={{ color: 'var(--accent)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="タスクを追加... (Enter で保存)"
        className="flex-1 bg-transparent outline-none text-sm"
        style={{ color: 'var(--tx)' }}
        autoComplete="off"
      />
      <button
        onClick={openDetail}
        aria-label="詳細設定"
        className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-sm transition-colors"
        style={{ color: 'var(--tx-m)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--tx)' }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--tx-m)' }}
        title="詳細設定で追加 (N)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="19" cy="12" r="1" fill="currentColor" />
          <circle cx="5" cy="12" r="1" fill="currentColor" />
        </svg>
      </button>
    </div>
  )
}
