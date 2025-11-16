// src/__tests__/helpers/httpHelpers.ts
import type { Request, Response } from 'express'
import type { IAuthRequest } from '../../src/middlewares/interfaces/IAuthRequest'

export const criarMockRequest = (overrides?: Partial<Request>): Request =>
  ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  }) as Request

export const criarMockResponse = (): Response => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
  }
  return res as unknown as Response
}

export const criarMockAuthRequest = (usuarioId: number, email: string, overrides?: Partial<Omit<Request, 'usuario'>>): IAuthRequest => {
  const baseRequest = criarMockRequest(overrides)
  return {
    ...baseRequest,
    usuario: { id: usuarioId, email },
  } as IAuthRequest
}

// Helper para criar IAuthRequest SEM usuário (usuario é undefined)
export const criarMockRequestSemUsuario = (overrides?: Partial<Omit<Request, 'usuario'>>): IAuthRequest => {
  const baseRequest = criarMockRequest(overrides)
  const authRequest = {
    ...baseRequest,
    usuario: undefined,
  }
  return authRequest as unknown as IAuthRequest
}
