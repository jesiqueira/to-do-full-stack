// src/controllers/interfaces/ITarefaController.ts

import type { Response } from 'express'
import type { IAuthRequest } from '../../middlewares/interfaces/IAuthRequest'

export interface ITarefaController {
  // Todas as rotas exige autenticação
  criarTarefa(req: IAuthRequest, res: Response): Promise<Response>
  listarTarefas(req: IAuthRequest, res: Response): Promise<Response>
  buscarTarefaPorId(req: IAuthRequest, res: Response): Promise<Response>
  atualizarTarefa(req: IAuthRequest, res: Response): Promise<Response>
  deletarTarefa(req: IAuthRequest, res: Response): Promise<Response>
  buscarTarefasDoUsuario(req: IAuthRequest, res: Response): Promise<Response>
  buscarTarefasPorStatus(req: IAuthRequest, res: Response): Promise<Response>
}
