// src/features/tasks/components/TaskFilter.tsx

import React from 'react'
import { Input } from '@/components/ui'
import type { TasksFilter } from '../types'

interface TaskFilterProps {
  filters: TasksFilter
  onFiltersChange: (filters: TasksFilter) => void
}

export const TaskFilter: React.FC<TaskFilterProps> = ({ filters, onFiltersChange }) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value,
    })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      status: e.target.value as TasksFilter['status'],
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input type="text" placeholder="Buscar tarefas..." value={filters.search || ''} onChange={handleSearchChange} />
      </div>
      <div className="sm:w-48">
        <select
          value={filters.status || ''}
          onChange={handleStatusChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em Progresso</option>
          <option value="concluida">Concluída</option>
        </select>
      </div>
    </div>
  )
}
