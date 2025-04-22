import fs from "fs"
import path from "path"
import type { Task, TaskStats, TaskFilters, Priority, Status } from "./types"

// File path for storing tasks
const DATA_FILE_PATH = path.join(process.cwd(), "data", "tasks.json")

// Ensure the data directory exists
const ensureDataDir = () => {
  const dir = path.dirname(DATA_FILE_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(DATA_FILE_PATH)) {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([]))
  }
}

// Read tasks from file
export const getTasks = (): Task[] => {
  ensureDataDir()
  try {
    const data = fs.readFileSync(DATA_FILE_PATH, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading tasks:", error)
    return []
  }
}

// Write tasks to file
export const saveTasks = (tasks: Task[]): void => {
  ensureDataDir()
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(tasks, null, 2))
  } catch (error) {
    console.error("Error saving tasks:", error)
  }
}

// Get a single task by ID
export const getTaskById = (id: string): Task | undefined => {
  const tasks = getTasks()
  return tasks.find((task) => task.id === id)
}

// Create a new task
export const createTask = (task: Omit<Task, "id" | "created_at">): Task => {
  const tasks = getTasks()
  const newTask: Task = {
    ...task,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  }

  tasks.push(newTask)
  saveTasks(tasks)
  return newTask
}

// Update an existing task
export const updateTask = (id: string, updatedTask: Partial<Task>): Task | null => {
  const tasks = getTasks()
  const index = tasks.findIndex((task) => task.id === id)

  if (index === -1) return null

  tasks[index] = { ...tasks[index], ...updatedTask }
  saveTasks(tasks)
  return tasks[index]
}

// Delete a task
export const deleteTask = (id: string): boolean => {
  const tasks = getTasks()
  const filteredTasks = tasks.filter((task) => task.id !== id)

  if (filteredTasks.length === tasks.length) return false

  saveTasks(filteredTasks)
  return true
}

// Filter and sort tasks
export const getFilteredTasks = (filters: TaskFilters = {}): Task[] => {
  let tasks = getTasks()

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    tasks = tasks.filter(
      (task) => task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm),
    )
  }

  // Apply sorting
  if (filters.sortBy) {
    tasks = [...tasks].sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "due_date":
          comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          break
        case "priority":
          const priorityOrder: Record<Priority, number> = { Low: 0, Medium: 1, High: 2 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case "status":
          const statusOrder: Record<Status, number> = { Incomplete: 0, "In Progress": 1, Completed: 2 }
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
        case "created_at":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }

      return filters.sortDirection === "desc" ? -comparison : comparison
    })
  }

  return tasks
}

// Get task statistics
export const getTaskStats = (): TaskStats => {
  const tasks = getTasks()
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
}

// Export tasks to JSON
export const exportTasksToJSON = (): string => {
  const tasks = getTasks()
  return JSON.stringify(tasks, null, 2)
}

// Import tasks from JSON
export const importTasksFromJSON = (jsonData: string): boolean => {
  try {
    const tasks = JSON.parse(jsonData) as Task[]
    saveTasks(tasks)
    return true
  } catch (error) {
    console.error("Error importing tasks:", error)
    return false
  }
}
