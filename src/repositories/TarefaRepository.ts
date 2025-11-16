// src/repositories/TarefaRepository.ts

import { Tarefa } from '../database/models/Tarefa'
import type { TarefaCreationAttributes, TarefaAttributes } from '../database/models/Tarefa'
import type { ModelStatic } from 'sequelize'
import type { ITarefaRepository } from './interfaces/ITarefaRepository'
import type { IAtualizarTarefaDTO, ICriarTarefaDTO, IFiltroTarefaDTO } from '../schemas/interfaces/ITarefaSchemas'
import type { WhereOptions, FindAndCountOptions } from 'sequelize'
import { Op } from 'sequelize'

export class TarefaRepository implements ITarefaRepository {
  private model: ModelStatic<Tarefa>

  /**
   * Construtor para Injeção de Dependência
   * @param model - Model do Sequelize (padrão: Tarefa)
   */
  constructor(model: ModelStatic<Tarefa> = Tarefa) {
    this.model = model
  }

  async findById(id: number): Promise<Tarefa | null> {
    return await this.model.findByPk(id)
  }

  async findByUsuarioId(usuarioId: number): Promise<Tarefa[]> {
    return await this.model.findAll({ where: { usuarioId }, order: [['createdAt', 'DESC']] })
  }

  async findByStatus(status: string): Promise<Tarefa[]> {
    return await this.model.findAll({ where: { status }, order: [['createdAt', 'DESC']] })
  }

  async findAll(): Promise<Tarefa[]> {
    return await this.model.findAll({ order: [['createdAt', 'DESC']] })
  }

  async findAllWithPagination(filtros: IFiltroTarefaDTO): Promise<{ data: Tarefa[]; total: number }> {
    const { page = 1, limit = 25, titulo, status, usuarioId, criadoApos, criadoAntes, ordenarPor = 'createdAt', ordenarDirecao = 'DESC' } = filtros

    const offset = (page - 1) * limit

    // Construir where conditions com Op (Operadores do Sequelize)
    const where: WhereOptions<TarefaAttributes> = {}

    if (titulo) {
      where.titulo = { [Op.like]: `%${titulo}%` }
    }

    if (status) {
      where.status = status
    }

    if (usuarioId) {
      where.usuarioId = usuarioId
    }

    // Filtro por data - abordagem mais segura
    if (criadoApos && criadoAntes) {
      where.createdAt = {
        [Op.between]: [new Date(criadoApos), new Date(criadoAntes)],
      }
    } else {
      if (criadoApos) {
        where.createdAt = {
          ...(where.createdAt as object),
          [Op.gte]: new Date(criadoApos),
        }
      }

      if (criadoAntes) {
        where.createdAt = {
          ...(where.createdAt as object),
          [Op.lte]: new Date(criadoAntes),
        }
      }
    }

    const options: FindAndCountOptions<TarefaAttributes> = {
      where,
      order: [[ordenarPor, ordenarDirecao]],
      offset,
      limit,
    }

    const { rows: data, count: total } = await Tarefa.findAndCountAll(options)

    return { data, total }
  }

  async create(tarefaData: ICriarTarefaDTO): Promise<Tarefa> {
    // Converter ICriarTarefaDTO para TarefaCreationAttributes
    const dadosCriacao: TarefaCreationAttributes = {
      titulo: tarefaData.titulo,
      descricao: tarefaData.descricao ?? null, // Garantir que seja null se undefined
      status: tarefaData.status ?? 'pendente',
      usuarioId: tarefaData.usuarioId,
    }

    return await this.model.create(dadosCriacao)
  }

  async update(id: number, tarefaData: IAtualizarTarefaDTO): Promise<Tarefa | null> {
    const tarefa = await this.findById(id)

    if (!tarefa) {
      return null
    }

    // Converter IAtualizarTarefaDTO para Partial<TarefaCreationAttributes>
    const dadosAtualizacao: Partial<TarefaCreationAttributes> = {}

    if (tarefaData.titulo !== undefined) {
      dadosAtualizacao.titulo = tarefaData.titulo
    }

    if (tarefaData.descricao !== undefined) {
      dadosAtualizacao.descricao = tarefaData.descricao
    }

    if (tarefaData.status !== undefined) {
      dadosAtualizacao.status = tarefaData.status
    }

    return await tarefa.update(dadosAtualizacao)
  }

  async delete(id: number): Promise<boolean> {
    const result = await Tarefa.destroy({
      where: { id },
    })

    return result > 0
  }
}

// Exporta uma instância padrão para uso normal
export default new TarefaRepository()
