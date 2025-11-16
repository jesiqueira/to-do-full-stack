// src/__tests__/integration/TarefaController.test.ts

import { Tarefa } from '../../src/database/models/Tarefa'
import { TarefaService } from '../../src/services/TarefaService'
import { TarefaRepository } from '../../src/repositories/TarefaRepository'
import { TarefaController } from '../../src/controllers/TarefaController'
import { criarUsuario } from '../../src/factories/UsuarioFactory'
import { criarTarefa } from '../../src/factories/TarefaFactory'
import { criarMockResponse, criarMockAuthRequest, criarMockRequestSemUsuario } from '../helpers/httpHelpers'

describe('TarefaController - Integration', () => {
  let tarefaController: TarefaController
  let tarefaService: TarefaService
  let tarefaRepository: TarefaRepository

  beforeEach(async () => {
    tarefaRepository = new TarefaRepository(Tarefa)
    tarefaService = new TarefaService(tarefaRepository)
    tarefaController = new TarefaController(tarefaService)
  })

  // --------------------------------------------------------------------
  // ROTAS PÚBLICAS (Nenhuma - todas as rotas de tarefa requerem autenticação)
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // ROTAS PRIVADAS
  // --------------------------------------------------------------------

  describe('criarTarefa', () => {
    test('deve retornar 201 ao criar tarefa com dados válidos', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'João Silva',
        email: 'joao@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        body: {
          titulo: 'Nova Tarefa',
          descricao: 'Descrição da tarefa',
          status: 'pendente',
        },
      })

      const mockRes = criarMockResponse()

      // Act
      await tarefaController.criarTarefa(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Tarefa criada com sucesso',
          data: expect.objectContaining({
            id: expect.any(Number),
            titulo: 'Nova Tarefa',
            descricao: 'Descrição da tarefa',
            status: 'pendente',
            usuarioId: usuario.id,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        }),
      )

      // Verifica no banco
      const tarefaNoBanco = await Tarefa.findOne({ where: { titulo: 'Nova Tarefa' } })
      expect(tarefaNoBanco).toBeDefined()
      expect(tarefaNoBanco?.usuarioId).toBe(usuario.id)
    })

    test('deve usar status padrão quando não informado', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Maria Silva',
        email: 'maria@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        body: {
          titulo: 'Tarefa sem status',
          descricao: 'Descrição',
        },
      })

      const mockRes = criarMockResponse()

      // Act
      await tarefaController.criarTarefa(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(201)
      const responseCall = (mockRes.json as jest.Mock).mock.calls[0][0]
      expect(responseCall.data.status).toBe('pendente') // Status padrão
    })

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      // Arrange
      const mockReq = criarMockRequestSemUsuario({
        body: {
          titulo: 'Nova Tarefa',
          descricao: 'Descrição',
        },
      })

      const mockRes = criarMockResponse()

      // Act
      await tarefaController.criarTarefa(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não autenticado',
      })
    })

    test('deve retornar 400 quando dados são inválidos', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Teste Usuario',
        email: 'teste@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        body: {
          titulo: '', // Título vazio - inválido
          descricao: 'Descrição',
        },
      })

      const mockRes = criarMockResponse()

      // Act
      await tarefaController.criarTarefa(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String),
      })
    })
  })

  describe('listarTarefas', () => {
    test('deve listar tarefas do usuário com sucesso', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Teste',
        email: 'teste@email.com',
        passwordHash: 'senha123',
      })

      await criarTarefa(usuario.id, { titulo: 'Tarefa 1' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa 2' })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email)
      const mockRes = criarMockResponse()

      // Act
      await tarefaController.listarTarefas(mockReq, mockRes)

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        dados: expect.any(Array),
        paginacao: {
          pagina: expect.any(Number),
          limite: expect.any(Number),
          total: 2,
          totalPaginas: expect.any(Number),
        },
      })

      const responseCall = (mockRes.json as jest.Mock).mock.calls[0][0]
      expect(responseCall.success).toBe(true)
      expect(responseCall.dados).toHaveLength(2)
      expect(responseCall.paginacao.total).toBe(2)
    })

    test('deve aplicar filtros na listagem', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Teste',
        email: 'teste@email.com',
        passwordHash: 'senha123',
      })

      await criarTarefa(usuario.id, { titulo: 'Tarefa Importante', status: 'pendente' })
      await criarTarefa(usuario.id, { titulo: 'Outra Tarefa', status: 'concluida' })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        query: {
          status: 'pendente',
          titulo: 'Importante',
        },
      })

      const mockRes = criarMockResponse()

      // Act
      await tarefaController.listarTarefas(mockReq, mockRes)

      // Assert
      const responseCall = (mockRes.json as jest.Mock).mock.calls[0][0]
      expect(responseCall.dados).toHaveLength(1)
      expect(responseCall.dados[0].titulo).toBe('Tarefa Importante')
      expect(responseCall.dados[0].status).toBe('pendente')
    })

    test('deve retornar 401 quando usuário não está autenticado', async () => {
      // Arrange
      const mockReq = criarMockRequestSemUsuario()
      const mockRes = criarMockResponse()

      // Act
      await tarefaController.listarTarefas(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não autenticado',
      })
    })

    test('deve retornar lista vazia quando usuário não tem tarefas', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Sem Tarefas',
        email: 'semtarefas@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email)
      const mockRes = criarMockResponse()

      // Act
      await tarefaController.listarTarefas(mockReq, mockRes)

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
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

  describe('buscarTarefaPorId', () => {
    test('deve buscar tarefa por ID com sucesso', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Teste',
        email: 'teste@email.com',
        passwordHash: 'senha123',
      })

      const tarefa = await criarTarefa(usuario.id, { titulo: 'Tarefa Específica' })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        params: { id: tarefa.id.toString() },
      })

      const mockRes = criarMockResponse()

      // Act
      await tarefaController.buscarTarefaPorId(mockReq, mockRes)

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: tarefa.id,
          titulo: 'Tarefa Específica',
          descricao: expect.any(String),
          status: 'pendente',
          usuarioId: usuario.id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      })
    })

    test('deve retornar 404 quando tarefa não existe', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Teste',
        email: 'teste@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        params: { id: '9999' },
      })

      const mockRes = criarMockResponse()

      // Act
      await tarefaController.buscarTarefaPorId(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tarefa não encontrada',
      })
    })

    test('deve retornar 403 quando usuário não é dono da tarefa', async () => {
      // Arrange
      const usuario1 = await criarUsuario({
        nome: 'Usuario 1',
        email: 'usuario1@email.com',
        passwordHash: 'senha123',
      })

      const usuario2 = await criarUsuario({
        nome: 'Usuario 2',
        email: 'usuario2@email.com',
        passwordHash: 'senha123',
      })

      const tarefa = await criarTarefa(usuario1.id, { titulo: 'Tarefa User 1' })

      const mockReq = criarMockAuthRequest(usuario2.id, usuario2.email, { params: { id: tarefa.id.toString() } })

      const mockRes = criarMockResponse()

      // Act
      await tarefaController.buscarTarefaPorId(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não tem permissão para esta operação',
      })
    })
  })

  describe('atualizarTarefa', () => {
    test('deve atualizar tarefa com dados válidos', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Teste',
        email: 'teste@email.com',
        passwordHash: 'senha123',
      })

      const tarefa = await criarTarefa(usuario.id, {
        titulo: 'Título Original',
        descricao: 'Descrição Original',
        status: 'pendente',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        params: { id: tarefa.id.toString() },
        body: {
          titulo: 'Título Atualizado',
          descricao: 'Descrição Atualizada',
          status: 'concluida',
        },
      })

      const mockRes = criarMockResponse()

      // Act
      await tarefaController.atualizarTarefa(mockReq, mockRes)

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tarefa atualizada com sucesso',
        data: expect.objectContaining({
          id: tarefa.id,
          titulo: 'Título Atualizado',
          descricao: 'Descrição Atualizada',
          status: 'concluida',
          usuarioId: usuario.id,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      })

      // Verifica se foi realmente atualizado no banco
      const tarefaAtualizada = await Tarefa.findByPk(tarefa.id)
      expect(tarefaAtualizada?.titulo).toBe('Título Atualizado')
      expect(tarefaAtualizada?.status).toBe('concluida')
    })
  })

  describe('deletarTarefa', () => {
    test('deve deletar tarefa com sucesso', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Teste',
        email: 'teste@email.com',
        passwordHash: 'senha123',
      })

      const tarefa = await criarTarefa(usuario.id, { titulo: 'Tarefa para Deletar' })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        params: { id: tarefa.id.toString() },
      })

      const mockRes = criarMockResponse()

      // Act
      await tarefaController.deletarTarefa(mockReq, mockRes)

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tarefa deletada com sucesso',
      })

      // Verifica se a tarefa foi realmente deletada
      const tarefaDeletada = await Tarefa.findByPk(tarefa.id)
      expect(tarefaDeletada).toBeNull()
    })
  })

  // Testes adicionais para cobrir cenários específicos
  describe('cenários adicionais', () => {
    test('deve retornar 500 para erro interno não tratado', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Teste',
        email: 'teste@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        body: {
          titulo: 'Tarefa Teste',
          descricao: 'Descrição',
        },
      })

      const mockRes = criarMockResponse()

      // Simula um erro no service
      jest.spyOn(tarefaService, 'criarTarefa').mockRejectedValueOnce(new Error('Erro de conexão'))

      // Act
      await tarefaController.criarTarefa(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erro interno do servidor',
      })
    })
  })
})
