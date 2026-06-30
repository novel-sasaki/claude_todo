export interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  category: string
  dueDate: string
  createdAt: string
  order: number
}

export type StatusFilter = 'all' | 'active' | 'completed' | 'today' | 'overdue'
export type PriorityFilter = 'all' | 'high' | 'medium' | 'low'
export type SortBy = 'order' | 'dueDate' | 'priority' | 'createdAt' | 'title'

export interface Filter {
  status: StatusFilter
  priority: PriorityFilter
  category: string
}

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'default'
}

export interface TodoFormData {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  dueDate: string
}
