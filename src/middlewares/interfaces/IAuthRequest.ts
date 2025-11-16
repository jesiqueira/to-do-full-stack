// src/middlewares/interfaces/IAuthRequest.ts
import type { Request } from 'express'

export interface IAuthRequest extends Request {
  usuario?: {
    id: number
    email: string
    role?: string
  }
}
