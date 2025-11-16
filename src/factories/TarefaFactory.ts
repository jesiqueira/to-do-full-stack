// src/factories/TarefaFactory.ts

import { Tarefa } from '../database/models/Tarefa'
import type { TarefaCreationAttributes } from '../database/models/Tarefa'

export const criarTarefa = async (usuarioId: number, overrides?: Partial<Omit<TarefaCreationAttributes, 'usuarioId'>>): Promise<Tarefa> => {
  return await Tarefa.create({
    titulo: 'Tarefa Teste',
    descricao: 'Descrição da tarefa teste',
    usuarioId,
    status: 'pendente',
    ...overrides,
  })
}
