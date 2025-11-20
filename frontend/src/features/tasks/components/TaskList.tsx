// src/features/tasks/components/TaskList.tsx
import React from 'react'
import { TaskItem } from './TaskItem'
import type { Task } from '../types'

interface TaskListProps {
  tasks: Task[]
}

export const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-inner text-gray-500">🎉 Nenhuma tarefa encontrada! Crie uma nova para começar.</div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}
