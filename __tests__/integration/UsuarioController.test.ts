// src/__tests__/integration/UsuarioController.test.ts
import { Usuario } from '../../src/database/models/Usuario'
import { UsuarioService } from '../../src/services/UsuarioService'
import { UsuarioRepository } from '../../src/repositories/UsuarioRepository'
import { UsuarioController } from '../../src/controllers/UsuarioController'
import type { IUsuarioController } from '../../src/controllers/interfaces/IUsuarioController'
import { criarUsuario, criarUsuarioComSenha } from '../../src/factories/UsuarioFactory'
import { criarMockRequest, criarMockResponse, criarMockAuthRequest, criarMockRequestSemUsuario } from '../helpers/httpHelpers'
import type { IAuthRequest } from '../../src/middlewares/interfaces/IAuthRequest'

describe('UsuarioController', () => {
  let usuarioController: IUsuarioController
  let usuarioService: UsuarioService
  let usuarioRepository: UsuarioRepository

  beforeEach(async () => {
    await Usuario.destroy({ where: {} })

    usuarioRepository = new UsuarioRepository(Usuario)
    usuarioService = new UsuarioService(usuarioRepository)
    usuarioController = new UsuarioController(usuarioService)
  })

  afterAll(async () => {
    await Usuario.destroy({ where: {} })
  })

  // --------------------------------------------------------------------
  // ROTAS PÚBLICAS
  // --------------------------------------------------------------------

  describe('criarUsuario', () => {
    test('deve retornar 201 ao criar usuário com dados válidos', async () => {
      // Arrange
      const mockReq = criarMockRequest({
        body: {
          nome: 'João Silva',
          email: 'joao@email.com',
          password: 'senhaSegura123',
        },
      })

      const mockRes = criarMockResponse()

      // Act
      await usuarioController.criarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Number),
          nome: 'João Silva',
          email: 'joao@email.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      )

      // Verifica no banco
      const usuarioNoBanco = await Usuario.findOne({ where: { email: 'joao@email.com' } })
      expect(usuarioNoBanco).toBeDefined()
      expect(usuarioNoBanco?.nome).toBe('João Silva')
    })

    test('deve retornar 400 ao tentar criar usuário com email duplicado', async () => {
      // Arrange
      await criarUsuario({
        nome: 'Usuario Existente',
        email: 'existente@email.com',
        passwordHash: 'senhaSegura123',
      })

      const mockReq = criarMockRequest({
        body: {
          nome: 'Novo Usuário',
          email: 'existente@email.com',
          password: 'outrasenha',
        },
      })

      const mockRes = criarMockResponse()

      // Act
      await usuarioController.criarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email já está em uso por outro usuário',
      })
    })

    test('deve retornar 400 para dados inválidos (validação Zod)', async () => {
      // Arrange
      const mockReq = criarMockRequest({
        body: {
          nome: '', // Nome vazio - inválido
          email: 'email-invalido', // Email inválido
          passwordHash: '123', // Senha muito curta
        },
      })

      const mockRes = criarMockResponse()

      // Act
      await usuarioController.criarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Dados de entrada inválidos',
        detalhes: expect.arrayContaining([
          expect.objectContaining({
            campo: expect.any(String),
            mensagem: expect.any(String),
          }),
        ]),
      })
    })
  })

  describe('login', () => {
    test('deve retornar 200 e token ao fazer login com credenciais válidas', async () => {
      // Arrange
      const senhaTeste = 'minhaSenhaSecreta123'

      await criarUsuarioComSenha(senhaTeste, {
        nome: 'Usuario Login',
        email: 'login@email.com',
      })

      const mockReq = criarMockRequest({
        body: {
          email: 'login@email.com',
          password: senhaTeste,
        },
      })

      const mockRes = criarMockResponse()

      // Act
      await usuarioController.login(mockReq, mockRes)

      // Assert
      expect(mockRes.status as jest.Mock).toHaveBeenCalledWith(200)
      expect(mockRes.json as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: expect.objectContaining({
            id: expect.any(Number),
            nome: 'Usuario Login',
            email: 'login@email.com',
          }),
          token: expect.any(String),
        }),
      )
    })

    test('deve retornar 401 ao tentar login com credenciais inválidas', async () => {
      // Arrange
      await criarUsuario({
        nome: 'Usuario Login',
        email: 'login@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockRequest({
        body: {
          email: 'login@email.com',
          password: 'senha_errada',
        },
      })

      const mockRes = criarMockResponse()

      // Act
      await usuarioController.login(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
    })
  })

  /**
   * ROTAS PRIVADAS
   */

  describe('buscarUsuarioLogado', () => {
    test('deve retornar 200 com dados do usuário logado', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Logado',
        email: 'logado@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email)
      const mockRes = criarMockResponse()

      // Act
      await usuarioController.buscarUsuarioLogado(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: usuario.id,
          nome: 'Usuario Logado',
          email: 'logado@email.com',
        }),
      )
    })

    test('deve retornar 401 quando não há usuário autenticado', async () => {
      // Arrange - Usa mock request sem usuário
      const mockReq = criarMockRequestSemUsuario()
      const mockRes = criarMockResponse()

      await usuarioController.buscarUsuarioLogado(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Usuário não autenticado',
      })
    })

    test('deve retornar 404 quando usuário não existe mais no banco', async () => {
      // Arrange
      const mockReq = criarMockAuthRequest(99999, 'inexistente@email.com')
      const mockRes = criarMockResponse()

      await usuarioController.buscarUsuarioLogado(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Usuário não encontrado',
      })
    })

    test('deve retornar 401 quando req.usuario é undefined', async () => {
      // Arrange
      const mockReq = criarMockRequestSemUsuario()
      const mockRes = criarMockResponse()

      // Act
      await usuarioController.buscarUsuarioLogado(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Usuário não autenticado',
      })

      // expect(usuarioService.buscarPorId).not.toHaveBeenCalled()
    })

    test('deve chamar handleError quando service lançar exceção', async () => {
      // Arrange
      const usuarioId = 1
      const mockReq = criarMockAuthRequest(usuarioId, 'teste@email.com')
      const mockRes = criarMockResponse()

      // Mock do service para lançar um erro
      const erroDoService = new Error('Erro de conexão com o banco')
      jest.spyOn(usuarioService, 'buscarPorId').mockRejectedValueOnce(erroDoService)

      // Spy no handleError para verificar se foi chamado
      const handleErrorSpy = jest.spyOn(usuarioController as unknown as { handleError: (error: unknown, res: Response) => Response }, 'handleError')

      // Act
      await usuarioController.buscarUsuarioLogado(mockReq, mockRes)

      // Assert
      expect(handleErrorSpy).toHaveBeenCalledWith(erroDoService, mockRes)

      // Cleanup
      handleErrorSpy.mockRestore()
    })
  })

  describe('atualizarUsuario', () => {
    test('deve retornar 200 ao atualizar nome do usuário', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Nome Original',
        email: 'original@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        body: { nome: 'Nome Atualizado' },
      })
      const mockRes = criarMockResponse()

      // Act
      await usuarioController.atualizarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: usuario.id,
          nome: 'Nome Atualizado',
          email: 'original@email.com',
        }),
      )

      // Verifica no banco
      const usuarioAtualizado = await Usuario.findByPk(usuario.id)
      expect(usuarioAtualizado?.nome).toBe('Nome Atualizado')
    })

    test('deve retornar 200 ao atualizar email do usuário', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Teste',
        email: 'original@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        body: { email: 'novo@email.com' },
      })
      const mockRes = criarMockResponse()

      // Act
      await usuarioController.atualizarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: usuario.id,
          nome: 'Usuario Teste',
          email: 'novo@email.com',
        }),
      )
    })

    test('deve retornar 400 ao tentar usar email já existente', async () => {
      // Arrange
      await criarUsuario({
        nome: 'Usuario Existente',
        email: 'existente@email.com',
        passwordHash: 'senha123',
      })

      const usuarioAtualizando = await criarUsuario({
        nome: 'Usuario Atualizando',
        email: 'atualizando@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuarioAtualizando.id, usuarioAtualizando.email, {
        body: { email: 'existente@email.com' },
      })
      const mockRes = criarMockResponse()

      await usuarioController.atualizarUsuario(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email já está em uso por outro usuário',
      })
    })

    test('deve retornar 400 quando nenhum campo é fornecido para atualização', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Teste',
        email: 'teste@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        body: {}, // Body vazio
      })
      const mockRes = criarMockResponse()

      // Act
      await usuarioController.atualizarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Dados de entrada inválidos',
        detalhes: expect.any(Array),
      })
    })

    test('deve retornar 401 quando req.usuario é undefined', async () => {
      // Arrange
      const mockReq = criarMockRequestSemUsuario()
      const mockRes = criarMockResponse()

      // Act
      await usuarioController.atualizarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Usuário não autenticado',
      })

      // expect(usuarioService.atualizarUsuario).not.toHaveBeenCalled()
    })

    test('deve retornar 401 quando req.usuario.id é undefined', async () => {
      // Arrange
      const mockReq = {
        ...criarMockRequest(),
        usuario: { email: 'teste@email.com' }, // ← Sem id
      } as IAuthRequest

      const mockRes = criarMockResponse()

      // Act
      await usuarioController.atualizarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Usuário não autenticado',
      })

      // expect(usuarioService.atualizarUsuario).not.toHaveBeenCalled()
    })
  })

  describe('deletarUsuario', () => {
    test('deve retornar 204 ao deletar usuário com sucesso', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Para Deletar',
        email: 'deletar@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email)
      const mockRes = criarMockResponse()

      // Act
      await usuarioController.deletarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(204)
      expect(mockRes.send).toHaveBeenCalled()

      // Verifica que foi deletado do banco
      const usuarioDeletado = await Usuario.findByPk(usuario.id)
      expect(usuarioDeletado).toBeNull()
    })

    test('deve retornar 404 ao tentar deletar usuário que não existe', async () => {
      // Arrange
      const mockReq = criarMockAuthRequest(99999, 'inexistente@email.com')
      const mockRes = criarMockResponse()

      // Act
      await usuarioController.deletarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Usuário não encontrado',
      })
    })

    test('deve retornar 401 quando req.usuario é undefined', async () => {
      // Arrange
      const mockReq = criarMockRequestSemUsuario()
      const mockRes = criarMockResponse()

      // Act
      await usuarioController.deletarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Usuário não autorizado',
      })

      // expect(usuarioService.deletarUsuario).not.toHaveBeenCalled()
    })
  })

  // // --------------------------------------------------------------------
  // // TESTES ADICIONAIS PARA COBERTURA COMPLETA
  // // --------------------------------------------------------------------

  describe('cenários adicionais', () => {
    test('deve permitir atualizar usuário para o mesmo email', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario Teste',
        email: 'teste@email.com',
        passwordHash: 'senha123',
      })

      const mockReq = criarMockAuthRequest(usuario.id, usuario.email, {
        body: { email: 'teste@email.com' }, // Mesmo email
      })
      const mockRes = criarMockResponse()

      // Act
      await usuarioController.atualizarUsuario(mockReq, mockRes)

      // Assert - Deve permitir (não deve lançar erro)
      expect(mockRes.status).toHaveBeenCalledWith(200)
    })

    test('deve retornar 500 para erro interno não tratado', async () => {
      // Arrange
      const mockReq = criarMockRequest({
        body: {
          nome: 'Teste',
          email: 'teste@email.com',
          password: 'senha123',
        },
      })
      const mockRes = criarMockResponse()

      // Simula um erro no service (ex: problema de conexão com banco)
      jest.spyOn(usuarioService, 'criarUsuario').mockRejectedValueOnce(new Error('Erro de conexão'))

      // Act
      await usuarioController.criarUsuario(mockReq, mockRes)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
      })
    })
  })
})
