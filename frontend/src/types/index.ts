// src/types/index.ts

// Tipos Centrais: Define as interfaces de Entidades e a Estrutura Padrão de Resposta da API.

/**
 * Interface que representa a entidade Usuário.
 */
export interface User {
  id: number
  nome: string
  email: string
  createdAt: string
  updatedAt: string
}

/**
 * Interface que representa a entidade Tarefa (exemplo de módulo futuro).
 */
export interface Task {
  id: number
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  userId: number
  createdAt: string
  updatedAt: string
}

/**
 * Estrutura de Resposta Padrão da API (Usada em todas as chamadas do Axios).
 * T = tipo de dado esperado no campo 'data'.
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  error?: string // Campo para erros de servidor (pode ser usado pelo backend)
  data?: T // Payload de um único item (usado em GET de 1 item, PUT, POST)
  dados?: T[] // Payload de uma lista de itens (usado em GET de coleções)

  // Campos de Autenticação: Incluídos aqui para endpoints de login/registro
  token?: string
  usuario?: User
}

/**
 * Interface para padronizar o tratamento de erros do Axios/API (usada no useAuth).
 * Estende a Error nativa para incluir a estrutura de resposta HTTP.
 */
export interface ApiError extends Error {
  response?: {
    data: {
      error?: string // Mensagem de erro principal do servidor
      message?: string // Mensagem alternativa (comum em alguns frameworks)
      validationErrors?: Record<string, string[]> // Para erros de validação de formulário
    }
    status: number
  }
}
