import type { Task, TaskStats, TaskFilters, Priority, Status } from "./types"
import { supabase, handleSupabaseError } from "./supabase"

// Get all tasks from Supabase
export const getTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    handleSupabaseError(error)
    return []
  }
}

// Get a single task by ID
export const getTaskById = async (id: string): Promise<Task | undefined> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
    return undefined
  }
}

// Create a new task
export const createTask = async (task: Omit<Task, "id" | "created_at">): Promise<Task> => {
  try {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
    throw error
  }
}

// Update an existing task
export const updateTask = async (id: string, updatedTask: Partial<Task>): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updatedTask)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
    return null
  }
}

// Delete a task
export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    handleSupabaseError(error)
    return false
  }
}

// Filter and sort tasks
export const getFilteredTasks = async (filters: TaskFilters = {}): Promise<Task[]> => {
  try {
    let query = supabase.from('tasks').select('*')
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }
    
    // Apply status filter if provided
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    // Apply priority filter if provided
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    
    // Apply sorting
    if (filters.sortBy) {
      const direction = filters.sortDirection === 'desc' ? 'desc' : 'asc'
      query = query.order(filters.sortBy, { ascending: direction === 'asc' })
    } else {
      // Default sorting by created_at
      query = query.order('created_at', { ascending: false })
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  } catch (error) {
    handleSupabaseError(error)
    return []
  }
}

// Get task statistics
export const getTaskStats = async (): Promise<TaskStats> => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
    
    if (error) throw error
    
    const now = new Date()
    const oneWeekFromNow = new Date()
    oneWeekFromNow.setDate(now.getDate() + 7)
    
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((task) => task.status === "Completed").length,
      dueSoonTasks: tasks.filter((task) => {
        const dueDate = new Date(task.due_date)
        return dueDate >= now && dueDate <= oneWeekFromNow && task.status !== "Completed"
      }).length,
    }
  } catch (error) {
    handleSupabaseError(error)
    return {
      totalTasks: 0,
      completedTasks: 0,
      dueSoonTasks: 0
    }
  }
}

// Export tasks to JSON
export const exportTasksToJSON = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
    
    if (error) throw error
    return JSON.stringify(data, null, 2)
  } catch (error) {
    handleSupabaseError(error)
    return '[]'
  }
}

// Import tasks from JSON
export const importTasksFromJSON = async (jsonData: string): Promise<boolean> => {
  try {
    const tasks = JSON.parse(jsonData) as Task[]
    
    // Delete all existing tasks first
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', 'dummy') // This ensures all records are deleted
    
    if (deleteError) throw deleteError
    
    // Insert new tasks
    if (tasks.length > 0) {
      const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasks)
      
      if (insertError) throw insertError
    }
    
    return true
  } catch (error) {
    handleSupabaseError(error)
    return false
  }
}
