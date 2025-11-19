// src/pages/Dashboard.tsx
import React from 'react'
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
// import { TaskManager } from '@/features/tasks/components/TaskManager'
// import { StatsOverview } from '@/features/dashboard/components/StatsOverview'
import { useAuthStore } from '@/stores/authStore'

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        {/* <StatsOverview /> */}

        {/* Gerenciador de Tarefas */}
        <div className="mt-8">{/* <TaskManager /> */}</div>
      </main>
    </div>
  )
}
