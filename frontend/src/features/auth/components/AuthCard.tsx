// src/features/auth/components/AuthCard.tsx

import React from 'react'
import { AuthForm } from './AuthForm'
import { Divider } from '@/components/layout/Divider'
import { Button } from '@/components/ui/Button/Button'

interface AuthCardProps {
  title: string
  switchText: string
  authMode: 'login' | 'register'
  email: string
  password: string
  nome: string
  isSubmittingAuth: boolean
  authAttempted: boolean
  handleSubmit: (e: React.FormEvent) => void
  handleGuestLogin: () => void
  setAuthMode: (mode: 'login' | 'register') => void
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  switchText,
  authMode,
  email,
  password,
  nome,
  isSubmittingAuth,
  authAttempted,
  handleSubmit,
  handleGuestLogin,
  setAuthMode,
  handleChange,
}) => {
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 lg:w-1/3">
      {/* Título */}
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{title}</h2>

      {/* Formulário */}
      <AuthForm
        authMode={authMode}
        email={email}
        password={password}
        nome={nome}
        isSubmittingAuth={isSubmittingAuth}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
      />

      {/* Divisor */}
      <Divider />

      {/* Botão de convidado */}
      <Button
        onClick={handleGuestLogin}
        isLoading={authAttempted}
        disabled={authAttempted || isSubmittingAuth}
        variant="outline"
        size="md"
        className="w-full"
      >
        Acessar com Usuário de Teste
      </Button>

      {/* Alternar entre login/cadastro */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setAuthMode(authMode === 'login' ? 'register' : 'login')
          }}
          className="text-sm text-blue-500 hover:text-blue-700 transition duration-150"
          type="button" 
        >
          {switchText}
        </button>
      </div>
    </div>
  )
}
