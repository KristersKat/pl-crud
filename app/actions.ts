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

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const due_date = formData.get("due_date") as string
  const priority = formData.get("priority") as "Low" | "Medium" | "High"
  const status = formData.get("status") as "Incomplete" | "In Progress" | "Completed"

  if (!title || !due_date || !priority || !status) {
    return { error: "Missing required fields" }
  }

  const task = createTask({
    title,
    description,
    due_date,
    priority,
    status,
  })

  revalidatePath("/")
  return { success: true, task }
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

  const updatedTask = updateTask(id, {
    title,
    description,
    due_date,
    priority,
    status,
  })

  revalidatePath("/")
  return { success: !!updatedTask, task: updatedTask }
}

export async function removeTask(id: string) {
  const success = deleteTask(id)
  revalidatePath("/")
  return { success }
}

export async function fetchTasks(filters: TaskFilters = {}) {
  const tasks = getFilteredTasks(filters)
  return { tasks }
}

export async function fetchStats() {
  const stats = getTaskStats()
  return { stats }
}

export async function exportTasks() {
  const jsonData = exportTasksToJSON()
  return { jsonData }
}

export async function importTasks(jsonData: string) {
  const success = importTasksFromJSON(jsonData)
  if (success) {
    revalidatePath("/")
  }
  return { success }
}
