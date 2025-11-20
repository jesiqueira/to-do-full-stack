// src/features/tasks/components/TaskForm.tsx
import React, { useState } from 'react'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { STATUS_MAP } from '../types'

interface TaskFormProps {
  onSubmit: (taskData: { titulo: string; descricao: string; status: 'pendente' | 'em_progresso' | 'concluida' }) => void
  isLoading: boolean
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, isLoading }) => {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [status, setStatus] = useState<'pendente' | 'em_progresso' | 'concluida'>('pendente')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (titulo.trim() && descricao.trim()) {
      onSubmit({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        status,
      })
      setTitulo('')
      setDescricao('')
      setStatus('pendente')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
          Título
        </label>
        <Input
          id="titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Pagar contas"
          required
          disabled={isLoading}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        />
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Detalhes da tarefa..."
          required
          rows={3}
          disabled={isLoading}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'pendente' | 'em_progresso' | 'concluida')}
          disabled={isLoading}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
        >
          {Object.entries(STATUS_MAP).map(([key, data]) => (
            <option key={key} value={key} className="bg-white text-gray-900">
              {data.label}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !titulo.trim() || !descricao.trim()}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-85"
      >
        {isLoading ? 'Salvando...' : 'Adicionar Tarefa'}
      </Button>
    </form>
  )
}
