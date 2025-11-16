// src/errors/AppError.ts

/**
 * Classe base para todos os erros da aplicação
 */
export abstract class AppError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name

    // Mantém o stack trace limpo
    Error.captureStackTrace(this, this.constructor)
  }
}
