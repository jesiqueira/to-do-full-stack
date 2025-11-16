// src/errors/TarefaErros.ts

import { AppError } from './AppError'

export class TarefaNaoEncontradaError extends AppError {
  constructor() {
    super('Tarefa não encontrada')
    this.name = 'TarefaNaoEncontradaError'
  }
}

export class UsuarioSemPermissaoError extends AppError {
  constructor() {
    super('Usuário não tem permissão para esta operação')
    this.name = 'UsuarioSemPermissaoError'
  }
}

export class TarefaDadosInvalidosError extends AppError {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = 'TarefaDadosInvalidosError'
  }
}
