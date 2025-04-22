export type Priority = "Low" | "Medium" | "High"
export type Status = "Incomplete" | "In Progress" | "Completed"

export interface Task {
  id: string
  title: string
  description: string
  due_date: string // ISO string format
  priority: Priority
  status: Status
  created_at: string // ISO string format
}

export interface TaskStats {
  totalTasks: number
  completedTasks: number
  dueSoonTasks: number // Due in the next 7 days
}

export type SortField = "title" | "due_date" | "priority" | "status" | "created_at"
export type SortDirection = "asc" | "desc"

export interface TaskFilters {
  search?: string
  sortBy?: SortField
  sortDirection?: SortDirection
}
