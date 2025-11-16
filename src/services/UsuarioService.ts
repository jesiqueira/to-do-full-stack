/**
 * src/services/UsuarioService.ts
 * Service para operacoes de usuário
 */

import type { IUsuarioService } from './interfaces/IUsuarioService'
import type { IUsuarioRepository } from '../repositories/interfaces/IUsuarioRepository'
import type { Usuario } from '../database/models/Usuario'
import type { UsuarioCreationAttributes } from '../database/models/Usuario'
import type { ICriarUsuarioDTO, ILoginDTO } from '../schemas/interfaces/IUsuarioSchemas'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { UsuarioNaoEncontradoError, EmailEmUsoError } from '../errors'

export class UsuarioService implements IUsuarioService {
  private usuarioRepository: IUsuarioRepository

  constructor(usuarioRepository: IUsuarioRepository) {
    this.usuarioRepository = usuarioRepository
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findByEmail(email)
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    return await this.usuarioRepository.findById(id)
  }

  async listarUsuarios(): Promise<Usuario[]> {
    return await this.usuarioRepository.findAll()
  }

  async criarUsuario(usuarioData: ICriarUsuarioDTO): Promise<Usuario> {
    const usuarioExistente = await this.usuarioRepository.findByEmail(usuarioData.email)

    if (usuarioExistente) {
      throw new EmailEmUsoError()
    }

    const senhaCriptografada = await this.criptografarSenha(usuarioData.password)

    // ✅ Converte para o formato do repository
    const usuarioParaCriar: UsuarioCreationAttributes = {
      nome: usuarioData.nome,
      email: usuarioData.email,
      passwordHash: senhaCriptografada, // ✅ Converte password → passwordHash
    }

    return await this.usuarioRepository.create(usuarioParaCriar)
  }

  private async criptografarSenha(senha: string): Promise<string> {
    const saltRounds = 12 // ← Quanto maior, mais seguro (porém mais lento)
    return await bcrypt.hash(senha, saltRounds)
  }

  async login(dados: ILoginDTO): Promise<{ usuario: Usuario; token: string }> {
    const usuario = await this.usuarioRepository.findByEmail(dados.email)

    if (!usuario) {
      throw new Error('Credenciais inválidas')
    }

    try {
      // ✅ CORRIGIDO: Agora usa dados.password (não dados.senha)
      const senhaValida = await this.verificarSenha(dados.password, usuario.passwordHash)

      if (!senhaValida) {
        throw new Error('Credenciais inválidas')
      }

      // Gera token JWT
      const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' })

      return { usuario, token }
    } catch (error) {
      if (error instanceof Error && error.message.includes('verificar senha')) {
        throw new Error('Credenciais inválidas')
      }
      throw error
    }
  }

  private async verificarSenha(senha: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(senha, hash)
    } catch (error) {
      throw new Error(`Erro ao verificar senha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  async atualizarUsuario(id: number, usuarioData: Partial<UsuarioCreationAttributes>): Promise<Usuario> {
    // Verifica se usuário existe
    const usuarioExistente = await this.usuarioRepository.findById(id)
    if (!usuarioExistente) {
      throw new UsuarioNaoEncontradoError()
    }

    // Se estiver tentando atualizar email, verifica se não pertence a outro usuário
    if (usuarioData.email && usuarioData.email !== usuarioExistente.email) {
      const usuarioComEmail = await this.usuarioRepository.findByEmail(usuarioData.email)
      if (usuarioComEmail && usuarioComEmail.id !== id) {
        throw new EmailEmUsoError()
      }
    }

    const usuarioAtualizado = await this.usuarioRepository.update(id, usuarioData)

    if (!usuarioAtualizado) {
      throw new Error('Erro ao atualizar usuário')
    }

    return usuarioAtualizado
  }

  async deletarUsuario(id: number): Promise<boolean> {
    const usuarioExistente = await this.usuarioRepository.findById(id)

    if (!usuarioExistente) {
      throw new UsuarioNaoEncontradoError()
    }

    return await this.usuarioRepository.delete(id)
  }
}

export default UsuarioService
