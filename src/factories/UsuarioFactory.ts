// src/factories/UsuarioFactory.ts

import { Usuario } from '../database/models/Usuario'
import type { UsuarioCreationAttributes } from '../database/models/Usuario'
import bcrypt from 'bcryptjs'

export const criarUsuario = async (overrides?: Partial<UsuarioCreationAttributes>): Promise<Usuario> => {
  const timestamp = Date.now()
  const randomSuffix = Math.floor(Math.random() * 10000)

  return await Usuario.create({
    nome: 'Usuario Teste',
    email: `usuario${timestamp}${randomSuffix}@email.com`, // Email mais único
    passwordHash: 'hash_segura',
    ...overrides,
  })
}

export const criarUsuarioComSenha = async (senha: string, overrides?: Partial<UsuarioCreationAttributes>): Promise<Usuario> => {
  const senhaHash = await bcrypt.hash(senha, 12)

  return await Usuario.create({
    nome: 'Usuario Teste',
    email: `usuario${Date.now()}@email.com`,
    passwordHash: senhaHash,
    ...overrides,
  })
}
