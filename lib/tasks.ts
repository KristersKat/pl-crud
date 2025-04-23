/**
 * Task Management Library
 * 
 * This file contains all the database operations and utility functions for managing tasks.
 * It provides a clean API for interacting with the Supabase database.
 */

import type { Task, TaskStats, TaskFilters, Priority, Status } from "./types"
import { supabase, handleSupabaseError } from "./supabase"

/**
 * Retrieves all tasks from the database
 * 
 * returns Promise resolving to an array of tasks
 */
export const getTasks = async (): Promise<Task[]> => {
  try {
    // Query all tasks from the database, ordered by creation date (newest first)
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

/**
 * Retrieves a single task by its ID
 * 
 * id - The ID of the task to retrieve
 * returns Promise resolving to the task or undefined if not found
 */
export const getTaskById = async (id: string): Promise<Task | undefined> => {
  try {
    // Query a single task by ID
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

/**
 * Creates a new task in the database
 * 
 * task - The task data to create (without id and created_at)
 * returns Promise resolving to the created task
 */
export const createTask = async (task: Omit<Task, "id" | "created_at">): Promise<Task> => {
  try {
    // Generate a unique ID and creation timestamp
    const newTask = {
      ...task,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    }

    // Insert the new task into the database
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

/**
 * Updates an existing task in the database
 * 
 * id - The ID of the task to update
 * updatedTask - The updated task data
 * returns Promise resolving to the updated task or null if update failed
 */
export const updateTask = async (id: string, updatedTask: Partial<Task>): Promise<Task | null> => {
  try {
    // Update the task in the database
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

/**
 * Deletes a task from the database
 * 
 * id - The ID of the task to delete
 * returns Promise resolving to a boolean indicating success
 */
export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    // Delete the task from the database
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

/**
 * Retrieves tasks with optional filtering and sorting
 * 
 * filters - Optional filters for tasks (search, status, priority, sorting)
 * returns Promise resolving to an array of filtered tasks
 */
export const getFilteredTasks = async (filters: TaskFilters = {}): Promise<Task[]> => {
  try {
    // Start with a base query
    let query = supabase.from('tasks').select('*')
    
    // Apply search filter if provided
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
    
    // Apply sorting if provided, otherwise sort by creation date
    if (filters.sortBy) {
      const direction = filters.sortDirection === 'desc' ? 'desc' : 'asc'
      query = query.order(filters.sortBy, { ascending: direction === 'asc' })
    } else {
      // Default sorting by created_at (newest first)
      query = query.order('created_at', { ascending: false })
    }
    
    // Execute the query
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  } catch (error) {
    handleSupabaseError(error)
    return []
  }
}

/**
 * Calculates task statistics
 * 
 * returns Promise resolving to task statistics (total, completed, due soon)
 */
export const getTaskStats = async (): Promise<TaskStats> => {
  try {
    // Get all tasks from the database
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
    
    if (error) throw error
    
    // Calculate date ranges for "due soon" tasks
    const now = new Date()
    const oneWeekFromNow = new Date()
    oneWeekFromNow.setDate(now.getDate() + 7)
    
    // Calculate statistics
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

/**
 * Exports all tasks to a JSON string
 * 
 * returns Promise resolving to a JSON string of all tasks
 */
export const exportTasksToJSON = async (): Promise<string> => {
  try {
    // Get all tasks from the database
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
    
    if (error) throw error
    // Convert to JSON string with pretty formatting
    return JSON.stringify(data, null, 2)
  } catch (error) {
    handleSupabaseError(error)
    return '[]'
  }
}

/**
 * Imports tasks from a JSON string
 * 
 * jsonData - JSON string containing tasks to import
 * returns Promise resolving to a boolean indicating success
 */
export const importTasksFromJSON = async (jsonData: string): Promise<boolean> => {
  try {
    // Parse the JSON string into an array of tasks
    const tasks = JSON.parse(jsonData) as Task[]
    
    // Delete all existing tasks first
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', 'dummy') // This ensures all records are deleted
    
    if (deleteError) throw deleteError
    
    // Insert new tasks if there are any
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
