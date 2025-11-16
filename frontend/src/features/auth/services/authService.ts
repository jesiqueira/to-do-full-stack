// src/features/auth/services/authService.ts

import { authAPI } from '../api/authAPI'
import type { LoginCredentials, RegisterData, AuthSucessResponse, User } from '../types'

export class AuthService {
  async register(userData: RegisterData): Promise<User> {
    const response = await authAPI.register(userData)

    if (!response.data || !response.data.id) {
      throw new Error('Falha no registro: resposta sem dados do usuário.')
    }

    return response.data as User
  }

  async login(crendentials: LoginCredentials): Promise<AuthSucessResponse> {
    const response = await authAPI.login(crendentials)

    if (!response.data.token || !response.data.usuario) {
      throw new Error('Falha no login: respsota de autenticação incompleta.')
    }

    return { token: response.data.token, usuario: response.data.usuario }
  }

  async getCurrentUser(): Promise<User> {
    const response = await authAPI.getMe()

    if (!response.data.data) {
      throw new Error('Falha ao buscar usuário: resposta sem dados')
    }

    return response.data.data
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const response = await authAPI.updateUser(userId, userData)

    if (!response.data.data) {
      throw new Error('Falha ao atualizar usuário: resposta sem dados')
    }

    return response.data.data
  }
}

export const authService = new AuthService()
