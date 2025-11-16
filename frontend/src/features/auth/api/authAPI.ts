// src/features/auth/api/authAPI.ts

import { api } from '@/lib/axios'

// Importa tipos do index local
import type { LoginCredentials, RegisterData, User, ApiResponse } from '../types'

export const authAPI = {
  // Cadastro retorna o Usuário criado diretamente (sem token)
  register: (userData: RegisterData) => api.post<User>('/usuarios/cadastro', userData),

  // O endpoint de login retorna token e usuario no corpo principal da ApiResponse.
  login: (credentials: LoginCredentials) => api.post<ApiResponse<null>>('', credentials),

  // O endpoint /me retorna o User no campo 'data' da ApiResponse.
  getMe: () => api.get<ApiResponse<User>>('/usuarios/me'),

  // O endpoint de atualização retorna o User no campo 'data'.
  updateUser: (userId: number, userData: Partial<User>) => api.put<ApiResponse<User>>(`/usuarios/${userId}`, userData),

  deleteUser: (userId: number) => api.delete(`/usuarios/${userId}`),
}
