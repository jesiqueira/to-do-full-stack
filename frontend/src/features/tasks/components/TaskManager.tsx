// src/features/tasks/components/TaskManager.tsx
import React, { useState } from 'react'
import { TaskForm } from './TaskForm'
import { TaskList } from './TaskList'
import { TaskFilter } from './TaskFilter'
import { useTasks } from '../hooks/useTasks'
import type { TasksFilter } from '../types'

export const TaskManager: React.FC = () => {
  const { tasks, createTask, isCreating } = useTasks()
  const [filters, setFilters] = useState<TasksFilter>({})

  const filteredTasks = tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return task.titulo.toLowerCase().includes(searchLower) || task.descricao.toLowerCase().includes(searchLower)
    }
    return true
  })

  const handleCreateTask = async (taskData: { titulo: string; descricao: string }) => {
    await createTask({
      ...taskData,
      status: 'pendente',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Adição de Tarefa - FIXO */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Criar Nova Tarefa</h2>
            <TaskForm onSubmit={handleCreateTask} isLoading={isCreating} />
          </div>
        </div>

        {/* Coluna da Lista de Tarefas */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Minhas Tarefas ({filteredTasks.length})</h2>

            {/* Filtros */}
            <TaskFilter filters={filters} onFiltersChange={setFilters} />

            {/* Lista de Tarefas */}
            <TaskList tasks={filteredTasks} />
          </div>
        </div>
      </div>
    </div>
  )
}
