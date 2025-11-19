import React, { useState } from 'react'
import { HeroSection } from '@/components/layout/HeroSection'
import { BackgroundShape } from '@/components/layout/BackgroundShape'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { authService } from '@/features/auth/services/authService'
import type { RegisterData, LoginCredentials } from '@/features/auth/types'
import { Notification } from '@/components/ui'
import { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

export const AuthScreen = () => {
  const navigate = useNavigate() // ← Adicionar
  const { setUser } = useAuthStore() // ← Adicionar
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
  })
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)
  const [authAttempted, setAuthAttempted] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  // 🔑 Função para mostrar notificação
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type })
  }

  // 🔑 Função para limpar notificação
  const clearNotification = () => {
    setNotification(null)
  }

  // 🔑 Cadastro
  const handleRegister = async () => {
    setIsSubmittingAuth(true)
    try {
      const userData: RegisterData = {
        email: formData.email,
        password: formData.password,
        nome: formData.nome,
      }
      await authService.register(userData)
      setAuthMode('login')
      // console.log('Usuário cadastrado:', newUser)
    } catch (err: unknown) {
      const errorMessage = err instanceof AxiosError ? err.response?.data.error : 'Falha no cadastro. Tente novamente.'
      showNotification(errorMessage, 'error')
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  // 🔑 Login
  const handleLogin = async () => {
    setIsSubmittingAuth(true)
    try {
      const credentials: LoginCredentials = {
        email: formData.email,
        password: formData.password,
      }
      const authResponse = await authService.login(credentials)

      // Salvar token e usuário
      localStorage.setItem('authToken', authResponse.token)
      setUser(authResponse.usuario)
      navigate('/dashboard')
    } catch (err: unknown) {
      console.error('Erro no login:', err)
      const errorMessage = err instanceof AxiosError ? err.response?.data.error : 'Falha no login. Verifique suas credenciais.'
      showNotification(errorMessage, 'error')
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  // 🔑 Decide qual método chamar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (authMode === 'register') {
      handleRegister()
    } else {
      handleLogin()
    }
  }

  // 🔑 HandleChange corrigido
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 🔑 Login de convidado
  const handleGuestLogin = async () => {
    setAuthAttempted(true)
    try {
      // console.log('Login de convidado...')
      // Adicione aqui a lógica para login de convidado
    } catch {
      showNotification('Falha na autenticação de convidado.')
      setAuthAttempted(false)
    }
  }

  // 🔑 Alternar entre modos
  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))
    // Limpa os campos ao alternar
    setFormData({
      email: '',
      password: '',
      nome: '',
    })
  }

  const title = authMode === 'login' ? 'Entrar (Login)' : 'Criar Conta (Cadastro)'
  const switchText = authMode === 'login' ? 'Não tem conta? Crie uma!' : 'Já tem conta? Faça login!'

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans relative isolate overflow-hidden pt-14">
      <BackgroundShape position="top" />

      {/* Notificação única - mesma abordagem do seu outro projeto */}
      {notification && <Notification message={notification.message} type={notification.type} onClose={clearNotification} />}

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40 flex flex-col lg:flex-row items-center justify-between">
        <HeroSection />
        <AuthCard
          title={title}
          switchText={switchText}
          authMode={authMode}
          email={formData.email}
          password={formData.password}
          nome={formData.nome}
          isSubmittingAuth={isSubmittingAuth}
          authAttempted={authAttempted}
          handleSubmit={handleSubmit}
          handleGuestLogin={handleGuestLogin}
          setAuthMode={toggleAuthMode} // Alterado para a função toggle
          handleChange={handleChange}
        />
      </div>

      <BackgroundShape position="bottom" />
    </div>
  )
}
