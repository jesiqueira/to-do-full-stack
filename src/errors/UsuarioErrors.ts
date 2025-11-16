// src/errors/UsuarioErrors.ts

import { AppError } from './AppError'

/**
 * Erro quando usuário não é encontrado
 */
export class UsuarioNaoEncontradoError extends AppError {
  constructor() {
    super('Usuário não encontrado', 404)
  }
}

/**
 * Erro quando email já está em uso
 */
export class EmailEmUsoError extends AppError {
  constructor() {
    super('Email já está em uso por outro usuário', 409) // 409 = Conflict
  }
}

/**
 * Erro quando dados de usuário são inválidos
 */
export class UsuarioDadosInvalidosError extends AppError {
  constructor(mensagem: string) {
    super(mensagem, 400)
  }
}
