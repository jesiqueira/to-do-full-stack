// src/features/tasks/services/taskService.ts

import { taskAPI } from '../api/taskAPI'
import type { Task, CreateTaskData, UpdateTaskData } from '../types'

export class TaskService {
  async getAllTasks(): Promise<Task[]> {
    const response = await taskAPI.getAll()

    if (!response.data.dados) {
      throw new Error('Falha ao buscar tarefas: resposta sem dados')
    }

    return response.data.dados
  }

  async getTaskById(taskId: number): Promise<Task> {
    const response = await taskAPI.getById(taskId)

    if (!response.data.data) {
      throw new Error('Falha ao buscar tarefa: resposta sem dados')
    }
    return response.data.data
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    const response = await taskAPI.create(taskData)

    if (!response.data.data) {
      throw new Error('Falha ao criar tarefa: resposta sem dados')
    }

    return response.data.data
  }

  async updateTask(taskId: number, taskData: UpdateTaskData): Promise<Task> {
    const response = await taskAPI.update(taskId, taskData)

    if (!response.data.data) {
      throw new Error('Falha ao atualizar tarefa: resposta sem dados')
    }

    return response.data.data
  }

  async deleteTask(taskId: number): Promise<void> {
    await taskAPI.delete(taskId)
  }
}

export const taskService = new TaskService()
