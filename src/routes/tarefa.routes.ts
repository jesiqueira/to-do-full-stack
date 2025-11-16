// src/routes/tarefaRoutes.ts

import { Router } from 'express'
import TarefaController from '../controllers/TarefaController'
import TarefaService from '../services/TarefaService'
import tarefaRepository from '../repositories/TarefaRepository'
import { autenticar } from '../middlewares/autenticacao'
import { validarBody, validarParams, validarQuery } from '../middlewares/validacao'
import { criarTarefaSchema, atualizarTarefaSchema, parametrosTarefaSchema, filtroTarefaSchema } from '../schemas/tarefaSchemas'

const router = Router()

// Inicializa as dependências
const tarefaService = new TarefaService(tarefaRepository)
const tarefaController = new TarefaController(tarefaService)

// ⬇️ TODAS as rotas de tarefa requerem autenticação
router.use(autenticar)

// --------------------------------------------------------------------
// ROTAS CRUD BÁSICAS
// --------------------------------------------------------------------

// Listar tarefas com filtros (GET /api/tarefas)
router.get('/', validarQuery(filtroTarefaSchema), (req, res) => tarefaController.listarTarefas(req, res))

// Buscar tarefa por ID (GET /api/tarefas/:id)
router.get('/:id', validarParams(parametrosTarefaSchema), (req, res) => tarefaController.buscarTarefaPorId(req, res))

// Criar nova tarefa (POST /api/tarefas)
router.post('/', validarBody(criarTarefaSchema), (req, res) => tarefaController.criarTarefa(req, res))

// Atualizar tarefa (PUT /api/tarefas/:id)
router.put('/:id', validarParams(parametrosTarefaSchema), validarBody(atualizarTarefaSchema), (req, res) =>
  tarefaController.atualizarTarefa(req, res),
)

// Deletar tarefa (DELETE /api/tarefas/:id)
router.delete('/:id', validarParams(parametrosTarefaSchema), (req, res) => tarefaController.deletarTarefa(req, res))

// --------------------------------------------------------------------
// ROTAS ESPECÍFICAS
// --------------------------------------------------------------------

// Buscar tarefas por status (GET /api/tarefas/status/:status)
router.get('/status/:status', (req, res) => tarefaController.buscarTarefasPorStatus(req, res))

// Buscar tarefas de um usuário específico (GET /api/tarefas/usuario/:usuarioId)
router.get('/usuario/:usuarioId', (req, res) => tarefaController.buscarTarefasDoUsuario(req, res))

// --------------------------------------------------------------------
// ROTAS DE STATUS (OPCIONAIS)
// --------------------------------------------------------------------

// Marcar tarefa como concluída (PATCH /api/tarefas/:id/concluir)
router.patch('/:id/concluir', validarParams(parametrosTarefaSchema), (req, res) => {
  // Usa o método de atualização existente
  req.body = { status: 'concluida' }
  return tarefaController.atualizarTarefa(req, res)
})

// Marcar tarefa como pendente (PATCH /api/tarefas/:id/pendente)
router.patch('/:id/pendente', validarParams(parametrosTarefaSchema), (req, res) => {
  req.body = { status: 'pendente' }
  return tarefaController.atualizarTarefa(req, res)
})

export default router
