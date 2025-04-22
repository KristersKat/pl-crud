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

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const due_date = formData.get("due_date") as string
  const priority = formData.get("priority") as "Low" | "Medium" | "High"
  const status = formData.get("status") as "Incomplete" | "In Progress" | "Completed"

  if (!title || !due_date || !priority || !status) {
    return { error: "Missing required fields" }
  }

  try {
    const task = await createTask({
      title,
      description,
      due_date,
      priority,
      status,
    })

    revalidatePath("/")
    return { success: true, task }
  } catch (error) {
    console.error("Error creating task:", error)
    return { error: "Failed to create task" }
  }
}

export async function editTask(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const due_date = formData.get("due_date") as string
  const priority = formData.get("priority") as "Low" | "Medium" | "High"
  const status = formData.get("status") as "Incomplete" | "In Progress" | "Completed"

  if (!title || !due_date || !priority || !status) {
    return { error: "Missing required fields" }
  }

  try {
    const updatedTask = await updateTask(id, {
      title,
      description,
      due_date,
      priority,
      status,
    })

    revalidatePath("/")
    return { success: !!updatedTask, task: updatedTask }
  } catch (error) {
    console.error("Error updating task:", error)
    return { error: "Failed to update task" }
  }
}

export async function removeTask(id: string) {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)

    if (error) throw error

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { success: false, error: "Failed to delete task" }
  }
}

export async function deleteAllTasks() {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .neq("id", "dummy") // This ensures we delete all tasks

    if (error) throw error

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting all tasks:", error)
    return { success: false, error: "Failed to delete all tasks" }
  }
}

export async function fetchTasks(filters: TaskFilters = {}) {
  try {
    const tasks = await getFilteredTasks(filters)
    return { tasks }
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return { tasks: [] }
  }
}

export async function fetchStats() {
  try {
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

export async function exportTasks() {
  try {
    const jsonData = await exportTasksToJSON()
    return { jsonData }
  } catch (error) {
    console.error("Error exporting tasks:", error)
    return { jsonData: "[]" }
  }
}

export async function importTasks(jsonData: string) {
  try {
    const success = await importTasksFromJSON(jsonData)
    if (success) {
      revalidatePath("/")
    }
    return { success }
  } catch (error) {
    console.error("Error importing tasks:", error)
    return { success: false }
  }
}
