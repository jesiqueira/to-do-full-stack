// src/types/auth.ts

export interface User {
  id: number
  nome: string
  email: string
  createdAt: string
}

export interface RegisterData {
  nome: string
  email: string
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  usuario: User
}
