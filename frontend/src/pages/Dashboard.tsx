// src/pages/Dashboard.tsx
import React from 'react'
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { TaskManager } from '@/features/tasks/components/TaskManager'
import { useAuthStore } from '@/stores/authStore'

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />
      <TaskManager />
    </div>
  )
}
