/**
 * src/services/interfaces/IUsuarioService.ts
 * Interface para o UsuarioService
 */

import type { Usuario } from '../../database/models/Usuario'
import type { ICriarUsuarioDTO, ILoginDTO } from '../../schemas/interfaces/IUsuarioSchemas'

export interface IUsuarioService {
  /**
   * Buscar usuario por email
   */
  buscarPorEmail(email: string): Promise<Usuario | null>

  /**
   * Buscar usuário por ID
   */
  buscarPorId(id: number): Promise<Usuario | null>

  /**
   *Listar todos os usuários
   */
  listarUsuarios(): Promise<Usuario[]>

  /**
   * Criar um novo usuário
   */
  criarUsuario(usuarioData: ICriarUsuarioDTO): Promise<Usuario>

  /**
   * Realizar login
   */
  login(dados: ILoginDTO): Promise<{ usuario: Usuario; token: string }>

  /**
   * Atualizar um usuário existente
   */
  atualizarUsuario(id: number, usuarioData: Partial<ICriarUsuarioDTO>): Promise<Usuario>

  /**
   * Deletar um usuário
   */
  deletarUsuario(id: number): Promise<boolean>
}
