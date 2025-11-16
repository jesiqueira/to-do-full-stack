/**
 * src/repositories/interfaces/IUsuarioRepository.ts
 * Interface define o CONTRATO que o Repository deve seguir
 */
import type { Usuario } from '../../database/models/Usuario'
import type { UsuarioCreationAttributes } from '../../database/models/Usuario'

export interface IUsuarioRepository {
  /**
   * Busca um usuário pelo email
   * @param email - Email do usuário
   * @returns Promise<Usuario | null> - Usuário encontrado ou null
   */
  findByEmail(email: string): Promise<Usuario | null>

  /**
   * Busca um usuário pelo ID
   * @param id - ID do usuário
   * @returns Promise<Usuario | null> - Usuário encontrado ou null
   */
  findById(id: number): Promise<Usuario | null>

  /**
   * Lista todos os usuários
   * @returns Promise<Usuario[]> - Array de usuários
   */
  findAll(): Promise<Usuario[]>

  /**
   * Cria um novo usuário
   * @param usuarioData - Dados para criação do usuário
   * @returns Promise<Usuario> - Usuário criado
   */
  create(usuarioData: UsuarioCreationAttributes): Promise<Usuario>

  /**
   * Atualiza um usuário existente
   * @param id - ID do usuário
   * @param usuarioData - Dados parciais para atualização
   * @returns Promise<Usuario | null> - Usuário atualizado ou null se não encontrado
   */
  update(id: number, usuarioData: Partial<UsuarioCreationAttributes>): Promise<Usuario | null>

  /**
   * Deleta um usuário
   * @param id - ID do usuário
   * @returns Promise<boolean> - true se deletado, false se não encontrado
   */
  delete(id: number): Promise<boolean>
}
