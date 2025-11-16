// src/middlewares/validacao.ts
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export const validarBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body)
      next()
    } catch (error) {
      handleValidationError(error, res)
    }
  }
}

export const validarQuery = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.query)
      next()
    } catch (error) {
      handleValidationError(error, res)
    }
  }
}

export const validarParams = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync(req.params)
      next()
    } catch (error) {
      handleValidationError(error, res)
    }
  }
}

const handleValidationError = (error: unknown, res: Response): void => {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: 'Dados de entrada inválidos',
      detalhes: error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensagem: issue.message,
        codigo: issue.code,
      })),
    })
    return
  }
  console.error('Erro na validação:', error)
  res.status(500).json({ error: 'Erro interno na validação' })
}
