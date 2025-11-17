import React, { useState } from 'react'
import { HeroSection } from '@/components/layout/HeroSection'
import { BackgroundShape } from '@/components/layout/BackgroundShape'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { authService } from '@/features/auth/services/authService'
import type { RegisterData, LoginCredentials } from '@/features/auth/types'
import { Notification } from '@/components/ui'

export const AuthScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
  })
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)
  const [authAttempted, setAuthAttempted] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // 🔑 Cadastro
  const handleRegister = async () => {
    setIsSubmittingAuth(true)
    setError(null)
    try {
      const userData: RegisterData = {
        email: formData.email,
        password: formData.password,
        nome: formData.nome,
      }
      const newUser = await authService.register(userData)
      setUser(newUser)
      console.log('Usuário cadastrado:', newUser)
    } catch (err: any) {
      console.error('Erro no cadastro:', err)
      setError(err.message || 'Falha no cadastro. Tente novamente.')
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  // 🔑 Login
  const handleLogin = async () => {
    setIsSubmittingAuth(true)
    setError(null)
    try {
      const credentials: LoginCredentials = {
        email: formData.email,
        password: formData.password,
      }
      const authResponse = await authService.login(credentials)
      setUser(authResponse.usuario)
      localStorage.setItem('token', authResponse.token)
      console.log('Login realizado:', authResponse)
    } catch (err: any) {
      console.error('Erro no login:', err)
      setError(err.message || 'Falha no login. Verifique suas credenciais.')
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
    setError(null)
    try {
      console.log('Login de convidado...')
      // Adicione aqui a lógica para login de convidado
    } catch (err: any) {
      setError('Falha na autenticação de convidado.')
      setAuthAttempted(false)
    }
  }

  // 🔑 Alternar entre modos
  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))
    setError(null)
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
          setError={setError}
        />
      </div>

      <BackgroundShape position="bottom" />
    </div>
  )
}
