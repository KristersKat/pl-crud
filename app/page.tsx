import { getFilteredTasks, getTaskStats } from "@/lib/tasks"
import TaskList from "@/components/task-list"
import TaskStatistics from "@/components/task-stats"
import TaskImportExport from "@/components/task-import-export"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const tasks = getFilteredTasks()
  const stats = getTaskStats()

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Manager</h1>
          <p className="text-gray-500">Manage your tasks efficiently</p>
        </div>
        <TaskImportExport />
      </div>

      <TaskStatistics initialStats={stats} />

      <TaskList initialTasks={tasks} />

      <Toaster />
    </main>
  )
}
