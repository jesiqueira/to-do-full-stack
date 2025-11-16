// src/middlewares/autenticacao.ts

import type { Response, NextFunction } from 'express'
import type { IAuthRequest } from './interfaces/IAuthRequest'
import { verificarToken, extrairTokenDoHeader } from '../utils/jwt'

/**
 * Middleware para verificar e decodificar o Token JWT.
 */
export const autenticar = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Extrair token do header usando o helper
    const token = extrairTokenDoHeader(req.headers.authorization)

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token não fornecido. Acesso negado.',
      })
      return
    }

    // Verificar e decodificar token usando o helper
    const decoded = verificarToken(token)

    // Anexar dados do usuário à requisição
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
    }

    next()
  } catch (error) {
    console.error('Erro na autenticação:', error)
    console.error('Erro na autenticação:', error) // ⬅️ Já existe

    res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado.',
    })
  }
}

export default autenticar
