/**
 * Delete All Tasks Component
 * 
 * This component provides a button and confirmation dialog for deleting all tasks.
 * It includes a confirmation step to prevent accidental deletion of all tasks.
 */

"use client"

import { useState } from "react"
import { deleteAllTasks } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { dispatchTaskUpdate } from "./task-import-export"

/**
 * DeleteAllTasks Component
 * 
 * Renders a button that opens a confirmation dialog for deleting all tasks.
 * When confirmed, it calls the deleteAllTasks server action and shows a success/error toast.
 */
export default function DeleteAllTasks() {
  // State for dialog visibility and deletion status
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * Handles the deletion of all tasks
   * 
   * Calls the deleteAllTasks server action, shows appropriate toast messages,
   * and dispatches a task update event to refresh the UI.
   */
  const handleDeleteAll = async () => {
    setIsDeleting(true)
    try {
      // Call the server action to delete all tasks
      const { success, error } = await deleteAllTasks()
      
      if (success) {
        // Show success toast
        toast({
          title: "All tasks deleted",
          description: "All tasks have been successfully deleted.",
        })
        setIsOpen(false)
        
        // Dispatch the task update event to refresh tasks and stats
        dispatchTaskUpdate()
      } else {
        throw new Error(error || "Failed to delete all tasks")
      }
    } catch (error) {
      console.error("Error deleting all tasks:", error)
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to delete all tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Delete All button that opens the confirmation dialog */}
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete All Tasks
        </Button>
      </DialogTrigger>
      
      {/* Confirmation dialog */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete All Tasks</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete all tasks? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {/* Cancel button */}
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          {/* Confirm button */}
          <Button variant="destructive" onClick={handleDeleteAll} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 