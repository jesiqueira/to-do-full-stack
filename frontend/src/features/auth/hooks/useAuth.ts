// src/features/auth/hooks/useAuth.ts

import React, { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { useAuthStore } from '@/stores/authStore'
import type { ApiError } from '@/types'
import type { LoginCredentials, RegisterData } from '../types'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const { user, setUser, clearUser } = useAuthStore()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // limpar erro automaticamentes após 5 segundos
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const clearError = React.useCallback(() => setError(null), [])

  const checkAuth = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch {
      clearUser()
      localStorage.removeItem('authToken')
      setError('Sessão expirada. Faça login novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [setUser, clearUser])

  const getErrorMessage = (err: unknown): string => {
    const apiError = err as ApiError
    return apiError.response?.data?.error || apiError.response?.data?.message || apiError.message || 'Erro inesperado'
  }

  React.useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token && !user) {
      checkAuth()
    }
  }, [checkAuth, user])

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: () => {
      setError(null)
    },
    onError: (err: unknown) => {
      console.error('Erro detalhado no registro: ', err)
      const message = getErrorMessage(err)
      setError(message)
    },
  })

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setUser(data.usuario)
      localStorage.setItem('authToken', data.token)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setError(null)
    },
    onError: (err: unknown) => {
      console.error('Erro detalhado no login:', err)
      const message = getErrorMessage(err)
      setError(message)
    },
  })

  const logout = useCallback(() => {
    clearUser()
    localStorage.removeItem('authToken')
    queryClient.clear()
    setError(null)
  }, [clearUser, queryClient])

  return {
    user,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    clearError,
    isAuthenticated: !!user,
    registerMutation,
  }
}
