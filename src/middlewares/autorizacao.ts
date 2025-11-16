// src/middlewares/autorizacao.ts

import type { Response, NextFunction } from 'express'
import type { IAuthRequest } from './interfaces/IAuthRequest'

/**
 * Middleware para verificar se o usuário tem uma role específica
 */
export const requerRole = (roles: string | string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    const rolesArray = Array.isArray(roles) ? roles : [roles]
    const usuarioRole = req.usuario?.role || 'user'

    if (!rolesArray.includes(usuarioRole)) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissões insuficientes.',
      })
      return
    }

    next()
  }
}

/**
 * Middleware para verificar se o usuário é admin
 */
export const requerAdmin = requerRole('admin')

/**
 * Middleware para verificar se o usuário é o proprietário do recurso ou admin
 */
export const requerProprietarioOuAdmin = (paramName: string = 'id') => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    const usuarioId = req.usuario?.id
    const usuarioRole = req.usuario?.role
    const paramValue = req.params[paramName]

    if (!paramValue) {
      res.status(400).json({
        success: false,
        message: `Parâmetro "${paramName}" ausente na rota.`,
      })
      return
    }

    const recursoId = parseInt(paramValue, 10)

    if (usuarioRole === 'admin') {
      return next()
    }

    if (usuarioId === recursoId) {
      return next()
    }

    res.status(403).json({
      success: false,
      message: 'Acesso negado. Você só pode acessar seus próprios recursos.',
    })
  }
}
