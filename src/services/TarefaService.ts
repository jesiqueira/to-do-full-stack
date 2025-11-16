/**
 * src/services/TarefaService.ts
 * Service para operacoes de Tarefa
 */

import type { ITarefaService } from './interfaces/ITarefaService'
import type { ITarefaRepository } from '../repositories/interfaces/ITarefaRepository'
import type Tarefa from '../database/models/Tarefa'
import type {
  IFiltroTarefaDTO,
  ITarefaResponseDTO,
  ITarefaListaResponseDTO,
  ICriarTarefaDTO,
  IAtualizarTarefaDTO,
  StatusTarefa,
} from '../schemas/interfaces/ITarefaSchemas'
import { TarefaNaoEncontradaError, TarefaDadosInvalidosError } from '../errors'

export class TarefaService implements ITarefaService {
  private tarefaRepository: ITarefaRepository

  constructor(tarefaRepository: ITarefaRepository) {
    this.tarefaRepository = tarefaRepository
  }

  async buscarPorId(id: number): Promise<ITarefaResponseDTO | null> {
    const tarefa = await this.tarefaRepository.findById(id)
    return tarefa ? this.toResponseDTO(tarefa) : null
  }

  async buscarPorUsuarioId(usuarioId: number): Promise<ITarefaResponseDTO[]> {
    if (!usuarioId || usuarioId <= 0) {
      throw new TarefaDadosInvalidosError('ID do usuário inválido')
    }

    const tarefas = await this.tarefaRepository.findByUsuarioId(usuarioId)
    return tarefas.map((tarefa) => this.toResponseDTO(tarefa))
  }

  async buscarPorStatus(status: string): Promise<ITarefaResponseDTO[]> {
    const statusNormalizado = status.toLowerCase() as StatusTarefa
    const statusValidos: StatusTarefa[] = ['pendente', 'em_andamento', 'concluida']

    if (!statusValidos.includes(statusNormalizado)) {
      throw new TarefaDadosInvalidosError(`Status inválido: ${status}`)
    }

    const tarefas = await this.tarefaRepository.findByStatus(statusNormalizado)
    return tarefas.map((tarefa) => this.toResponseDTO(tarefa))
  }

  // Método único sem sobrecarga - sempre retorna lista paginada
  async listarTarefas(filtros: IFiltroTarefaDTO): Promise<ITarefaListaResponseDTO> {
    const page = filtros.page || 1
    const limit = filtros.limit || 25

    const { data: tarefas, total } = await this.tarefaRepository.findAllWithPagination(filtros)

    const totalPages = Math.ceil(total / limit)

    return {
      dados: tarefas.map((tarefa) => this.toResponseDTO(tarefa)),
      paginacao: {
        pagina: page,
        limite: limit,
        total,
        totalPaginas: totalPages,
      },
    }
  }

  async criarTarefa(tarefaData: ICriarTarefaDTO): Promise<ITarefaResponseDTO> {
    if (!tarefaData.titulo || tarefaData.titulo.trim().length === 0) {
      throw new TarefaDadosInvalidosError('Título é obrigatório')
    }

    if (tarefaData.titulo.length > 255) {
      throw new TarefaDadosInvalidosError('Título muito longo')
    }

    if (tarefaData.descricao && tarefaData.descricao.length > 1000) {
      throw new TarefaDadosInvalidosError('Descrição muito longa')
    }

    const tarefa = await this.tarefaRepository.create(tarefaData)
    return this.toResponseDTO(tarefa)
  }

  async atualizarTarefa(id: number, tarefaData: IAtualizarTarefaDTO): Promise<ITarefaResponseDTO> {
    const tarefaExistente = await this.tarefaRepository.findById(id)
    if (!tarefaExistente) {
      throw new TarefaNaoEncontradaError()
    }

    if (tarefaData.titulo !== undefined) {
      if (!tarefaData.titulo || tarefaData.titulo.trim().length === 0) {
        throw new TarefaDadosInvalidosError('Título é obrigatório')
      }

      if (tarefaData.titulo.length > 255) {
        throw new TarefaDadosInvalidosError('Título muito longo')
      }
    }

    const tarefaAtualizada = await this.tarefaRepository.update(id, tarefaData)

    if (!tarefaAtualizada) {
      throw new Error('Erro interno ao atualizar tarefa')
    }

    return this.toResponseDTO(tarefaAtualizada)
  }

  async deletarTarefa(id: number): Promise<boolean> {
    const tarefaExistente = await this.tarefaRepository.findById(id)
    if (!tarefaExistente) {
      throw new TarefaNaoEncontradaError()
    }

    return await this.tarefaRepository.delete(id)
  }

  private toResponseDTO(tarefa: Tarefa): ITarefaResponseDTO {
    return {
      id: tarefa.id,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      status: tarefa.status,
      usuarioId: tarefa.usuarioId,
      createdAt: tarefa.createdAt,
      updatedAt: tarefa.updatedAt,
    }
  }
}

export default TarefaService
