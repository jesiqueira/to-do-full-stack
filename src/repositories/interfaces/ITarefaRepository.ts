/**
 * src/repositories/interfaces/ITarefaRepository.ts
 * Interface define o CONTRATO que o TarefaRepository deve seguir
 */
import type { Tarefa } from '../../database/models/Tarefa'
import type { IFiltroTarefaDTO, ICriarTarefaDTO, IAtualizarTarefaDTO } from '../../schemas/interfaces/ITarefaSchemas'

export interface ITarefaRepository {
  /**
   * Busca uma tarefa pelo ID
   * @param id - ID da tarefa
   * @returns Promise<Tarefa | null> - Tarefa encontrada ou null
   */
  findById(id: number): Promise<Tarefa | null>

  /**
   * Busca tarefas por ID do usuário
   * @param usuarioId - ID do usuário
   * @returns Promise<Tarefa[]> - Array de tarefas do usuário
   */
  findByUsuarioId(usuarioId: number): Promise<Tarefa[]>

  /**
   * Busca tarefas por status
   * @param status - Status da tarefa
   * @returns Promise<Tarefa[]> - Array de tarefas com o status
   */
  findByStatus(status: string): Promise<Tarefa[]>

  /**
   * Lista todas as tarefas
   * @returns Promise<Tarefa[]> - Array de todas as tarefas
   */
  findAll(): Promise<Tarefa[]>

  /**
   * Lista tarefas com filtros
   * @param filtros
   * @returns Promise<{ data: Tarefa[]; total: number }>
   */
  findAllWithPagination(filtros: IFiltroTarefaDTO): Promise<{ data: Tarefa[]; total: number }>

  /**
   * Cria uma nova tarefa
   * @param tarefaData - Dados para criação da tarefa
   * @returns Promise<Tarefa> - Tarefa criada
   */
  create(tarefaData: ICriarTarefaDTO): Promise<Tarefa>

  /**
   * Atualiza uma tarefa existente
   * @param id - ID da tarefa
   * @param tarefaData - Dados parciais para atualização
   * @returns Promise<Tarefa | null> - Tarefa atualizada ou null se não encontrada
   */
  update(id: number, tarefaData: IAtualizarTarefaDTO): Promise<Tarefa | null>

  /**
   * Deleta uma tarefa
   * @param id - ID da tarefa
   * @returns Promise<boolean> - true se deletada, false se não encontrada
   */
  delete(id: number): Promise<boolean>
}
