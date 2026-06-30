'use client'

import {
  createContext, useContext, useReducer, useEffect, useCallback, type ReactNode,
} from 'react'
import type { Todo, Filter, ToastItem, SortBy, TodoFormData } from '@/types'

const STORAGE_KEY = 'claude_todo_v2'

interface State {
  todos: Todo[]
  categories: string[]
  filter: Filter
  search: string
  sortBy: SortBy
  theme: 'light' | 'dark'
  toasts: ToastItem[]
  modal: { open: boolean; editingId: string | null }
}

type Action =
  | { type: 'LOAD'; payload: Partial<State> }
  | { type: 'ADD_TODO'; payload: TodoFormData }
  | { type: 'UPDATE_TODO'; id: string; payload: Partial<Todo> }
  | { type: 'DELETE_TODO'; id: string }
  | { type: 'TOGGLE_TODO'; id: string }
  | { type: 'REORDER'; from: number; to: number }
  | { type: 'SET_FILTER'; key: keyof Filter; value: string }
  | { type: 'SET_SEARCH'; value: string }
  | { type: 'SET_SORT'; value: SortBy }
  | { type: 'TOGGLE_THEME' }
  | { type: 'ADD_CATEGORY'; name: string }
  | { type: 'OPEN_MODAL'; editingId?: string }
  | { type: 'CLOSE_MODAL' }
  | { type: 'PUSH_TOAST'; message: string; toastType: ToastItem['type'] }
  | { type: 'POP_TOAST'; id: string }

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const initialState: State = {
  todos: [],
  categories: ['仕事', '個人', '買い物', '勉強'],
  filter: { status: 'all', priority: 'all', category: 'all' },
  search: '',
  sortBy: 'order',
  theme: 'light',
  toasts: [],
  modal: { open: false, editingId: null },
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload, toasts: [], modal: { open: false, editingId: null } }

    case 'ADD_TODO': {
      const newTodo: Todo = {
        id: uid(),
        title: action.payload.title.trim(),
        description: action.payload.description.trim(),
        completed: false,
        priority: action.payload.priority,
        category: action.payload.category,
        dueDate: action.payload.dueDate,
        createdAt: new Date().toISOString(),
        order: 0,
      }
      const todos = [newTodo, ...state.todos].map((t, i) => ({ ...t, order: i }))
      return { ...state, todos }
    }

    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(t => t.id === action.id ? { ...t, ...action.payload } : t),
      }

    case 'DELETE_TODO':
      return { ...state, todos: state.todos.filter(t => t.id !== action.id) }

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(t => t.id === action.id ? { ...t, completed: !t.completed } : t),
      }

    case 'REORDER': {
      const todos = [...state.todos]
      const [moved] = todos.splice(action.from, 1)
      todos.splice(action.to, 0, moved)
      return { ...state, todos: todos.map((t, i) => ({ ...t, order: i })) }
    }

    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, [action.key]: action.value } }

    case 'SET_SEARCH':
      return { ...state, search: action.value }

    case 'SET_SORT':
      return { ...state, sortBy: action.value }

    case 'TOGGLE_THEME': {
      const theme = state.theme === 'light' ? 'dark' : 'light'
      return { ...state, theme }
    }

    case 'ADD_CATEGORY':
      if (state.categories.includes(action.name)) return state
      return { ...state, categories: [...state.categories, action.name] }

    case 'OPEN_MODAL':
      return { ...state, modal: { open: true, editingId: action.editingId ?? null } }

    case 'CLOSE_MODAL':
      return { ...state, modal: { open: false, editingId: null } }

    case 'PUSH_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { id: uid(), message: action.message, type: action.toastType }],
      }

    case 'POP_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) }

    default:
      return state
  }
}

/* ── Context ── */
interface Ctx {
  state: State
  dispatch: React.Dispatch<Action>
  toast: (msg: string, type?: ToastItem['type']) => void
}

const TodoCtx = createContext<Ctx | null>(null)

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  /* Load from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<State>
        dispatch({ type: 'LOAD', payload: saved })
      }
    } catch (_) {}
  }, [])

  /* Persist to localStorage (skip modal + toasts) */
  useEffect(() => {
    const { toasts: _t, modal: _m, ...persist } = state
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persist))
    } catch (_) {}
  }, [state])

  /* Apply theme class */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
  }, [state.theme])

  const toast = useCallback((msg: string, type: ToastItem['type'] = 'default') => {
    dispatch({ type: 'PUSH_TOAST', message: msg, toastType: type })
  }, [])

  return <TodoCtx.Provider value={{ state, dispatch, toast }}>{children}</TodoCtx.Provider>
}

export function useTodo() {
  const ctx = useContext(TodoCtx)
  if (!ctx) throw new Error('useTodo must be used inside TodoProvider')
  return ctx
}

/* ── Derived data helpers (exported for components) ── */
export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function isOverdue(date: string) {
  return date && date < today()
}

export function isToday(date: string) {
  return date === today()
}

export function getVisible(state: State): Todo[] {
  let list = [...state.todos]

  switch (state.filter.status) {
    case 'active':    list = list.filter(t => !t.completed); break
    case 'completed': list = list.filter(t => t.completed); break
    case 'today':     list = list.filter(t => isToday(t.dueDate)); break
    case 'overdue':   list = list.filter(t => !t.completed && isOverdue(t.dueDate)); break
  }

  if (state.filter.priority !== 'all')
    list = list.filter(t => t.priority === state.filter.priority)

  if (state.filter.category !== 'all')
    list = list.filter(t => t.category === state.filter.category)

  const q = state.search.trim().toLowerCase()
  if (q) list = list.filter(t =>
    t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  )

  const pw = (p: string) => p === 'high' ? 0 : p === 'medium' ? 1 : 2

  switch (state.sortBy) {
    case 'order':     list.sort((a, b) => a.order - b.order); break
    case 'priority':  list.sort((a, b) => pw(a.priority) - pw(b.priority) || a.order - b.order); break
    case 'dueDate':
      list.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return a.order - b.order
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      })
      break
    case 'createdAt': list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break
    case 'title':     list.sort((a, b) => a.title.localeCompare(b.title, 'ja')); break
  }

  return list
}

export function getCounts(todos: Todo[]) {
  const t = today()
  return {
    all:       todos.length,
    active:    todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
    today:     todos.filter(x => x.dueDate === t).length,
    overdue:   todos.filter(x => !x.completed && x.dueDate && x.dueDate < t).length,
  }
}
