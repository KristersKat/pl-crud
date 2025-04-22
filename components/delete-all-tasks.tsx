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

export default function DeleteAllTasks() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAll = async () => {
    setIsDeleting(true)
    try {
      const { success, error } = await deleteAllTasks()
      
      if (success) {
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
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete All Tasks
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete All Tasks</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete all tasks? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteAll} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 