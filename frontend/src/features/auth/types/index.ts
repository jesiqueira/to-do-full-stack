// src/features/auth/types/index.ts

// Tipos especificos para o módudo de autenticação.
import type { User, ApiResponse, ApiError } from '@/types/index'

// Credenciais de Login (requisição)
export interface LoginCredentials {
  email: string
  password: string
}

// Dados de Registro (requisição)
export interface RegisterData extends LoginCredentials {
  nome: string
}

// Resposta de Sucesso de Autenticação (payload final que o service retorna)
export interface AuthSucessResponse {
  token: string
  usuario: User
}

// Reexporta os tipos necessários para outros arquivos do módulo de Auth
export type { User, ApiResponse, ApiError }
