// src/routes/usuario.routes.ts

import { Router } from 'express'
import UsuarioController from '../controllers/UsuarioController'
import UsuarioService from '../services/UsuarioService'
import usuarioRepository from '../repositories/UsuarioRepository'
import { autenticar } from '../middlewares/autenticacao'
import { validarBody } from '../middlewares/validacao'
import { criarUsuarioSchema, loginSchema, atualizarUsuarioSchema } from '../schemas/usuarioSchemas'

const router = Router()

// Inicializar as dependências
const usuarioService = new UsuarioService(usuarioRepository)
const usuarioController = new UsuarioController(usuarioService)

// Rotas Públicas
router.post('/cadastro', validarBody(criarUsuarioSchema), (req, res) => usuarioController.criarUsuario(req, res))
router.post('/login', validarBody(loginSchema), (req, res) => usuarioController.login(req, res))

// Aplica middleware de autenticação para todas as rotas abaixo
router.use(autenticar)

// Rotas Protegidas
router.get('/me', (req, res) => usuarioController.buscarUsuarioLogado(req, res))

router.put('/me', validarBody(atualizarUsuarioSchema), (req, res) => usuarioController.atualizarUsuario(req, res))

router.delete('/me', (req, res) => usuarioController.deletarUsuario(req, res))

export default router
