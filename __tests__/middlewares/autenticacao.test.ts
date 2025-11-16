// src/__tests__/middlewares/autenticacao.test.ts

import type { Response, NextFunction } from 'express'
import type { IAuthRequest } from '../../src/middlewares/interfaces/IAuthRequest'
import { autenticar } from '../../src/middlewares/autenticacao'
import { verificarToken, extrairTokenDoHeader } from '../../src/utils/jwt'

// Mock das funções do JWT
jest.mock('../../src/utils/jwt', () => ({
  verificarToken: jest.fn(),
  extrairTokenDoHeader: jest.fn(),
}))

const mockVerificarToken = verificarToken as jest.MockedFunction<typeof verificarToken>
const mockExtrairTokenDoHeader = extrairTokenDoHeader as jest.MockedFunction<typeof extrairTokenDoHeader>

describe('autenticar Middleware', () => {
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
      headers: {},
    }
    mockRes = {
      status: statusMock,
      json: jsonMock,
    }
    mockNext = jest.fn()

    // Limpar todos os mocks
    jest.clearAllMocks()
  })

  describe('quando o token é válido', () => {
    it('deve autenticar usuário com token válido e chamar next', () => {
      // Arrange
      const token = 'token.valido.jwt'
      const usuarioDecodificado = {
        id: 1,
        email: 'usuario@teste.com',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      }

      mockReq.headers = { authorization: 'Bearer ' + token }
      mockExtrairTokenDoHeader.mockReturnValue(token)
      mockVerificarToken.mockReturnValue(usuarioDecodificado)

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockExtrairTokenDoHeader).toHaveBeenCalledWith('Bearer ' + token)
      expect(mockVerificarToken).toHaveBeenCalledWith(token)
      expect(mockReq.usuario).toEqual({
        id: usuarioDecodificado.id,
        email: usuarioDecodificado.email,
      })
      expect(mockNext).toHaveBeenCalled()
      expect(statusMock).not.toHaveBeenCalled()
      expect(jsonMock).not.toHaveBeenCalled()
    })

    it('deve funcionar com token que possui role', () => {
      // Arrange
      const token = 'token.com.role.jwt'
      const usuarioDecodificado = {
        id: 2,
        email: 'admin@teste.com',
        role: 'admin',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      }

      mockReq.headers = { authorization: 'Bearer ' + token }
      mockExtrairTokenDoHeader.mockReturnValue(token)
      mockVerificarToken.mockReturnValue(usuarioDecodificado)

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockReq.usuario).toEqual({
        id: usuarioDecodificado.id,
        email: usuarioDecodificado.email,
        // Role não deve ser incluído no req.usuario
      })
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('quando há erros de autenticação', () => {
    it('deve retornar 401 quando token não é fornecido', () => {
      // Arrange
      mockReq.headers = { authorization: undefined }
      mockExtrairTokenDoHeader.mockReturnValue(null)

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockExtrairTokenDoHeader).toHaveBeenCalledWith(undefined)
      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Token não fornecido. Acesso negado.',
      })
      expect(mockNext).not.toHaveBeenCalled()
      expect(mockVerificarToken).not.toHaveBeenCalled()
    })

    it('deve retornar 401 quando token é inválido', () => {
      // Arrange
      const token = 'token.invalido.jwt'
      mockReq.headers = { authorization: 'Bearer ' + token }
      mockExtrairTokenDoHeader.mockReturnValue(token)
      mockVerificarToken.mockImplementation(() => {
        throw new Error('Token inválido')
      })

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockExtrairTokenDoHeader).toHaveBeenCalledWith('Bearer ' + token)
      expect(mockVerificarToken).toHaveBeenCalledWith(token)
      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Token inválido ou expirado.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('deve retornar 401 quando token está expirado', () => {
      // Arrange
      const token = 'token.expirado.jwt'
      mockReq.headers = { authorization: 'Bearer ' + token }
      mockExtrairTokenDoHeader.mockReturnValue(token)

      // Simular erro de token expirado
      const tokenExpiradoError = new Error('Token expirado')
      tokenExpiradoError.name = 'TokenExpiredError'
      mockVerificarToken.mockImplementation(() => {
        throw tokenExpiradoError
      })

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Token inválido ou expirado.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('deve retornar 401 quando header authorization está vazio', () => {
      // Arrange
      mockReq.headers = { authorization: '' }
      mockExtrairTokenDoHeader.mockReturnValue(null)

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Token não fornecido. Acesso negado.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('deve retornar 401 quando header authorization tem formato inválido', () => {
      // Arrange
      mockReq.headers = { authorization: 'Basic dXNlcjpwYXNz' } // Basic auth instead of Bearer
      mockExtrairTokenDoHeader.mockReturnValue(null)

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Token não fornecido. Acesso negado.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('cenários edge cases', () => {
    it('deve lidar com erro inesperado durante verificação', () => {
      // Arrange
      const token = 'token.erro.inesperado.jwt'
      mockReq.headers = { authorization: 'Bearer ' + token }
      mockExtrairTokenDoHeader.mockReturnValue(token)
      mockVerificarToken.mockImplementation(() => {
        throw new Error('Erro inesperado no servidor')
      })

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Token inválido ou expirado.',
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('deve funcionar com header authorization em diferentes formatos', () => {
      // Testar que o middleware delega a extração para a função helper
      const token = 'token.diferente.jwt'

      // A função extrairTokenDoHeader deve lidar com diferentes formatos
      mockReq.headers = { authorization: 'Bearer    ' + token } // múltiplos espaços
      mockExtrairTokenDoHeader.mockReturnValue(token)
      mockVerificarToken.mockReturnValue({
        id: 3,
        email: 'teste@teste.com',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      })

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockExtrairTokenDoHeader).toHaveBeenCalledWith('Bearer    ' + token)
      expect(mockVerificarToken).toHaveBeenCalledWith(token)
      expect(mockNext).toHaveBeenCalled()
    })

    it('não deve incluir campos extras do token no req.usuario', () => {
      // Arrange
      const token = 'token.com.campos.extras.jwt'
      const usuarioDecodificado = {
        id: 4,
        email: 'completo@teste.com',
        role: 'user',
        iat: 1234567890,
        exp: 1234567890 + 3600,
        campoExtra: 'valor_extra',
        outroCampo: 123,
      }

      mockReq.headers = { authorization: 'Bearer ' + token }
      mockExtrairTokenDoHeader.mockReturnValue(token)
      mockVerificarToken.mockReturnValue(usuarioDecodificado)

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockReq.usuario).toEqual({
        id: usuarioDecodificado.id,
        email: usuarioDecodificado.email,
      })
      // Garantir que campos extras não estão presentes
      expect(mockReq.usuario).not.toHaveProperty('role')
      expect(mockReq.usuario).not.toHaveProperty('campoExtra')
      expect(mockReq.usuario).not.toHaveProperty('outroCampo')
      expect(mockReq.usuario).not.toHaveProperty('iat')
      expect(mockReq.usuario).not.toHaveProperty('exp')
    })
  })

  describe('integração com funções do JWT', () => {
    it('deve chamar extrairTokenDoHeader com o header correto', () => {
      // Arrange
      const authorizationHeader = 'Bearer meu.token.jwt'
      mockReq.headers = { authorization: authorizationHeader }
      mockExtrairTokenDoHeader.mockReturnValue('meu.token.jwt')
      mockVerificarToken.mockReturnValue({
        id: 1,
        email: 'test@test.com',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      })

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockExtrairTokenDoHeader).toHaveBeenCalledWith(authorizationHeader)
    })

    it('deve chamar verificarToken com o token extraído', () => {
      // Arrange
      const tokenExtraido = 'token.extraido.jwt'
      mockReq.headers = { authorization: 'Bearer qualquer' }
      mockExtrairTokenDoHeader.mockReturnValue(tokenExtraido)
      mockVerificarToken.mockReturnValue({
        id: 1,
        email: 'test@test.com',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      })

      // Act
      autenticar(mockReq as IAuthRequest, mockRes as Response, mockNext)

      // Assert
      expect(mockVerificarToken).toHaveBeenCalledWith(tokenExtraido)
    })
  })
})
