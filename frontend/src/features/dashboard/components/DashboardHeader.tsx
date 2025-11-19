// src/features/dashboard/components/DashboardHeader.tsx
import React from 'react'
import type { User } from '@/types'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface DashboardHeaderProps {
  user: User | null
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Título */}
          <h1 className="text-3xl font-extrabold text-blue-600">Seu Gerenciador de Tarefas</h1>

          {/* Usuário e Botão Sair */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 font-medium">{user?.nome || 'Usuário'}</span>
            <button onClick={handleLogout} className="flex items-center text-sm text-red-500 hover:text-red-700 font-medium transition duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
