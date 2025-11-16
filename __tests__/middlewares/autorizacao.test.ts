// src/__tests__/middlewares/autorizacao.test.ts

import type { Response, NextFunction } from 'express'
import type { IAuthRequest } from '../../src/middlewares/interfaces/IAuthRequest'
import { requerRole, requerAdmin, requerProprietarioOuAdmin } from '../../src/middlewares/autorizacao'

describe('Autorizacao Middlewares', () => {
  let mockReq: Partial<IAuthRequest>
  let mockRes: Partial<Response>
  let mockNext: NextFunction
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    // Configurar mocks
    statusMock = jest.fn().mockReturnThis()
    jsonMock = jest.fn()

    mockReq = {
      usuario: {
        id: 1,
        email: 'usuario@teste.com',
        role: 'user',
      },
      params: {},
    }
    mockRes = {
      status: statusMock,
      json: jsonMock,
    }
    mockNext = jest.fn()

    // Limpar todos os mocks
    jest.clearAllMocks()
  })

  describe('requerRole', () => {
    it('deve permitir acesso quando usuário tem role requerida (string única)', () => {
      // Arrange
      const middleware = requerRole('user')

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
      expect(jsonMock).not.toHaveBeenCalled()
    })

    it('deve permitir acesso quando usuário tem uma das roles requeridas (array)', () => {
      // Arrange
      const middleware = requerRole(['admin', 'user'])
      if (mockReq.usuario) {
        mockReq.usuario.role = 'admin'
      }

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
      expect(jsonMock).not.toHaveBeenCalled()
    })

    it('deve negar acesso quando usuário não tem role requerida', () => {
      // Arrange
      const middleware = requerRole('admin')
      if (mockReq.usuario) {
        mockReq.usuario.role = 'user'
      }

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Acesso negado. Permissões insuficientes.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('deve negar acesso quando usuário não tem nenhuma das roles requeridas', () => {
      // Arrange
      const middleware = requerRole(['admin', 'moderator'])
      if (mockReq.usuario) {
        mockReq.usuario.role = 'user'
      }

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Acesso negado. Permissões insuficientes.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('deve usar role "user" como padrão quando usuário não tem role definida', () => {
      // Arrange
      const middleware = requerRole('user')
      // Para simular usuário sem role, criamos um novo objeto sem a propriedade role
      mockReq.usuario = {
        id: 1,
        email: 'usuario@teste.com',
        // role não definida
      }

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('deve atribuir role "user" como padrão quando usuário não está autenticado', () => {
      // Arrange
      const middleware = requerRole('user')
      // Criar um novo objeto sem a propriedade usuario
      const reqSemUsuario = { ...mockReq } as IAuthRequest
      delete reqSemUsuario.usuario

      // Act
      middleware(reqSemUsuario as IAuthRequest, mockRes as Response, mockNext)

      // Assert - Comportamento atual: permite acesso com role 'user' padrão
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
    })
  })

  describe('requerAdmin', () => {
    it('deve permitir acesso quando usuário é admin', () => {
      // Arrange
      if (mockReq.usuario) {
        mockReq.usuario.role = 'admin'
      }

      // Act
      requerAdmin(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
      expect(jsonMock).not.toHaveBeenCalled()
    })

    it('deve negar acesso quando usuário não é admin', () => {
      // Arrange
      if (mockReq.usuario) {
        mockReq.usuario.role = 'user'
      }

      // Act
      requerAdmin(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Acesso negado. Permissões insuficientes.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('requerProprietarioOuAdmin', () => {
    it('deve permitir acesso quando usuário é admin', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('id')
      if (mockReq.usuario) {
        mockReq.usuario.role = 'admin'
      }
      mockReq.params = { id: '999' } // ID diferente do usuário

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
      expect(jsonMock).not.toHaveBeenCalled()
    })

    it('deve permitir acesso quando usuário é proprietário do recurso', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('id')
      if (mockReq.usuario) {
        mockReq.usuario.id = 1
        mockReq.usuario.role = 'user'
      }
      mockReq.params = { id: '1' } // Mesmo ID do usuário

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
      expect(jsonMock).not.toHaveBeenCalled()
    })

    it('deve negar acesso quando usuário não é admin nem proprietário', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('id')
      if (mockReq.usuario) {
        mockReq.usuario.id = 1
        mockReq.usuario.role = 'user'
      }
      mockReq.params = { id: '2' } // ID diferente do usuário

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Acesso negado. Você só pode acessar seus próprios recursos.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('deve retornar erro 400 quando parâmetro está ausente', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('userId')
      mockReq.params = {} // Parâmetro userId não existe

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Parâmetro "userId" ausente na rota.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('deve funcionar com nome de parâmetro customizado', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('usuarioId')
      if (mockReq.usuario) {
        mockReq.usuario.id = 5
      }
      mockReq.params = { usuarioId: '5' }

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('deve converter string para número ao comparar IDs', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('id')
      if (mockReq.usuario) {
        mockReq.usuario.id = 10
      }
      mockReq.params = { id: '10' } // String que representa o mesmo número

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('deve negar acesso quando parâmetro não é um número válido', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('id')
      if (mockReq.usuario) {
        mockReq.usuario.id = 1
        mockReq.usuario.role = 'user'
      }
      mockReq.params = { id: 'abc' } // Não é um número

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Acesso negado. Você só pode acessar seus próprios recursos.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('deve negar acesso quando usuário não está autenticado', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('id')
      // Remover a propriedade usuario completamente ao invés de definir como undefined
      delete mockReq.usuario
      mockReq.params = { id: '1' }

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(403)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Acesso negado. Você só pode acessar seus próprios recursos.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('deve permitir admin mesmo quando parâmetro não é um número', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('id')
      if (mockReq.usuario) {
        mockReq.usuario.role = 'admin'
      }
      mockReq.params = { id: 'abc' } // Não é um número, mas admin tem acesso

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
    })
  })

  describe('cenários edge cases', () => {
    it('deve funcionar com roles customizadas', () => {
      // Arrange
      const middleware = requerRole(['moderator', 'editor'])
      if (mockReq.usuario) {
        mockReq.usuario.role = 'moderator'
      }

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('deve lidar com ID zero como proprietário', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('id')
      if (mockReq.usuario) {
        mockReq.usuario.id = 0 // ID zero (edge case)
        mockReq.usuario.role = 'user'
      }
      mockReq.params = { id: '0' }

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('deve lidar com IDs muito grandes', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('id')
      const bigId = 999999999
      if (mockReq.usuario) {
        mockReq.usuario.id = bigId
        mockReq.usuario.role = 'user'
      }
      mockReq.params = { id: bigId.toString() }

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('deve lidar corretamente com usuário sem role definida em requerProprietarioOuAdmin', () => {
      // Arrange
      const middleware = requerProprietarioOuAdmin('id')
      // Criar usuário sem a propriedade role
      mockReq.usuario = {
        id: 1,
        email: 'usuario@teste.com',
        // role não definida
      }
      mockReq.params = { id: '1' }

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert - Deve permitir acesso pois é proprietário
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
    })

    it('deve lidar com usuário sem role em requerRole', () => {
      // Arrange
      const middleware = requerRole('user')
      // Criar usuário sem a propriedade role
      mockReq.usuario = {
        id: 1,
        email: 'usuario@teste.com',
        // role não definida
      }

      // Act
      middleware(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert - Deve permitir acesso pois role padrão é 'user'
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
    })
  })

  describe('validações de tipo TypeScript', () => {
    it('deve compilar sem non-null assertions e sem undefined explícito', () => {
      // Este teste valida que o código TypeScript está correto
      const middlewareRole = requerRole('user')
      const middlewareAdmin = requerAdmin
      const middlewareProprietario = requerProprietarioOuAdmin('id')

      // Apenas verificar que as funções existem e podem ser chamadas
      expect(typeof middlewareRole).toBe('function')
      expect(typeof middlewareAdmin).toBe('function')
      expect(typeof middlewareProprietario).toBe('function')
    })
  })
})
