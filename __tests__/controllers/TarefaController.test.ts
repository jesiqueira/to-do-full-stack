// __tests__ / controllers / TarefaController.test.ts

import type { Response } from 'express'
import { TarefaController } from '../../src/controllers/TarefaController'
import { TarefaService } from '../../src/services/TarefaService'
import { TarefaRepository } from '../../src/repositories/TarefaRepository'
import { Tarefa } from '../../src/database/models/Tarefa'
import { criarUsuario } from '../../src/factories/UsuarioFactory'
import { criarTarefa } from '../../src/factories/TarefaFactory'
import { criarMockResponse, criarMockAuthRequest, criarMockRequestSemUsuario } from '../helpers/httpHelpers'
import { criarUsuarioComToken } from '../helpers/authHelpers'

describe('TarefaController', () => {
  let tarefaController: TarefaController
  let tarefaService: TarefaService
  let tarefaRepository: TarefaRepository
  let mockResponse: Response

  beforeEach(async () => {
    tarefaRepository = new TarefaRepository(Tarefa)
    tarefaService = new TarefaService(tarefaRepository)
    tarefaController = new TarefaController(tarefaService)

    // Mock do Response usando o helper
    mockResponse = criarMockResponse()
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: criarTarefa
  // --------------------------------------------------------------------
  describe('criarTarefa', () => {
    test('deve criar tarefa com dados válidos e retornar 201', async () => {
      // Arrange - Usando o helper com token
      const { usuario } = await criarUsuarioComToken()
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, {
        body: {
          titulo: 'Nova Tarefa',
          descricao: 'Descrição da tarefa',
          status: 'pendente',
        },
      })

      // Act
      await tarefaController.criarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tarefa criada com sucesso',
        data: {
          id: expect.any(Number),
          titulo: 'Nova Tarefa',
          descricao: 'Descrição da tarefa',
          status: 'pendente',
          usuarioId: usuario.id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      })

      // Verifica se a tarefa foi realmente criada no banco
      const tarefaCriada = await Tarefa.findOne({ where: { titulo: 'Nova Tarefa' } })
      expect(tarefaCriada).toBeDefined()
      expect(tarefaCriada?.usuarioId).toBe(usuario.id)
    })

    test('deve usar status padrão quando não informado', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, {
        body: {
          titulo: 'Tarefa sem status',
          descricao: 'Descrição',
        },
      })

      // Act
      await tarefaController.criarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201)
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0]
      expect(responseCall.data.status).toBe('pendente') // Status padrão
    })

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      // Arrange
      const mockAuthRequest = criarMockRequestSemUsuario({
        body: {
          titulo: 'Nova Tarefa',
          descricao: 'Descrição',
        },
      })

      // Act
      await tarefaController.criarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não autenticado',
      })
    })

    test('deve retornar 400 quando dados são inválidos', async () => {
      // Arrange
      const usuario = await criarUsuario()
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, {
        body: {
          titulo: '', // Título vazio - inválido
          descricao: 'Descrição',
        },
      })

      // Act
      await tarefaController.criarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: listarTarefas
  // --------------------------------------------------------------------
  describe('listarTarefas', () => {
    test('deve listar tarefas do usuário com sucesso', async () => {
      // Arrange - Usando o helper com token
      const { usuario } = await criarUsuarioComToken()
      await criarTarefa(usuario.id, { titulo: 'Tarefa 1' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa 2' })

      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email)

      // Act
      await tarefaController.listarTarefas(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        dados: expect.any(Array),
        paginacao: {
          pagina: expect.any(Number),
          limite: expect.any(Number),
          total: 2,
          totalPaginas: expect.any(Number),
        },
      })

      // Verifica o conteúdo da resposta
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0]
      expect(responseCall.success).toBe(true)
      expect(responseCall.dados).toHaveLength(2)
      expect(responseCall.paginacao.total).toBe(2)

      // Verifica que status NÃO foi chamado (comportamento padrão é 200)
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    test('deve aplicar filtros na listagem', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      await criarTarefa(usuario.id, { titulo: 'Tarefa Importante', status: 'pendente' })
      await criarTarefa(usuario.id, { titulo: 'Outra Tarefa', status: 'concluida' })

      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, {
        query: {
          status: 'pendente',
          titulo: 'Importante',
        },
      })

      // Act
      await tarefaController.listarTarefas(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        dados: expect.any(Array),
        paginacao: expect.any(Object),
      })
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0]
      expect(responseCall.dados).toHaveLength(1)
      expect(responseCall.dados[0].titulo).toBe('Tarefa Importante')
      expect(responseCall.dados[0].status).toBe('pendente')

      // Verifica que status NÃO foi chamado
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      // Arrange
      const mockAuthRequest = criarMockRequestSemUsuario()

      // Act
      await tarefaController.listarTarefas(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não autenticado',
      })
    })

    test('deve retornar lista vazia quando usuário não tem tarefas', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email)

      // Act
      await tarefaController.listarTarefas(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        dados: [],
        paginacao: {
          pagina: 1,
          limite: 25,
          total: 0,
          totalPaginas: 0,
        },
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: buscarTarefaPorId
  // --------------------------------------------------------------------
  describe('buscarTarefaPorId', () => {
    test('deve buscar tarefa por ID com sucesso', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      const tarefa = await criarTarefa(usuario.id, { titulo: 'Tarefa Específica' })

      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, { params: { id: tarefa.id.toString() } })

      // Act
      await tarefaController.buscarTarefaPorId(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: tarefa.id,
          titulo: 'Tarefa Específica',
          descricao: expect.any(String),
          status: 'pendente',
          usuarioId: usuario.id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      })

      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    test('deve retornar 404 quando tarefa não existe', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, { params: { id: '9999' } })

      // Act
      await tarefaController.buscarTarefaPorId(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tarefa não encontrada',
      })
    })

    test('deve retornar 403 quando usuário não é dono da tarefa', async () => {
      // Arrange
      const { usuario: usuario1 } = await criarUsuarioComToken()
      const { usuario: usuario2 } = await criarUsuarioComToken()
      const tarefa = await criarTarefa(usuario1.id, { titulo: 'Tarefa User 1' })

      const mockAuthRequest = criarMockAuthRequest(
        usuario2.id, // Usuário diferente do dono
        usuario2.email,
        { params: { id: tarefa.id.toString() } },
      )

      // Act
      await tarefaController.buscarTarefaPorId(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não tem permissão para esta operação',
      })
    })

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      // Arrange
      const mockAuthRequest = criarMockRequestSemUsuario({
        params: { id: '1' },
      })

      // Act
      await tarefaController.buscarTarefaPorId(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não autenticado',
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: atualizarTarefa
  // --------------------------------------------------------------------
  describe('atualizarTarefa', () => {
    test('deve atualizar tarefa com dados válidos', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      const tarefa = await criarTarefa(usuario.id, {
        titulo: 'Título Original',
        descricao: 'Descrição Original',
        status: 'pendente',
      })

      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, {
        params: { id: tarefa.id.toString() },
        body: {
          titulo: 'Título Atualizado',
          descricao: 'Descrição Atualizada',
          status: 'concluida',
        },
      })

      // Act
      await tarefaController.atualizarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tarefa atualizada com sucesso',
        data: {
          id: tarefa.id,
          titulo: 'Título Atualizado',
          descricao: 'Descrição Atualizada',
          status: 'concluida',
          usuarioId: usuario.id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      })

      expect(mockResponse.status).not.toHaveBeenCalled()

      // Verifica se foi realmente atualizado no banco
      const tarefaAtualizada = await Tarefa.findByPk(tarefa.id)
      expect(tarefaAtualizada?.titulo).toBe('Título Atualizado')
      expect(tarefaAtualizada?.status).toBe('concluida')
    })

    test('deve retornar 404 quando tarefa não existe', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, {
        params: { id: '9999' },
        body: { titulo: 'Novo Título' },
      })

      // Act
      await tarefaController.atualizarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tarefa não encontrada',
      })
    })

    test('deve retornar 403 quando usuário não é dono da tarefa', async () => {
      // Arrange
      const { usuario: usuario1 } = await criarUsuarioComToken()
      const { usuario: usuario2 } = await criarUsuarioComToken()
      const tarefa = await criarTarefa(usuario1.id)

      const mockAuthRequest = criarMockAuthRequest(usuario2.id, usuario2.email, {
        params: { id: tarefa.id.toString() },
        body: { titulo: 'Novo Título' },
      })

      // Act
      await tarefaController.atualizarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não tem permissão para esta operação',
      })
    })

    test('deve retornar 400 quando dados de atualização são inválidos', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      const tarefa = await criarTarefa(usuario.id)
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, {
        params: { id: tarefa.id.toString() },
        body: { titulo: '' }, // Título vazio - inválido
      })

      // Act
      await tarefaController.atualizarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: deletarTarefa
  // --------------------------------------------------------------------
  describe('deletarTarefa', () => {
    test('deve deletar tarefa com sucesso', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      const tarefa = await criarTarefa(usuario.id, { titulo: 'Tarefa para Deletar' })

      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, { params: { id: tarefa.id.toString() } })

      // Act
      await tarefaController.deletarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tarefa deletada com sucesso',
      })

      expect(mockResponse.status).not.toHaveBeenCalled()

      // Verifica se a tarefa foi realmente deletada
      const tarefaDeletada = await Tarefa.findByPk(tarefa.id)
      expect(tarefaDeletada).toBeNull()
    })

    test('deve retornar 404 quando tarefa não existe', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, { params: { id: '9999' } })

      // Act
      await tarefaController.deletarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tarefa não encontrada',
      })
    })

    test('deve retornar 403 quando usuário não é dono da tarefa', async () => {
      // Arrange
      const { usuario: usuario1 } = await criarUsuarioComToken()
      const { usuario: usuario2 } = await criarUsuarioComToken()
      const tarefa = await criarTarefa(usuario1.id)

      const mockAuthRequest = criarMockAuthRequest(usuario2.id, usuario2.email, { params: { id: tarefa.id.toString() } })

      // Act
      await tarefaController.deletarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não tem permissão para esta operação',
      })
    })

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      // Arrange
      const mockAuthRequest = criarMockRequestSemUsuario({
        params: { id: '1' },
      })

      // Act
      await tarefaController.deletarTarefa(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não autenticado',
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: buscarTarefasDoUsuario
  // --------------------------------------------------------------------
  describe('buscarTarefasDoUsuario', () => {
    test('deve buscar tarefas do usuário específico', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      await criarTarefa(usuario.id, { titulo: 'Tarefa 1' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa 2' })

      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, { params: { usuarioId: usuario.id.toString() } })

      // Act
      await tarefaController.buscarTarefasDoUsuario(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array),
        count: 2,
      })

      expect(mockResponse.status).not.toHaveBeenCalled()

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0]
      expect(responseCall.data).toHaveLength(2)
    })

    test('deve retornar 403 quando usuário tenta acessar tarefas de outro usuário', async () => {
      // Arrange
      const { usuario: usuario1 } = await criarUsuarioComToken()
      const { usuario: usuario2 } = await criarUsuarioComToken()

      const mockAuthRequest = criarMockAuthRequest(
        usuario1.id,
        usuario1.email,
        { params: { usuarioId: usuario2.id.toString() } }, // Tentando acessar tarefas de outro usuário
      )

      // Act
      await tarefaController.buscarTarefasDoUsuario(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não tem permissão para esta operação',
      })
    })

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      // Arrange
      const mockAuthRequest = criarMockRequestSemUsuario({
        params: { usuarioId: '1' },
      })

      // Act
      await tarefaController.buscarTarefasDoUsuario(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não autenticado',
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: buscarTarefasPorStatus
  // --------------------------------------------------------------------
  describe('buscarTarefasPorStatus', () => {
    test('deve buscar tarefas por status com sucesso', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      await criarTarefa(usuario.id, { titulo: 'Tarefa Pendente', status: 'pendente' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa Concluída', status: 'concluida' })

      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, { params: { status: 'pendente' } })

      // Act
      await tarefaController.buscarTarefasPorStatus(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        dados: expect.any(Array),
        paginacao: expect.any(Object),
      })

      expect(mockResponse.status).not.toHaveBeenCalled()

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0]
      expect(responseCall.dados).toHaveLength(1)
      expect(responseCall.dados[0].status).toBe('pendente')
      expect(responseCall.dados[0].titulo).toBe('Tarefa Pendente')
    })

    test('deve retornar 400 quando status é inválido', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, { params: { status: 'status_invalido' } })

      // Act
      await tarefaController.buscarTarefasPorStatus(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Status inválido'),
      })
    })

    test('deve retornar 400 quando status não é fornecido', async () => {
      // Arrange
      const { usuario } = await criarUsuarioComToken()
      const mockAuthRequest = criarMockAuthRequest(usuario.id, usuario.email, { params: { status: '' } })

      // Act
      await tarefaController.buscarTarefasPorStatus(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Parâmetro "status" é obrigatório',
      })
    })

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      // Arrange
      const mockAuthRequest = criarMockRequestSemUsuario({
        params: { status: 'pendente' },
      })

      // Act
      await tarefaController.buscarTarefasPorStatus(mockAuthRequest, mockResponse)

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não autenticado',
      })
    })
  })
})
