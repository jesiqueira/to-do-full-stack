// src/utils/jwt.ts

import jwt from 'jsonwebtoken'

export interface TokenPayload {
  id: number
  email: string
  role?: string
  iat?: number
  exp?: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'chave_de_dev_insegura_temporaria'

// Cast mínimo para o tipo esperado por SignOptions.expiresIn
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '7d') as unknown as jwt.SignOptions['expiresIn']

/**
 * Gera um token JWT para o usuário
 */
export const gerarToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  const expiresIn = JWT_EXPIRES_IN || '7d'

  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}
/**
 * Verifica e decodifica um token JWT
 */
export const verificarToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}

/**
 * Extrai o token do header Authorization
 */
// export const extrairTokenDoHeader = (authHeader: string | undefined): string | null => {
//   if (!authHeader) return null

//   const [scheme, token] = authHeader.split(' ')

//   if (scheme !== 'Bearer' || !token) {
//     return null
//   }

//   return token
// }
export const extrairTokenDoHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null

  // Usar regex para dividir por um ou mais espaços
  const parts = authHeader.trim().split(/\s+/)

  if (parts.length < 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return null
  }

  return parts[1]
}
