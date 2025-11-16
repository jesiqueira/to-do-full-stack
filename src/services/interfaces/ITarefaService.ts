/**
 * src/services/interfaces/ITarefaService.ts
 * Interface para o TarefaService
 */

import type {
  IFiltroTarefaDTO,
  ITarefaResponseDTO,
  ITarefaListaResponseDTO,
  ICriarTarefaDTO,
  IAtualizarTarefaDTO,
} from '../../schemas/interfaces/ITarefaSchemas'

export interface ITarefaService {
  /**
   * Buscar Tarefa por ID
   * @param id
   */
  buscarPorId(id: number): Promise<ITarefaResponseDTO | null>

  /**
   * Buscar Tarefas por usuarioId
   * @param usuarioId
   */
  buscarPorUsuarioId(usuarioId: number): Promise<ITarefaResponseDTO[]>

  /**
   * Buscar por status da Tarefa
   * @param status
   */
  buscarPorStatus(status: string): Promise<ITarefaResponseDTO[]>

  /**
   * Listar tarefas com paginação e filtros
   * @param filtros - Filtros e opções de paginação
   */
  listarTarefas(filtros: IFiltroTarefaDTO): Promise<ITarefaListaResponseDTO>

  /**
   * Criar uma Tarefa
   */
  criarTarefa(tarefaData: ICriarTarefaDTO): Promise<ITarefaResponseDTO>

  /**
   * Atualizar Tarefa existente
   * @param id
   * @param tarefaData
   */
  atualizarTarefa(id: number, tarefaData: IAtualizarTarefaDTO): Promise<ITarefaResponseDTO>

  /**
   * Deletar uma tarefa
   * @param id
   */
  deletarTarefa(id: number): Promise<boolean>
}
