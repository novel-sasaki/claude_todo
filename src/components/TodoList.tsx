'use client'

import { useRef, useState } from 'react'
import { useTodo, getVisible } from '@/context/TodoContext'
import TodoItem from './TodoItem'
import type { SortBy } from '@/types'

export default function TodoList() {
  const { state, dispatch, toast } = useTodo()
  const visible = getVisible(state)

  const dragId = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  function handleDragStart(id: string) {
    dragId.current = id
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (dragId.current !== id) setDragOverId(id)
  }

  function handleDrop(targetId: string) {
    const fromId = dragId.current
    if (!fromId || fromId === targetId) { setDragOverId(null); return }
    const fromIdx = state.todos.findIndex(t => t.id === fromId)
    const toIdx = state.todos.findIndex(t => t.id === targetId)
    if (fromIdx !== -1 && toIdx !== -1) {
      dispatch({ type: 'REORDER', from: fromIdx, to: toIdx })
      dispatch({ type: 'SET_SORT', value: 'order' as SortBy })
    }
    setDragOverId(null)
  }

  function handleDragEnd() {
    dragId.current = null
    setDragOverId(null)
  }

  const statusTitles: Record<string, string> = {
    all: 'すべてのタスク', active: '未完了のタスク',
    completed: '完了済みのタスク', today: '今日のタスク', overdue: '期限超過のタスク',
  }
  const title = state.filter.category !== 'all'
    ? state.filter.category
    : statusTitles[state.filter.status] ?? 'タスク'

  const activeCount = state.todos.filter(t => !t.completed).length
  const completedCount = state.todos.filter(t => t.completed).length

  return (
    <div>
      {/* List header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-xl font-bold" style={{ color: 'var(--tx)' }}>{title}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: 'var(--tx-2)' }}>並び替え</label>
            <select
              value={state.sortBy}
              onChange={e => dispatch({ type: 'SET_SORT', value: e.target.value as SortBy })}
              className="text-xs px-2 py-1.5 rounded-sm outline-none transition-colors"
              style={{
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                color: 'var(--tx)',
                cursor: 'pointer',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <option value="order">カスタム順</option>
              <option value="dueDate">期限日</option>
              <option value="priority">優先度</option>
              <option value="createdAt">作成日</option>
              <option value="title">タイトル</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {state.todos.length > 0 && (
        <div className="flex gap-2 mb-4">
          {activeCount > 0 && (
            <button
              onClick={() => {
                state.todos.filter(t => !t.completed).forEach(t => {
                  dispatch({ type: 'UPDATE_TODO', id: t.id, payload: { completed: true } })
                })
                toast(`${activeCount}件を完了にしました`, 'success')
              }}
              className="text-xs px-3 py-1.5 rounded-sm font-medium transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--tx-2)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-tint)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--tx-2)'; e.currentTarget.style.background = '' }}
            >
              すべて完了
            </button>
          )}
          {completedCount > 0 && (
            <button
              onClick={() => {
                state.todos.filter(t => t.completed).forEach(t => {
                  dispatch({ type: 'DELETE_TODO', id: t.id })
                })
                toast(`${completedCount}件の完了済みタスクを削除しました`)
              }}
              className="text-xs px-3 py-1.5 rounded-sm font-medium transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--tx-2)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--err)'; e.currentTarget.style.color = 'var(--err)'; e.currentTarget.style.background = 'rgba(198,40,40,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--tx-2)'; e.currentTarget.style.background = '' }}
            >
              完了済みを削除
            </button>
          )}
        </div>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <EmptyState search={state.search} />
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragOver={dragOverId === todo.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16" style={{ color: 'var(--tx-m)' }}>
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.4 }}>
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
      <p className="font-semibold text-base" style={{ color: 'var(--tx-2)' }}>
        {search ? `「${search}」に一致するタスクがありません` : 'タスクがありません'}
      </p>
      <p className="text-sm">
        {search ? '別のキーワードで検索してみてください' : '上の入力欄からタスクを追加してみましょう'}
      </p>
    </div>
  )
}
