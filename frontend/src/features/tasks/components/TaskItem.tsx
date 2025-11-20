// src/features/tasks/components/TaskItem.tsx
import React, { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useAuthStore } from '@/stores/authStore'
import { STATUS_MAP } from '../types'
import type { Task } from '../types'
import { Button, Input } from '@/components/ui'

interface TaskItemProps {
  task: Task
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTask, deleteTask, isUpdating, isDeleting } = useTasks()
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    titulo: task.titulo,
    descricao: task.descricao,
    status: task.status,
  })

  const statusInfo = STATUS_MAP[task.status]

  const handleStatusChange = async (newStatus: Task['status']) => {
    await updateTask({ taskId: task.id, taskData: { status: newStatus } })
  }

  const handleSave = async () => {
    await updateTask({
      taskId: task.id,
      taskData: {
        titulo: editData.titulo,
        descricao: editData.descricao,
        status: editData.status,
      },
    })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(task.id)
    }
  }

  if (isEditing) {
    return (
      <div
        className="bg-white p-4 rounded-xl shadow-md border-l-4 border-gray-200 transition duration-200 hover:shadow-lg"
        style={{ borderLeftColor: statusInfo.color.split('-')[1] }}
      >
        <div className="space-y-3">
          <Input
            type="text"
            value={editData.titulo}
            onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-medium focus:ring-blue-500 focus:border-blue-500"
            disabled={isUpdating}
          />
          <textarea
            value={editData.descricao}
            onChange={(e) => setEditData({ ...editData, descricao: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-600 text-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={isUpdating}
          />
          <select
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value as Task['status'] })}
            className="px-3 py-1 text-sm font-medium rounded-lg text-white bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
            disabled={isUpdating}
          >
            {Object.entries(STATUS_MAP).map(([key, data]) => (
              <option key={key} value={key} className={`${data.color} text-white`}>
                {data.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition duration-150"
            >
              Salvar
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              disabled={isUpdating}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 disabled:opacity-50 transition duration-150"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 border-l-4 border-gray-200 transition duration-200 hover:shadow-lg"
      style={{ borderLeftColor: statusInfo.color.split('-')[1] }}
    >
      {/* Conteúdo da Tarefa */}
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {statusInfo.icon} {task.titulo}
        </h3>
        <p className="text-sm text-gray-500 mt-1 break-words">{task.descricao}</p>
        <div className="mt-2 text-xs text-gray-400">
          ID do Usuário: <span className="font-mono text-gray-600 text-[10px]">{user?.id || 'N/A'}</span>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center space-x-3 w-full md:w-auto">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
          className={`px-3 py-1 text-sm font-medium rounded-lg text-white ${statusInfo.color} focus:outline-none focus:ring-2 focus:ring-offset-2 w-full md:w-auto`}
          disabled={isUpdating}
        >
          {Object.entries(STATUS_MAP).map(([key, data]) => (
            <option key={key} value={key} className="bg-white text-gray-900">
              {data.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setIsEditing(true)}
          disabled={isUpdating}
          className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition duration-150 disabled:opacity-50"
          title="Editar Tarefa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 rounded-full text-red-600 hover:bg-red-100 transition duration-150 disabled:opacity-50"
          title="Deletar Tarefa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
