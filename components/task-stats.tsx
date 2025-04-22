"use client"

import { useState, useEffect } from "react"
import { fetchStats } from "@/app/actions"
import type { TaskStats } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Calendar, ListTodo } from "lucide-react"

export default function TaskStatistics({ initialStats }: { initialStats: TaskStats }) {
  const [stats, setStats] = useState<TaskStats>(initialStats)

  const refreshStats = async () => {
    const { stats: newStats } = await fetchStats()
    setStats(newStats)
  }

  useEffect(() => {
    // Refresh stats when component mounts
    refreshStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <ListTodo className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTasks}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedTasks}</div>
          {stats.totalTasks > 0 && (
            <p className="text-xs text-gray-500">
              {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% of total
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
          <Calendar className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.dueSoonTasks}</div>
          <p className="text-xs text-gray-500">Due in the next 7 days</p>
        </CardContent>
      </Card>
    </div>
  )
}
