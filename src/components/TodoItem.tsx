'use client'

import type { Todo } from '@/types'
import { useTodo, isOverdue, isToday } from '@/context/TodoContext'

interface Props {
  todo: Todo
  onDragStart: (id: string) => void
  onDragOver: (e: React.DragEvent, id: string) => void
  onDrop: (id: string) => void
  onDragEnd: () => void
  isDragOver: boolean
}

export default function TodoItem({ todo, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver }: Props) {
  const { dispatch, toast } = useTodo()

  const overdue = !todo.completed && isOverdue(todo.dueDate)
  const todayDue = isToday(todo.dueDate)

  function formatDate(d: string) {
    if (!d) return null
    const [y, m, day] = d.split('-')
    return `${y}/${m}/${day}`
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(todo.id)}
      onDragOver={e => onDragOver(e, todo.id)}
      onDrop={() => onDrop(todo.id)}
      onDragEnd={onDragEnd}
      className="group relative flex items-start gap-3 rounded px-3.5 py-3 transition-all animate-slide-down"
      style={{
        background: isDragOver ? 'var(--accent-tint)' : 'var(--surface)',
        border: `1.5px solid ${isDragOver ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: isDragOver ? '0 0 0 2px var(--accent-tint)' : 'var(--shadow-sm)',
        opacity: todo.completed ? 0.55 : 1,
      }}
      onMouseEnter={e => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = 'var(--border-s)'
          e.currentTarget.style.boxShadow = 'var(--shadow)'
        }
      }}
      onMouseLeave={e => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
        }
      }}
    >
      {/* Priority bar */}
      <div className={`priority-bar ${todo.priority}`} />

      {/* Drag handle */}
      <div
        className="flex-shrink-0 mt-0.5 cursor-grab opacity-0 group-hover:opacity-40 transition-opacity"
        style={{ color: 'var(--tx-m)' }}
        aria-hidden
      >
        <svg width="12" height="16" viewBox="0 0 12 20" fill="currentColor">
          <circle cx="4" cy="4" r="1.5" /><circle cx="8" cy="4" r="1.5" />
          <circle cx="4" cy="10" r="1.5" /><circle cx="8" cy="10" r="1.5" />
          <circle cx="4" cy="16" r="1.5" /><circle cx="8" cy="16" r="1.5" />
        </svg>
      </div>

      {/* Checkbox */}
      <button
        onClick={() => {
          dispatch({ type: 'TOGGLE_TODO', id: todo.id })
          toast(todo.completed ? 'タスクを未完了にしました' : 'タスクを完了しました！', todo.completed ? 'default' : 'success')
        }}
        aria-label={todo.completed ? '未完了にする' : '完了にする'}
        className="flex-shrink-0 mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all"
        style={
          todo.completed
            ? { background: 'var(--accent)', borderColor: 'var(--accent)' }
            : { borderColor: 'var(--border-s)', background: 'transparent' }
        }
        onMouseEnter={e => {
          if (!todo.completed) {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.background = 'var(--accent-tint)'
          }
        }}
        onMouseLeave={e => {
          if (!todo.completed) {
            e.currentTarget.style.borderColor = 'var(--border-s)'
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        {todo.completed && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg)" strokeWidth="3.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium leading-snug break-words"
          style={{
            color: 'var(--tx)',
            textDecoration: todo.completed ? 'line-through' : 'none',
            textDecorationColor: 'var(--tx-m)',
          }}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-xs mt-0.5 leading-relaxed break-words" style={{ color: 'var(--tx-2)' }}>
            {todo.description}
          </p>
        )}
        {(todo.category || todo.dueDate) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {todo.category && (
              <span
                className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
              >
                {todo.category}
              </span>
            )}
            {todo.dueDate && (
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                style={
                  overdue
                    ? { background: 'rgba(198,40,40,0.10)', color: 'var(--err)' }
                    : todayDue
                    ? { background: 'rgba(240,165,0,0.12)', color: 'var(--accent)' }
                    : { background: 'var(--surface-2)', color: 'var(--tx-2)' }
                }
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {overdue && '期限超過 '}{todayDue && '今日 '}{formatDate(todo.dueDate)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons (visible on hover) */}
      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionBtn
          aria-label="編集"
          onClick={() => dispatch({ type: 'OPEN_MODAL', editingId: todo.id })}
          color="var(--tx-m)"
          hoverColor="var(--tx)"
          hoverBg="var(--surface-2)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z" />
          </svg>
        </ActionBtn>
        <ActionBtn
          aria-label="削除"
          onClick={() => {
            dispatch({ type: 'DELETE_TODO', id: todo.id })
            toast('タスクを削除しました')
          }}
          color="var(--tx-m)"
          hoverColor="var(--err)"
          hoverBg="rgba(198,40,40,0.08)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </ActionBtn>
      </div>
    </div>
  )
}

function ActionBtn({
  children, onClick, color, hoverColor, hoverBg, ...rest
}: {
  children: React.ReactNode
  onClick: () => void
  color: string
  hoverColor: string
  hoverBg: string
  'aria-label': string
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-7 h-7 rounded-sm transition-colors"
      style={{ color }}
      onMouseEnter={e => { e.currentTarget.style.color = hoverColor; e.currentTarget.style.background = hoverBg }}
      onMouseLeave={e => { e.currentTarget.style.color = color; e.currentTarget.style.background = '' }}
      {...rest}
    >
      {children}
    </button>
  )
}
