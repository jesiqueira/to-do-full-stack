// src/features/tasks/types/index.ts

import type { Task, ApiResponse, ApiError } from '@/types'

export interface CreateTaskData {
  titulo: string
  descricao: string
  status: 'pendente' | 'em_andamento' | 'concluida'
}

export type UpdateTaskData = Partial<CreateTaskData>

export interface TasksFilter {
  status?: Task['status']
  search?: string
}

// Mapeamento de Status (igual ao seu código original)
export const STATUS_MAP = {
  pendente: { label: 'Pendente', color: 'bg-red-500', icon: '⏰' },
  em_andamento: { label: 'Em Progresso', color: 'bg-yellow-500', icon: '🛠️' },
  concluida: { label: 'Concluída', color: 'bg-green-500', icon: '✅' },
} as const

export type { Task, ApiResponse, ApiError }
