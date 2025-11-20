// src/features/dashboard/components/StatsOverview.tsx

import type React from 'react'
import { useTasks } from '@/features/tasks/hooks/useTasks'

export const StatsOverview: React.FC = () => {
  const { tasks } = useTasks()

  const stats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === 'pendente').length,
    inProgress: tasks.filter((task) => task.status === 'em_andamento').length,
    completed: tasks.filter((task) => task.status === 'concluida').length,
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total de Tarefas */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate"> Total de Tarefas</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
        </div>
      </div>
      {/* Pendentes */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate"> Pendentes</dt>
          <dd className="mt-1 text-3xl font-semibold text-red-600">{stats.pending}</dd>
        </div>
      </div>
      {/* Em Progresso */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate"> Em Progresso</dt>
          <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.inProgress}</dd>
        </div>
      </div>{' '}
      {/* Concluidas */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate"> Concluída</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.completed}</dd>
        </div>
      </div>
    </div>
  )
}
