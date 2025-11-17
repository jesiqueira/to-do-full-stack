// src/features/auth/components/AuthForm.ts

import React from 'react'
import { Input } from '@/components/ui/Input/Input'
import { Button } from '@/components/ui/Button/Button'

interface AuthFormProps {
  authMode: 'login' | 'register'
  email: string
  password: string
  nome?: string
  isSubmittingAuth: boolean
  handleSubmit: (e: React.FormEvent) => void
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ authMode, email, password, nome, isSubmittingAuth, handleSubmit, handleChange }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {authMode === 'register' && (
        <Input
          label="Nome"
          name="nome"
          type="text"
          value={nome}
          onChange={handleChange}
          placeholder="Digite seu nome"
          required
          disabled={isSubmittingAuth}
        />
      )}

      <Input
        label="E-mail"
        name="email"
        type="email"
        value={email}
        onChange={handleChange}
        placeholder="Digite seu e-mail"
        required
        disabled={isSubmittingAuth}
      />

      <Input
        label="Senha"
        name="password"
        type="password"
        value={password}
        onChange={handleChange}
        placeholder="Senha (mín. 6 caracteres)"
        required
        disabled={isSubmittingAuth}
      />

      <Button type="submit" isLoading={isSubmittingAuth} variant="primary" size="md" className="w-full">
        {authMode === 'register' ? 'Cadastrar' : 'Entrar'}
      </Button>
    </form>
  )
}
