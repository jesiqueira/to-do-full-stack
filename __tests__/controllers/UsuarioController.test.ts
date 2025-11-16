// src/__tests__/controllers/UsuarioController.test.ts

import type { Response } from 'express'
import { UsuarioController } from '../../src/controllers/UsuarioController'
import { UsuarioService } from '../../src/services/UsuarioService'
import { UsuarioRepository } from '../../src/repositories/UsuarioRepository'
import { Usuario } from '../../src/database/models/Usuario'
import { criarUsuario, criarUsuarioComSenha } from '../../src/factories/UsuarioFactory'
import { criarMockRequest, criarMockResponse, criarMockAuthRequest, criarMockRequestSemUsuario } from '../helpers/httpHelpers'

describe('UsuarioController', () => {
  let usuarioController: UsuarioController
  let usuarioService: UsuarioService
  let usuarioRepository: UsuarioRepository
  let mockResponse: Response

  beforeEach(async () => {
    usuarioRepository = new UsuarioRepository(Usuario)
    usuarioService = new UsuarioService(usuarioRepository)
    usuarioController = new UsuarioController(usuarioService)

    // Mock do Respose usando o Helper
    mockResponse = criarMockResponse()
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: criarUsuario
  // --------------------------------------------------------------------
  describe('criarUsuario', () => {
    test('deve criar usuário com dados válidos e retornar 201', async () => {
      // Arrange
      const mockRequest = criarMockRequest({
        body: {
          nome: 'Novo Usuario',
          email: 'novo@teste.com',
          password: 'senha123',
        },
      })

      // Act
      await usuarioController.criarUsuario(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: expect.any(Number),
        nome: 'Novo Usuario',
        email: 'novo@teste.com',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      // Verifica se o usuário foi realmente criado no banco
      const usuarioCriado = await Usuario.findOne({ where: { email: 'novo@teste.com' } })
      expect(usuarioCriado).toBeDefined()
      expect(usuarioCriado?.nome).toBe('Novo Usuario')
    })

    test('deve retornar 400 quando dados de entrada são inválidos', async () => {
      // Arrange - Preparação
      const mockRequest = criarMockRequest({
        body: {
          nome: '',
          email: 'email-invalido',
          password: '123',
        },
      })

      // Act - Execução
      await usuarioController.criarUsuario(mockRequest, mockResponse)

      // Assert - Verificação
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Dados de entrada inválidos',
        detalhes: expect.any(Array),
      })

      // Verifica que nenhum usuário foi criado
      const usuarios = await Usuario.findAll()
      expect(usuarios).toHaveLength(0)
    })

    test('deve retonar 400 quando email já está em uso', async () => {
      // Arrange
      await criarUsuario({
        nome: 'Usuario Existente',
        email: 'existente@teste.com',
      })

      const mockRequest = criarMockRequest({
        body: {
          nome: 'Novo Usuario',
          email: 'existente@teste.com', // Email já em uso
          password: 'senha123',
        },
      })

      // Act
      await usuarioController.criarUsuario(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email já está em uso por outro usuário',
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: login
  // --------------------------------------------------------------------
  describe('login', () => {
    test('deve fazer login com credenciais válidas e retornar 200', async () => {
      // Arrange
      const usuario = await criarUsuarioComSenha('senha123', {
        nome: 'Usuário Login',
        email: 'login@teste.com',
      })

      const mockRequest = criarMockRequest({
        body: {
          email: 'login@teste.com',
          password: 'senha123',
        },
      })

      // Act
      await usuarioController.login(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0]
      expect(responseCall.usuario).toEqual({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
      expect(responseCall.token).toBeDefined()
      expect(typeof responseCall.token).toBe('string')
    })

    test('deve retornar 401 quando credenciais são inválidas', async () => {
      // Arrage
      await criarUsuarioComSenha('senha123', {
        email: 'usuario@teste.com',
      })

      const mockRequest = criarMockRequest({
        body: {
          email: 'usuario@teste.com',
          password: 'senha_errada', // Senha incorreta
        },
      })

      // Act
      await usuarioController.login(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Credenciais inválidas',
      })
    })

    test('deve retornar 401 quando usuário não existe', async () => {
      // Arrange
      const mockRequest = criarMockRequest({
        body: {
          email: 'naoexiste@teste.com',
          password: 'qualquersenha',
        },
      })

      // Act
      await usuarioController.login(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Credenciais inválidas',
      })
    })

    test('deve retornar 400 quando dados de login são inválidos', async () => {
      // Arrange
      const mockRequest = criarMockRequest({
        body: {
          email: 'email-invalido',
          password: '', // Senha vazia
        },
      })

      // Act
      await usuarioController.login(mockRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Dados de entrada inválidos',
        detalhes: expect.any(Array),
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: buscarUsuarioLogado
  // --------------------------------------------------------------------
  describe('buscarUsuarioLogado', () => {
    test('deve retornar usuário logado com sucesso', async () => {
      // Arrange
      const usuario = await criarUsuario()
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email)

      // Act
      await usuarioController.buscarUsuarioLogado(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      // Arrange
      const mockAuthRequest = criarMockRequestSemUsuario()

      // Act
      await usuarioController.buscarUsuarioLogado(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Usuário não autenticado',
      })
    })

    test('deve retornar 400 qunado usuário não existe mais', async () => {
      // Arrange
      const usuario = await criarUsuario()
      const usuarioId = usuario.id

      // Deleta o usuário para simular que não existe mais
      await usuario.destroy()

      const mockAuthRequest = criarMockAuthRequest(usuarioId, 'inexistente@teste.com')

      // Act
      await usuarioController.buscarUsuarioLogado(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Usuário não encontrado',
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: atualizarUsuario
  // --------------------------------------------------------------------
  describe('atualizarUsuario', () => {
    test('deve atualizar usuário com dados válidos em retornar 200', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Nome Original',
        email: 'original@teste.com',
      })

      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, {
        body: {
          nome: 'Nome Atualizado',
          email: 'atualizado@teste.com',
        },
      })

      // Act
      await usuarioController.atualizarUsuario(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: usuario.id,
        nome: 'Nome Atualizado',
        email: 'atualizado@teste.com',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })

      // Verifica se foi realmente atualizado no banco
      const usuarioAtualizado = await Usuario.findByPk(usuario.id)
      expect(usuarioAtualizado?.nome).toBe('Nome Atualizado')
      expect(usuarioAtualizado?.email).toBe('atualizado@teste.com')
    })

    test('deve atualizar apenas o nome mantendo o email original', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Nome Original',
        email: 'original@teste.com',
      })

      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, {
        body: { nome: 'Apenas Nome Atualizado' },
        // email não é fornecido, deve manter o original
      })

      // Act
      await usuarioController.atualizarUsuario(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: usuario.id,
        nome: 'Apenas Nome Atualizado',
        email: 'original@teste.com', // Manteve o email original
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      // Arrange
      const mockAuthRequest = criarMockRequestSemUsuario({
        body: { nome: 'Novo Nome' },
      })

      // Act
      await usuarioController.atualizarUsuario(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Usuário não autenticado',
      })
    })

    test('deve retornar 400 quando email já está em uso por outro usuário', async () => {
      // Arrange
      const usuario1 = await criarUsuario({ email: 'usuario1@teste.com' })
      await criarUsuario({ email: 'usuario2@teste.com' })

      const mockAuthRequest = criarMockAuthRequest(usuario1.id, usuario1.email, {
        body: { email: 'usuario2@teste.com' }, // Email já em uso por usuario2
      })

      // Act
      await usuarioController.atualizarUsuario(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email já está em uso por outro usuário',
      })
    })

    test('deve retornar 400 quando dados de atualização são inválidos', async () => {
      // Arrange
      const usuario = await criarUsuario()
      const mockAuthRequest = criarMockAuthRequest(
        usuario.id,
        usuario.email,
        { body: { nome: '' } }, // Nome vazio - inválido
      )

      // Act
      await usuarioController.atualizarUsuario(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Dados de entrada inválidos',
        detalhes: expect.any(Array),
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: deletarUsuario
  // --------------------------------------------------------------------
  describe('deletarUsuario', () => {
    test('deve deletar usuário com sucesso e retornar 204', async () => {
      // Arrange
      const usuario = await criarUsuario()
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email)

      // Act
      await usuarioController.deletarUsuario(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(204)
      expect(mockResponse.send).toHaveBeenCalled()

      // Verifica se o usuário foi realmente deletado
      const usuarioDeletado = await Usuario.findByPk(usuario.id)
      expect(usuarioDeletado).toBeNull()
    })

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      // Arrange
      const mockAuthRequest = criarMockRequestSemUsuario()

      // Act
      await usuarioController.deletarUsuario(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Usuário não autorizado',
      })
    })

    test('deve retornar 404 quando usuário não existe', async () => {
      // Arrange
      const usuario = await criarUsuario()
      const usuarioId = usuario.id
      await usuario.destroy() // Deleta o usuário

      const mockAuthRequest = criarMockAuthRequest(usuarioId, 'inexistente@teste.com')

      // Act
      await usuarioController.deletarUsuario(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Usuário não encontrado',
      })
    })
  })
})
