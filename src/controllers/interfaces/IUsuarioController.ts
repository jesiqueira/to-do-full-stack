// src/controllers/interfaces/IUsuarioController.ts

import type { Request, Response } from 'express'
import type { IAuthRequest } from '../../middlewares/interfaces/IAuthRequest'

export interface IUsuarioController {
  // Publico (Sem autenticacao)
  criarUsuario(req: Request, res: Response): Promise<Response>
  login(req: Request, res: Response): Promise<Response>

  // Privado (Com autenticação)
  buscarUsuarioLogado(req: IAuthRequest, res: Response): Promise<Response>
  atualizarUsuario(req: IAuthRequest, res: Response): Promise<Response>
  deletarUsuario(req: IAuthRequest, res: Response): Promise<Response>
}
