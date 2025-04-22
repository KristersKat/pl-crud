"use client"

import { useState } from "react"
import { exportTasks, importTasks } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Download, Upload, FileJson } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function TaskImportExport() {
  const [importData, setImportData] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { jsonData } = await exportTasks()

      // Create a download link
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tasks-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "Your tasks have been exported to a JSON file.",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your tasks.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    try {
      const { success } = await importTasks(importData)

      if (success) {
        setImportData("")
        toast({
          title: "Import Successful",
          description: "Your tasks have been imported successfully.",
        })
      } else {
        throw new Error("Import failed")
      }
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Import Failed",
        description: "There was an error importing your tasks. Please check the JSON format.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" className="gap-2" onClick={handleExport} disabled={isExporting}>
        <Download className="h-4 w-4" />
        {isExporting ? "Exporting..." : "Export Tasks"}
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import Tasks
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-md">
              <FileJson className="h-8 w-8 text-gray-400" />
            </div>
            <Textarea
              placeholder="Paste your JSON data here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleImport} disabled={!importData.trim() || isImporting}>
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
