// src/components/ui/Notification/Notification.tsx

import React from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose, duration = 10000 }) => {
  // <--- DURAÇÃO ALTERADA PARA 10 SEGUNDOS
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type]

  const textColor = 'text-white'

  return (
    <div className={`fixed top-4 right-4 ${bgColor} ${textColor} p-4 rounded-lg shadow-lg z-50 max-w-sm`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200 transition-colors">
          ✕
        </button>
      </div>
    </div>
  )
}
