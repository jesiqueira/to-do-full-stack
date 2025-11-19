// src/features/tasks/api/taskAPI.ts

import { api } from '@/lib/axios'
import type { Task, CreateTaskData, UpdateTaskData, ApiResponse } from '../types'

export const taskAPI = {
  getAll: () => api.get<ApiResponse<Task[]>>('/tarefas'),
  getById: (taskId: number) => api.get<ApiResponse<Task>>(`/tarefas/${taskId}`),
  create: (taskData: CreateTaskData) => api.post<ApiResponse<Task>>('/tarefas', taskData),
  update: (taskId: number, taskData: UpdateTaskData) => api.put<ApiResponse<Task>>(`/tarefas/${taskId}`, taskData),
  delete: (taskId: number) => api.delete(`/tarefas/${taskId}`),
}
