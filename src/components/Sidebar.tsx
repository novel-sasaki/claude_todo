'use client'

import { useState } from 'react'
import { useTodo, getCounts, today, isToday } from '@/context/TodoContext'
import type { StatusFilter, PriorityFilter } from '@/types'

interface Props {
  open: boolean
}

export default function Sidebar({ open }: Props) {
  const { state, dispatch } = useTodo()
  const [addingCat, setAddingCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  const counts = getCounts(state.todos)

  const todayDone = state.todos.filter(t => isToday(t.dueDate) && t.completed).length
  const todayTotal = state.todos.filter(t => isToday(t.dueDate)).length
  const progressPct = todayTotal === 0 ? 0 : Math.round((todayDone / todayTotal) * 100)

  function setStatus(value: StatusFilter) {
    dispatch({ type: 'SET_FILTER', key: 'status', value })
  }
  function setPriority(value: PriorityFilter) {
    dispatch({ type: 'SET_FILTER', key: 'priority', value })
  }
  function setCategory(value: string) {
    dispatch({ type: 'SET_FILTER', key: 'category', value })
  }
  function confirmCategory() {
    const name = newCatName.trim()
    if (name) dispatch({ type: 'ADD_CATEGORY', name })
    setNewCatName('')
    setAddingCat(false)
  }

  return (
    <aside
      className="fixed top-0 bottom-0 left-0 z-40 flex flex-col overflow-y-auto overflow-x-hidden transition-transform"
      style={{
        width: 'var(--sidebar-w)',
        paddingTop: 'var(--header-h)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
      }}
    >
      {/* Status filters */}
      <section className="px-3 pt-5 pb-2">
        <p className="px-2 mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--tx-m)' }}>
          表示
        </p>
        <nav className="flex flex-col gap-0.5">
          <FilterBtn
            active={state.filter.status === 'all'}
            onClick={() => setStatus('all')}
            icon={<GridIcon />}
            label="すべて"
            count={counts.all}
          />
          <FilterBtn
            active={state.filter.status === 'active'}
            onClick={() => setStatus('active')}
            icon={<CircleIcon />}
            label="未完了"
            count={counts.active}
          />
          <FilterBtn
            active={state.filter.status === 'completed'}
            onClick={() => setStatus('completed')}
            icon={<CheckCircleIcon />}
            label="完了済み"
            count={counts.completed}
          />
          <FilterBtn
            active={state.filter.status === 'today'}
            onClick={() => setStatus('today')}
            icon={<CalendarIcon />}
            label="今日"
            count={counts.today}
          />
          <FilterBtn
            active={state.filter.status === 'overdue'}
            onClick={() => setStatus('overdue')}
            icon={<AlertIcon />}
            label="期限超過"
            count={counts.overdue}
            countDanger
          />
        </nav>
      </section>

      {/* Priority filters */}
      <section className="px-3 pt-4 pb-2">
        <p className="px-2 mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--tx-m)' }}>
          優先度
        </p>
        <nav className="flex flex-col gap-0.5">
          <FilterBtn
            active={state.filter.priority === 'all'}
            onClick={() => setPriority('all')}
            icon={<Dot color="var(--tx-m)" />}
            label="すべて"
          />
          <FilterBtn
            active={state.filter.priority === 'high'}
            onClick={() => setPriority('high')}
            icon={<Dot color="var(--err)" />}
            label="高"
          />
          <FilterBtn
            active={state.filter.priority === 'medium'}
            onClick={() => setPriority('medium')}
            icon={<Dot color="var(--accent)" />}
            label="中"
          />
          <FilterBtn
            active={state.filter.priority === 'low'}
            onClick={() => setPriority('low')}
            icon={<Dot color="var(--ok)" />}
            label="低"
          />
        </nav>
      </section>

      {/* Category filters */}
      <section className="px-3 pt-4 pb-2 flex-1">
        <div className="flex items-center justify-between px-2 mb-2">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--tx-m)' }}>
            カテゴリ
          </p>
          <button
            onClick={() => setAddingCat(true)}
            aria-label="カテゴリを追加"
            className="w-5 h-5 flex items-center justify-center rounded-full text-sm font-bold transition-colors"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-tint)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}
          >
            +
          </button>
        </div>
        <nav className="flex flex-col gap-0.5">
          <FilterBtn
            active={state.filter.category === 'all'}
            onClick={() => setCategory('all')}
            icon={<TagIcon />}
            label="すべて"
          />
          {state.categories.map(cat => (
            <FilterBtn
              key={cat}
              active={state.filter.category === cat}
              onClick={() => setCategory(cat)}
              icon={<TagIcon />}
              label={cat}
            />
          ))}
        </nav>

        {addingCat && (
          <div className="flex gap-1.5 mt-2 px-1">
            <input
              autoFocus
              type="text"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') confirmCategory()
                if (e.key === 'Escape') { setAddingCat(false); setNewCatName('') }
              }}
              placeholder="カテゴリ名"
              maxLength={20}
              className="flex-1 text-sm px-2 py-1 rounded-sm outline-none"
              style={{
                background: 'var(--ground)',
                border: '1.5px solid var(--border)',
                color: 'var(--tx)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              onClick={confirmCategory}
              className="px-2 py-1 text-xs rounded-sm font-semibold"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              追加
            </button>
            <button
              onClick={() => { setAddingCat(false); setNewCatName('') }}
              className="px-2 py-1 text-xs rounded-sm font-semibold"
              style={{ border: '1px solid var(--border)', color: 'var(--tx-2)' }}
            >
              ×
            </button>
          </div>
        )}
      </section>

      {/* Progress */}
      <footer className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--tx-2)' }}>
          <span>今日の進捗</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: 'var(--accent)' }}
          />
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'var(--tx-m)' }}>
          {todayDone} / {todayTotal} 件完了
        </p>
      </footer>
    </aside>
  )
}

/* ── Sub-components ── */

function FilterBtn({
  active, onClick, icon, label, count, countDanger,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count?: number
  countDanger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-sm text-sm text-left transition-colors"
      style={{
        background: active ? 'var(--accent-tint)' : '',
        color: active ? 'var(--accent)' : 'var(--tx-2)',
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = '' }}
    >
      <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{icon}</span>
      <span className="flex-1">{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
          style={
            countDanger
              ? { background: 'rgba(198,40,40,0.12)', color: 'var(--err)' }
              : { background: 'var(--surface-2)', color: 'var(--tx-2)' }
          }
        >
          {count}
        </span>
      )}
    </button>
  )
}

function Dot({ color }: { color: string }) {
  return <span className="block w-2 h-2 rounded-full" style={{ background: color }} />
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}
function CircleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}
function CheckCircleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}
