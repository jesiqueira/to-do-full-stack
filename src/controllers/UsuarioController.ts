// src/controllers/UsuarioController.ts

import type { Request, Response } from 'express'
import type { IAuthRequest } from '../middlewares/interfaces/IAuthRequest'
import type { IUsuarioController } from './interfaces/IUsuarioController'
import type UsuarioService from '../services/UsuarioService'
import { atualizarUsuarioSchema, criarUsuarioSchema, loginSchema } from '../schemas/usuarioSchemas'
import { EmailEmUsoError, UsuarioNaoEncontradoError } from '../errors'
import { z } from 'zod'
import type { UsuarioCreationAttributes } from '../database/models/Usuario'

export class UsuarioController implements IUsuarioController {
  constructor(private usuarioService: UsuarioService) {}

  async criarUsuario(req: Request, res: Response): Promise<Response> {
    try {
      // valida os dados de entrada

      const dadosUsuario = criarUsuarioSchema.parse(req.body)

      // Cria o usuário
      const usuario = await this.usuarioService.criarUsuario(dadosUsuario)

      // Retorna resposta sem passwordHash
      return res.status(201).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      })
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const dadosLogin = loginSchema.parse(req.body)

      const resultado = await this.usuarioService.login(dadosLogin)

      return res.status(200).json({
        usuario: {
          id: resultado.usuario.id,
          nome: resultado.usuario.nome,
          email: resultado.usuario.email,
          createdAt: resultado.usuario.createdAt,
          updatedAt: resultado.usuario.updatedAt,
        },
        token: resultado.token,
      })
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  async buscarUsuarioLogado(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const usuario = await this.usuarioService.buscarPorId(usuarioId)

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      return res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      })
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  async atualizarUsuario(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const dadosAtualizacao = atualizarUsuarioSchema.parse(req.body)

      // CORREÇÃO: Converter IAtualizarUsuarioDTO para Partial<UsuarioCreationAttributes>
      const dadosParaService: Partial<UsuarioCreationAttributes> = {}
      if (dadosAtualizacao.nome !== undefined) {
        dadosParaService.nome = dadosAtualizacao.nome
      }

      if (dadosAtualizacao.email !== undefined) {
        dadosParaService.email = dadosAtualizacao.email
      }

      const usuarioAtualizado = await this.usuarioService.atualizarUsuario(usuarioId, dadosParaService)

      return res.status(200).json({
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        createdAt: usuarioAtualizado.createdAt,
        updatedAt: usuarioAtualizado.updatedAt,
      })
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  async deletarUsuario(req: IAuthRequest, res: Response): Promise<Response> {
    try {
      const usuarioId = req.usuario?.id

      if (!usuarioId) {
        return res.status(401).json({ error: 'Usuário não autorizado' })
      }
      await this.usuarioService.deletarUsuario(usuarioId)

      return res.status(204).send()
    } catch (error) {
      return this.handleError(error, res)
    }
  }

  private handleError(error: unknown, res: Response): Response {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados de entrada inválidos',
        detalhes: error.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensagem: issue.message,
        })),
      })
    }

    // Erros personalizados do Service
    if (error instanceof EmailEmUsoError) {
      return res.status(400).json({ error: error.message })
    }

    if (error instanceof UsuarioNaoEncontradoError) {
      return res.status(404).json({ error: error.message })
    }

    // Erro de autenticação (login)
    if (error instanceof Error && error.message.includes('Credenciais inválidas')) {
      return res.status(401).json({ error: error.message })
    }

    // Erro interno
    // console.error('Erro no UsuarioController:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export default UsuarioController
