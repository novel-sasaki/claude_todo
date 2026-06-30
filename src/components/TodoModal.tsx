'use client'

import { useEffect, useRef, useState } from 'react'
import { useTodo } from '@/context/TodoContext'
import type { TodoFormData } from '@/types'

const empty: TodoFormData = { title: '', description: '', priority: 'medium', category: '', dueDate: '' }

export default function TodoModal() {
  const { state, dispatch, toast } = useTodo()
  const { open, editingId } = state.modal
  const editingTodo = editingId ? state.todos.find(t => t.id === editingId) : null

  const [form, setForm] = useState<TodoFormData>(empty)
  const [titleError, setTitleError] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  /* Listen for quick-add prefill event */
  useEffect(() => {
    function handler(e: Event) {
      const title = (e as CustomEvent<string>).detail
      setForm(f => ({ ...f, title }))
    }
    window.addEventListener('quick-add-prefill', handler)
    return () => window.removeEventListener('quick-add-prefill', handler)
  }, [])

  /* Populate form when modal opens */
  useEffect(() => {
    if (open) {
      setForm(editingTodo
        ? {
            title: editingTodo.title,
            description: editingTodo.description,
            priority: editingTodo.priority,
            category: editingTodo.category,
            dueDate: editingTodo.dueDate,
          }
        : empty
      )
      setTitleError(false)
      setTimeout(() => titleRef.current?.focus(), 80)
    }
  }, [open, editingId]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Keyboard: Escape to close */
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') dispatch({ type: 'CLOSE_MODAL' })
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, dispatch])

  function save() {
    if (!form.title.trim()) { setTitleError(true); titleRef.current?.focus(); return }
    if (editingId) {
      dispatch({ type: 'UPDATE_TODO', id: editingId, payload: form })
      toast('タスクを更新しました', 'success')
    } else {
      dispatch({ type: 'ADD_TODO', payload: form })
      toast('タスクを追加しました', 'success')
    }
    dispatch({ type: 'CLOSE_MODAL' })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
      onClick={e => { if (e.target === e.currentTarget) dispatch({ type: 'CLOSE_MODAL' }) }}
    >
      <div
        className="w-full max-w-md rounded-xl overflow-hidden"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-xl)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h2 id="modal-title" className="text-base font-bold" style={{ color: 'var(--tx)' }}>
            {editingId ? 'タスクを編集' : 'タスクを追加'}
          </h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_MODAL' })}
            aria-label="閉じる"
            className="flex items-center justify-center w-8 h-8 rounded-sm transition-colors"
            style={{ color: 'var(--tx-m)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--tx)' }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--tx-m)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--tx-2)' }}>
              タイトル <span style={{ color: 'var(--err)' }}>*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setTitleError(false) }}
              onKeyDown={e => { if (e.key === 'Enter') save() }}
              placeholder="タスクのタイトル"
              className="px-3 py-2 rounded-sm text-sm outline-none transition-all"
              style={{
                background: 'var(--ground)',
                border: `1.5px solid ${titleError ? 'var(--err)' : 'var(--border)'}`,
                color: 'var(--tx)',
                boxShadow: titleError ? '0 0 0 3px rgba(198,40,40,0.10)' : '',
              }}
              onFocus={e => { if (!titleError) e.currentTarget.style.borderColor = 'var(--accent)' }}
              onBlur={e => { if (!titleError) e.currentTarget.style.borderColor = 'var(--border)' }}
            />
            {titleError && (
              <p className="text-xs" style={{ color: 'var(--err)' }}>タイトルを入力してください</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--tx-2)' }}>メモ</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="詳細メモ（任意）"
              rows={3}
              className="px-3 py-2 rounded-sm text-sm outline-none resize-y transition-all"
              style={{
                background: 'var(--ground)',
                border: '1.5px solid var(--border)',
                color: 'var(--tx)',
                minHeight: '72px',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Priority + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--tx-2)' }}>優先度</label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as 'high'|'medium'|'low' }))}
                className="px-3 py-2 rounded-sm text-sm outline-none transition-colors"
                style={{
                  background: 'var(--ground)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--tx)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--tx-2)' }}>期限日</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="px-3 py-2 rounded-sm text-sm outline-none transition-colors"
                style={{
                  background: 'var(--ground)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--tx)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold" style={{ color: 'var(--tx-2)' }}>カテゴリ</label>
            <div className="flex gap-2">
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-sm text-sm outline-none transition-colors"
                style={{
                  background: 'var(--ground)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--tx)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <option value="">なし</option>
                {state.categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const name = prompt('新しいカテゴリ名:')?.trim()
                  if (name) {
                    dispatch({ type: 'ADD_CATEGORY', name })
                    setForm(f => ({ ...f, category: name }))
                  }
                }}
                className="px-3 py-2 rounded-sm text-sm font-semibold transition-all"
                style={{
                  border: '1.5px solid var(--border)',
                  color: 'var(--accent)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-tint)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                + 新規
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2.5 px-6 py-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={() => dispatch({ type: 'CLOSE_MODAL' })}
            className="px-4 py-2 rounded-sm text-sm font-semibold transition-all"
            style={{ border: '1.5px solid var(--border)', color: 'var(--tx-2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--tx)' }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--tx-2)' }}
          >
            キャンセル
          </button>
          <button
            onClick={save}
            className="px-4 py-2 rounded-sm text-sm font-semibold transition-all"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {editingId ? '更新する' : '追加する'}
          </button>
        </div>
      </div>
    </div>
  )
}
