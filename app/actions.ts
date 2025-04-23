/**
 * Server Actions for Task Management
 * 
 * This file contains all the server actions used in the Task Manager application.
 * These functions are marked with "use server" to indicate they run on the server side.
 */

"use server"

import { revalidatePath } from "next/cache"
import {
  createTask,
  updateTask,
  deleteTask,
  getFilteredTasks,
  getTaskStats,
  exportTasksToJSON,
  importTasksFromJSON,
} from "@/lib/tasks"
import type { TaskFilters } from "@/lib/types"
import { supabase } from "@/lib/supabase"

/**
 * Adds a new task to the database
 * 
 * param formData - Form data containing task details (title, description, due_date, priority, status)
 * returns Object with success status and the created task or error message
 */
export async function addTask(formData: FormData) {
  // Extract task data from form
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const due_date = formData.get("due_date") as string
  const priority = formData.get("priority") as "Low" | "Medium" | "High"
  const status = formData.get("status") as "Incomplete" | "In Progress" | "Completed"

  // Validate required fields
  if (!title || !due_date || !priority || !status) {
    return { error: "Missing required fields" }
  }

  try {
    // Create task in the database
    const task = await createTask({
      title,
      description,
      due_date,
      priority,
      status,
    })

    // Revalidate the home page to show the new task
    revalidatePath("/")
    return { success: true, task }
  } catch (error) {
    console.error("Error creating task:", error)
    return { error: "Failed to create task" }
  }
}

/**
 * Updates an existing task in the database
 * 
 * id - The ID of the task to update
 * formData - Form data containing updated task details
 * returns Object with success status and the updated task or error message
 */
export async function editTask(id: string, formData: FormData) {
  // Extract task data from form
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const due_date = formData.get("due_date") as string
  const priority = formData.get("priority") as "Low" | "Medium" | "High"
  const status = formData.get("status") as "Incomplete" | "In Progress" | "Completed"

  // Validate required fields
  if (!title || !due_date || !priority || !status) {
    return { error: "Missing required fields" }
  }

  try {
    // Update task in the database
    const updatedTask = await updateTask(id, {
      title,
      description,
      due_date,
      priority,
      status,
    })

    // Revalidate the home page to show the updated task
    revalidatePath("/")
    return { success: !!updatedTask, task: updatedTask }
  } catch (error) {
    console.error("Error updating task:", error)
    return { error: "Failed to update task" }
  }
}

/**
 * Removes a single task from the database
 * 
 * id - The ID of the task to delete
 * returns Object with success status or error message
 */
export async function removeTask(id: string) {
  try {
    // Delete the task from the database
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)

    if (error) throw error

    // Revalidate the home page to remove the deleted task
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { success: false, error: "Failed to delete task" }
  }
}

/**
 * Deletes all tasks from the database
 * 
 * returns Object with success status or error message
 */
export async function deleteAllTasks() {
  try {
    // Delete all tasks from the database
    const { error } = await supabase
      .from("tasks")
      .delete()
      .neq("id", "dummy") // This ensures we delete all tasks

    if (error) throw error

    // Revalidate the home page to remove all tasks
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting all tasks:", error)
    return { success: false, error: "Failed to delete all tasks" }
  }
}

/**
 * Fetches tasks with optional filtering and sorting
 * 
 * filters - Optional filters for tasks (search, status, priority, sorting)
 * returns Object containing the filtered tasks
 */
export async function fetchTasks(filters: TaskFilters = {}) {
  try {
    // Get filtered tasks from the database
    const tasks = await getFilteredTasks(filters)
    return { tasks }
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return { tasks: [] }
  }
}

/**
 * Fetches task statistics (total, completed, due soon)
 * 
 * returns Object containing task statistics
 */
export async function fetchStats() {
  try {
    // Get task statistics from the database
    const stats = await getTaskStats()
    return { stats }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return { 
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        dueSoonTasks: 0
      } 
    }
  }
}

/**
 * Exports all tasks to JSON format
 * 
 * returns Object containing the JSON string of all tasks
 */
export async function exportTasks() {
  try {
    // Export tasks to JSON
    const jsonData = await exportTasksToJSON()
    return { jsonData }
  } catch (error) {
    console.error("Error exporting tasks:", error)
    return { jsonData: "[]" }
  }
}

/**
 * Imports tasks from JSON format
 * 
 * jsonData - JSON string containing tasks to import
 * returns Object with success status
 */
export async function importTasks(jsonData: string) {
  try {
    // Import tasks from JSON
    const success = await importTasksFromJSON(jsonData)
    if (success) {
      // Revalidate the home page to show the imported tasks
      revalidatePath("/")
    }
    return { success }
  } catch (error) {
    console.error("Error importing tasks:", error)
    return { success: false }
  }
}
