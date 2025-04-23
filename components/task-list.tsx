/**
 * Task List Component
 * 
 * This component displays a list of tasks with filtering, sorting, and CRUD operations.
 * It includes search functionality, sorting options, and the ability to add, edit, and delete tasks.
 */

"use client"

import { useState, useEffect } from "react"
import type { Task, TaskFilters, SortField, SortDirection } from "@/lib/types"
import { fetchTasks, removeTask } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import {
  Search,
  SortAsc,
  SortDesc,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
import TaskForm from "./task-form"
import { toast } from "@/components/ui/use-toast"
import DeleteAllTasks from "./delete-all-tasks"

/**
 * Props for the TaskList component
 */
type TaskListProps = {
  initialTasks: Task[] // Initial tasks to display
}

/**
 * TaskList Component
 * 
 * Displays a list of tasks with filtering, sorting, and CRUD operations.
 * 
 * initialTasks - Initial tasks to display
 */
export default function TaskList({ initialTasks }: TaskListProps) {
  // State for tasks and UI controls
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filters, setFilters] = useState<TaskFilters>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Refreshes the task list by fetching tasks with current filters
   */
  const refreshTasks = async () => {
    setIsLoading(true)
    try {
      // Fetch tasks with current filters from the server
      const { tasks: newTasks } = await fetchTasks(filters)
      setTasks(newTasks || [])
    } catch (error) {
      console.error("Error refreshing tasks:", error)
      // Show error toast notification
      toast({
        title: "Error",
        description: "Failed to refresh tasks",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh tasks when filters change
  useEffect(() => {
    refreshTasks()
  }, [filters])

  // Listen for task update events from other components
  useEffect(() => {
    const handleTaskUpdate = () => {
      refreshTasks()
    }

    // Add event listener for task updates
    window.addEventListener("taskUpdate", handleTaskUpdate)
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("taskUpdate", handleTaskUpdate)
    }
  }, [])

  /**
   * Handles the search action
   * Updates filters with the current search term and refreshes tasks
   */
  const handleSearch = async () => {
    const newFilters = { ...filters, search: searchTerm }
    setFilters(newFilters)
  }

  /**
   * Handles the sort action
   * Toggles sort direction if the same field is selected again
   * 
   * field - The field to sort by
   */
  const handleSort = async (field: SortField) => {
    // Determine sort direction (toggle if same field)
    let direction: SortDirection = "asc"
    if (sortBy === field) {
      direction = sortDirection === "asc" ? "desc" : "asc"
    }

    // Update sort state
    setSortBy(field)
    setSortDirection(direction)

    // Update filters with new sort parameters
    const newFilters = { ...filters, sortBy: field, sortDirection: direction }
    setFilters(newFilters)
  }

  /**
   * Handles the delete action for a single task
   * Shows a confirmation dialog and deletes the task if confirmed
   * 
   * The ID of the task to delete
   */
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        // Call the server action to delete the task
        const { success } = await removeTask(id)
        if (success) {
          // Show success toast notification
          toast({
            title: "Task deleted",
            description: "The task has been successfully deleted.",
          })
          // Refresh the task list
          refreshTasks()
        } else {
          throw new Error("Failed to delete task")
        }
      } catch (error) {
        console.error("Error deleting task:", error)
        // Show error toast notification
        toast({
          title: "Error",
          description: "Failed to delete the task",
          variant: "destructive",
        })
      }
    }
  }

  /**
   * Handles successful task edit
   * Resets editing state and refreshes tasks
   */
  const handleEditSuccess = () => {
    setEditingTask(null)
    setIsDialogOpen(false)
    refreshTasks()
  }

  /**
   * Returns the appropriate CSS classes for a priority badge
   * 
   * priority - The priority level of the task
   * returns CSS classes for styling the priority badge
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  /**
   * Returns the appropriate icon component for a task status
   * 
   * status - The status of the task
   * returns React component for the status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Incomplete":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSort("title")}>
                Title {sortBy === "title" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("due_date")}>
                Due Date {sortBy === "due_date" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("priority")}>
                Priority {sortBy === "priority" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("status")}>
                Status {sortBy === "status" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("created_at")}>
                Created {sortBy === "created_at" && (sortDirection === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete All button */}
          <DeleteAllTasks />

          {/* Add Task dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Task</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm
                onSuccess={() => {
                  setIsDialogOpen(false)
                  refreshTasks()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tasks found. Create a new task to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault()
                              setEditingTask(task)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                          </DialogHeader>
                          {editingTask && <TaskForm task={editingTask} onSuccess={handleEditSuccess} />}
                        </DialogContent>
                      </Dialog>
                      <DropdownMenuItem className="text-red-600" onSelect={() => handleDelete(task.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">{task.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Due: {format(new Date(task.due_date), "MMM d, yyyy")}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Badge variant="outline" className={`${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </Badge>
                <div className="flex items-center gap-1">
                  {getStatusIcon(task.status)}
                  <span className="text-sm">{task.status}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
