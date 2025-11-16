/**
 * src/repositories/UsuarioRepository.ts
 * Implementação concreta do Repository
 */

import { Usuario } from '../database/models/Usuario'
import type { UsuarioCreationAttributes } from '../database/models/Usuario'
import type { IUsuarioRepository } from './interfaces/IUsuarioRepository'
import type { ModelStatic } from 'sequelize'

export class UsuarioRepository implements IUsuarioRepository {
  private model: ModelStatic<Usuario>

  constructor(model: ModelStatic<Usuario> = Usuario) {
    this.model = model
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.model.findOne({
      where: { email },
    })
  }

  async findById(id: number): Promise<Usuario | null> {
    return await this.model.findByPk(id)
  }

  async findAll(): Promise<Usuario[]> {
    return await this.model.findAll()
  }

  async create(usuarioData: UsuarioCreationAttributes): Promise<Usuario> {
    return await this.model.create(usuarioData)
  }

  async update(id: number, usuarioData: Partial<UsuarioCreationAttributes>): Promise<Usuario | null> {
    const usuario = await this.findById(id)

    if (!usuario) {
      return null
    }
    return await usuario.update(usuarioData)
  }

  async delete(id: number): Promise<boolean> {
    const usuario = await this.findById(id)

    if (!usuario) {
      return false
    }

    await usuario.destroy()
    return true
  }
}

export default new UsuarioRepository()
