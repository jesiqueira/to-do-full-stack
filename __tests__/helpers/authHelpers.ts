// src/__tests__/helpers/authHelpers.ts
import jwt from 'jsonwebtoken'

import type { Usuario } from '../../src/database/models/Usuario'
import { criarUsuario } from '../../src/factories/UsuarioFactory'

export const criarUsuarioComToken = async (dados?: Partial<Usuario>): Promise<{ usuario: Usuario; token: string }> => {
  const usuario = await criarUsuario(dados)
  const token = gerarToken(usuario)
  return { usuario, token }
}

function getAppSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente.')
  }
  return secret
}

export const gerarToken = (usuario: Usuario): string => {
  return jwt.sign({ usuarioId: usuario.id, email: usuario.email }, getAppSecret(), { expiresIn: '1h' })
}
