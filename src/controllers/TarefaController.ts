// src/controllers/TarefaController.ts
import type { Response } from 'express'
import type { TarefaService } from '../services/TarefaService'
import type { ITarefaController } from './interfaces/ITarefaController'
import type { IAuthRequest } from '../middlewares/interfaces/IAuthRequest'
import { TarefaNaoEncontradaError, UsuarioSemPermissaoError, TarefaDadosInvalidosError } from '../errors'
import type { StatusTarefa, IFiltroTarefaDTO } from '../schemas/interfaces/ITarefaSchemas'

export class TarefaController implements ITarefaController {
  private tarefaService: TarefaService

  constructor(tarefaService: TarefaService) {
    this.tarefaService = tarefaService
  }

  async criarTarefa(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        })
      }

      const dadosTarefa = {
        ...req.body,
        usuarioId: usuarioId,
      }

      const novaTarefa = await this.tarefaService.criarTarefa(dadosTarefa)

      return res.status(201).json({
        success: true,
        message: 'Tarefa criada com sucesso',
        data: novaTarefa,
      })
    } catch (error) {
      if (error instanceof TarefaDadosInvalidosError) {
        return res.status(400).json({
          success: false,
          message: error.message,
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  async listarTarefas(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        })
      }

      // Construir filtros de forma tipada
      const filtros = this.construirFiltros(req)
      const resultado = await this.tarefaService.listarTarefas(filtros)

      return res.json({
        success: true,
        ...resultado,
      })
    } catch (error) {
      if (error instanceof TarefaDadosInvalidosError) {
        return res.status(400).json({
          success: false,
          message: error.message,
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  async buscarTarefaPorId(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        })
      }

      const tarefa = await this.tarefaService.buscarPorId(Number(id))

      if (!tarefa) {
        throw new TarefaNaoEncontradaError()
      }

      if (tarefa.usuarioId !== usuarioId) {
        throw new UsuarioSemPermissaoError()
      }

      return res.json({
        success: true,
        data: tarefa,
      })
    } catch (error) {
      if (error instanceof TarefaNaoEncontradaError) {
        return res.status(404).json({
          success: false,
          message: error.message,
        })
      }

      if (error instanceof UsuarioSemPermissaoError) {
        return res.status(403).json({
          success: false,
          message: error.message,
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  async atualizarTarefa(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        })
      }

      const tarefaExistente = await this.tarefaService.buscarPorId(Number(id))

      if (!tarefaExistente) {
        throw new TarefaNaoEncontradaError()
      }

      if (tarefaExistente.usuarioId !== usuarioId) {
        throw new UsuarioSemPermissaoError()
      }

      const tarefaAtualizada = await this.tarefaService.atualizarTarefa(Number(id), req.body)

      return res.json({
        success: true,
        message: 'Tarefa atualizada com sucesso',
        data: tarefaAtualizada,
      })
    } catch (error) {
      if (error instanceof TarefaNaoEncontradaError) {
        return res.status(404).json({
          success: false,
          message: error.message,
        })
      }

      if (error instanceof UsuarioSemPermissaoError) {
        return res.status(403).json({
          success: false,
          message: error.message,
        })
      }

      if (error instanceof TarefaDadosInvalidosError) {
        return res.status(400).json({
          success: false,
          message: error.message,
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  async deletarTarefa(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        })
      }

      const tarefaExistente = await this.tarefaService.buscarPorId(Number(id))

      if (!tarefaExistente) {
        throw new TarefaNaoEncontradaError()
      }

      if (tarefaExistente.usuarioId !== usuarioId) {
        throw new UsuarioSemPermissaoError()
      }

      await this.tarefaService.deletarTarefa(Number(id))

      return res.json({
        success: true,
        message: 'Tarefa deletada com sucesso',
      })
    } catch (error) {
      if (error instanceof TarefaNaoEncontradaError) {
        return res.status(404).json({
          success: false,
          message: error.message,
        })
      }

      if (error instanceof UsuarioSemPermissaoError) {
        return res.status(403).json({
          success: false,
          message: error.message,
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  async buscarTarefasDoUsuario(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const { usuarioId } = req.params
      const usuarioAutenticadoId = req.usuario?.id

      if (!usuarioAutenticadoId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        })
      }

      if (Number(usuarioId) !== usuarioAutenticadoId) {
        throw new UsuarioSemPermissaoError()
      }

      const tarefas = await this.tarefaService.buscarPorUsuarioId(Number(usuarioId))

      return res.json({
        success: true,
        data: tarefas,
        count: tarefas.length,
      })
    } catch (error) {
      if (error instanceof UsuarioSemPermissaoError) {
        return res.status(403).json({
          success: false,
          message: error.message,
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  async buscarTarefasPorStatus(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const { status } = req.params
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        })
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro "status" é obrigatório',
        })
      }

      // Validar e converter o status
      const statusValidado = this.validarStatus(status)

      // Usar listarTarefas com filtro de status
      const resultado = await this.tarefaService.listarTarefas({
        usuarioId: usuarioId,
        status: statusValidado,
        page: 1,
        limit: 100,
      })

      return res.json({
        success: true,
        ...resultado,
      })
    } catch (error) {
      if (error instanceof TarefaDadosInvalidosError) {
        return res.status(400).json({
          success: false,
          message: error.message,
        })
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Construir filtros de forma completamente tipada
   */
  private construirFiltros(req: IAuthRequest): IFiltroTarefaDTO {
    const usuarioId = req.usuario?.id

    if (!usuarioId) {
      throw new TarefaDadosInvalidosError('Usuário não autenticado')
    }

    const filtros: IFiltroTarefaDTO = {
      usuarioId: usuarioId,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 25,
    }

    // Adicionar campos opcionais com validação de tipo
    this.adicionarCampoOpcional(filtros, 'titulo', req.query.titulo)
    this.adicionarCampoOpcional(filtros, 'status', req.query.status, this.validarStatus.bind(this))
    this.adicionarCampoOpcional(filtros, 'criadoApos', req.query.criadoApos)
    this.adicionarCampoOpcional(filtros, 'criadoAntes', req.query.criadoAntes)
    this.adicionarCampoOpcional(filtros, 'ordenarPor', req.query.ordenarPor, this.validarOrdenarPor.bind(this))
    this.adicionarCampoOpcional(filtros, 'ordenarDirecao', req.query.ordenarDirecao, this.validarOrdenarDirecao.bind(this))

    return filtros
  }

  /**
   * Adicionar campo opcional com validação de tipo
   */
  private adicionarCampoOpcional<K extends keyof IFiltroTarefaDTO>(
    filtros: IFiltroTarefaDTO,
    campo: K,
    valor: unknown,
    validador?: (v: string) => IFiltroTarefaDTO[K],
  ): void {
    if (valor && typeof valor === 'string' && valor.trim() !== '') {
      if (validador) {
        filtros[campo] = validador(valor)
      } else {
        // Para campos que não precisam de validação especial
        filtros[campo] = valor as IFiltroTarefaDTO[K]
      }
    }
  }

  /**
   * Valida e converte string para StatusTarefa
   */
  private validarStatus(status: string): StatusTarefa {
    const statuses: StatusTarefa[] = ['pendente', 'em_andamento', 'concluida']
    const statusLower = status.toLowerCase()

    if (!statuses.includes(statusLower as StatusTarefa)) {
      throw new TarefaDadosInvalidosError(`Status inválido: ${status}. Status válidos: ${statuses.join(', ')}`)
    }

    return statusLower as StatusTarefa
  }

  /**
   * Valida campo ordenarPor
   */
  private validarOrdenarPor(ordenarPor: string): IFiltroTarefaDTO['ordenarPor'] {
    const valoresValidos = ['id', 'titulo', 'status', 'createdAt', 'updatedAt'] as const

    if (!valoresValidos.includes(ordenarPor as (typeof valoresValidos)[number])) {
      throw new TarefaDadosInvalidosError(`Valor inválido para ordenarPor: ${ordenarPor}. Valores válidos: ${valoresValidos.join(', ')}`)
    }

    return ordenarPor as IFiltroTarefaDTO['ordenarPor']
  }

  /**
   * Valida campo ordenarDirecao
   */
  private validarOrdenarDirecao(ordenarDirecao: string): IFiltroTarefaDTO['ordenarDirecao'] {
    if (ordenarDirecao !== 'ASC' && ordenarDirecao !== 'DESC') {
      throw new TarefaDadosInvalidosError(`Valor inválido para ordenarDirecao: ${ordenarDirecao}. Valores válidos: ASC, DESC`)
    }

    return ordenarDirecao
  }
}

export default TarefaController
