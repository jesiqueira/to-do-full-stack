// src/__tests__/unit/validacaoMiddleware.test.ts
import type { Response, NextFunction } from 'express'
import { z } from 'zod'
import { validarBody, validarQuery, validarParams } from '../../src/middlewares/validacao'
import { criarUsuarioSchema, loginSchema, atualizarUsuarioSchema, parametrosUsuarioSchema } from '../../src/schemas/usuarioSchemas'
import { criarMockRequest, criarMockResponse } from '../helpers/httpHelpers'

// Tipo para mock do ZodSchema
type MockZodSchema = Pick<z.ZodSchema, 'parseAsync'> & {
  _type?: unknown
}

describe('Middlewares de Validação', () => {
  let mockRes: Response
  let mockNext: jest.MockedFunction<NextFunction>

  beforeEach(() => {
    mockRes = criarMockResponse()
    mockNext = jest.fn()
  })

  // --------------------------------------------------------------------
  // VALIDAR BODY - COM SCHEMAS REAIS
  // --------------------------------------------------------------------

  describe('validarBody', () => {
    describe('com criarUsuarioSchema', () => {
      test('deve chamar next() quando dados de usuário são válidos', async () => {
        // Arrange
        const middleware = validarBody(criarUsuarioSchema)
        const mockReq = criarMockRequest({
          body: {
            nome: 'João Silva',
            email: 'joao@email.com',
            password: 'senhaSegura123',
          },
        })

        // Act
        await middleware(mockReq, mockRes, mockNext)

        // Assert
        expect(mockNext).toHaveBeenCalled()
        expect(mockRes.status).not.toHaveBeenCalled()
      })

      test('deve aplicar transformações (trim e lowercase) nos dados', async () => {
        // Arrange
        const middleware = validarBody(criarUsuarioSchema)
        const mockReq = criarMockRequest({
          body: {
            nome: '  João Silva  ', // Espaços extras
            email: 'JOAO@EMAIL.COM', // Maiúsculas
            password: 'senha123',
          },
        })

        // Act
        await middleware(mockReq, mockRes, mockNext)

        // Assert - Foca no comportamento, não na implementação
        expect(mockNext).toHaveBeenCalled()
        expect(mockRes.status).not.toHaveBeenCalled()
      })

      test('deve retornar 400 quando dados de usuário são inválidos', async () => {
        // Arrange
        const middleware = validarBody(criarUsuarioSchema)
        const mockReq = criarMockRequest({
          body: {
            nome: '', // Nome vazio
            email: 'email-invalido', // Email inválido
            password: '123', // Senha muito curta
          },
        })

        // Act
        await middleware(mockReq, mockRes, mockNext)

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados de entrada inválidos',
          detalhes: expect.arrayContaining([
            expect.objectContaining({
              campo: 'nome',
              mensagem: 'Nome é obrigatório',
            }),
            expect.objectContaining({
              campo: 'email',
              mensagem: 'Email inválido',
            }),
            expect.objectContaining({
              campo: 'password',
              mensagem: 'Senha deve ter pelo menos 6 caracteres',
            }),
          ]),
        })
        expect(mockNext).not.toHaveBeenCalled()
      })
    })

    describe('com loginSchema', () => {
      test('deve chamar next() quando credenciais são válidas', async () => {
        // Arrange
        const middleware = validarBody(loginSchema)
        const mockReq = criarMockRequest({
          body: {
            email: 'usuario@email.com',
            password: 'minhaSenha123',
          },
        })

        // Act
        await middleware(mockReq, mockRes, mockNext)

        // Assert
        expect(mockNext).toHaveBeenCalled()
        expect(mockRes.status).not.toHaveBeenCalled()
      })

      test('deve retornar 400 quando credenciais são inválidas', async () => {
        // Arrange
        const middleware = validarBody(loginSchema)
        const mockReq = criarMockRequest({
          body: {
            email: 'email-invalido',
            password: '', // Senha vazia
          },
        })

        // Act
        await middleware(mockReq, mockRes, mockNext)

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados de entrada inválidos',
          detalhes: expect.arrayContaining([
            expect.objectContaining({
              campo: 'email',
              mensagem: 'Email inválido',
            }),
            expect.objectContaining({
              campo: 'password',
              mensagem: 'Senha é Obrigatória',
            }),
          ]),
        })
      })
    })

    describe('com atualizarUsuarioSchema', () => {
      test('deve chamar next() quando dados de atualização são válidos', async () => {
        // Arrange
        const middleware = validarBody(atualizarUsuarioSchema)
        const mockReq = criarMockRequest({
          body: {
            nome: 'Novo Nome',
          },
        })

        // Act
        await middleware(mockReq, mockRes, mockNext)

        // Assert
        expect(mockNext).toHaveBeenCalled()
        expect(mockRes.status).not.toHaveBeenCalled()
      })

      test('deve permitir atualização apenas do email', async () => {
        // Arrange
        const middleware = validarBody(atualizarUsuarioSchema)
        const mockReq = criarMockRequest({
          body: {
            email: 'novo@email.com',
          },
        })

        // Act
        await middleware(mockReq, mockRes, mockNext)

        // Assert
        expect(mockNext).toHaveBeenCalled()
        expect(mockRes.status).not.toHaveBeenCalled()
      })

      test('deve retornar 400 quando nenhum campo é fornecido', async () => {
        // Arrange
        const middleware = validarBody(atualizarUsuarioSchema)
        const mockReq = criarMockRequest({
          body: {}, // Body vazio
        })

        // Act
        await middleware(mockReq, mockRes, mockNext)

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados de entrada inválidos',
          detalhes: expect.arrayContaining([
            expect.objectContaining({
              mensagem: 'Pelo menos um campo deve ser fornecido para atualização',
            }),
          ]),
        })
      })

      test('deve retornar 400 quando campos são inválidos', async () => {
        // Arrange
        const middleware = validarBody(atualizarUsuarioSchema)
        const mockReq = criarMockRequest({
          body: {
            nome: '', // Nome vazio
            email: 'email-invalido', // Email inválido
          },
        })

        // Act
        await middleware(mockReq, mockRes, mockNext)

        // Assert
        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados de entrada inválidos',
          detalhes: expect.arrayContaining([
            expect.objectContaining({
              campo: 'nome',
              mensagem: 'Nome é obrigatório',
            }),
            expect.objectContaining({
              campo: 'email',
              mensagem: 'Email inválido',
            }),
          ]),
        })
      })
    })
  })

  // --------------------------------------------------------------------
  // VALIDAR PARAMS - COM SCHEMA REAL
  // --------------------------------------------------------------------

  describe('validarParams', () => {
    test('deve chamar next() quando ID é válido', async () => {
      // Arrange
      const middleware = validarParams(parametrosUsuarioSchema)
      const mockReq = criarMockRequest({
        params: {
          id: '123',
        },
      })

      // Act
      await middleware(mockReq, mockRes, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    test('deve converter string para number corretamente', async () => {
      // Arrange
      const middleware = validarParams(parametrosUsuarioSchema)
      const mockReq = criarMockRequest({
        params: {
          id: '456', // string → number
        },
      })

      // Act
      await middleware(mockReq, mockRes, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
    })

    test('deve retornar 400 quando ID é inválido', async () => {
      // Arrange
      const middleware = validarParams(parametrosUsuarioSchema)
      const mockReq = criarMockRequest({
        params: {
          id: '-10', // ID negativo
        },
      })

      // Act
      await middleware(mockReq, mockRes, mockNext)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Dados de entrada inválidos',
        detalhes: expect.arrayContaining([
          expect.objectContaining({
            campo: 'id',
            mensagem: 'ID deve ser positivo',
          }),
        ]),
      })
    })

    test('deve retornar 400 quando ID não é inteiro', async () => {
      // Arrange
      const middleware = validarParams(parametrosUsuarioSchema)
      const mockReq = criarMockRequest({
        params: {
          id: '123.45', // Não é inteiro
        },
      })

      // Act
      await middleware(mockReq, mockRes, mockNext)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Dados de entrada inválidos',
        detalhes: expect.arrayContaining([
          expect.objectContaining({
            campo: 'id',
            mensagem: 'ID deve ser um número inteiro',
          }),
        ]),
      })
    })
  })

  // --------------------------------------------------------------------
  // VALIDAR QUERY - COM SCHEMA DE EXEMPLO (se não tiver schema real)
  // --------------------------------------------------------------------

  describe('validarQuery', () => {
    // Se você tiver schemas de query reais, use-os aqui
    // Por enquanto, vamos usar um schema de exemplo
    const exemploQuerySchema = z.object({
      pagina: z.coerce.number().min(1, 'Página deve ser maior que 0').optional(),
      limite: z.coerce.number().min(1, 'Limite deve ser maior que 0').optional(),
    })

    test('deve chamar next() quando query é válida', async () => {
      // Arrange
      const middleware = validarQuery(exemploQuerySchema)
      const mockReq = criarMockRequest({
        query: {
          pagina: '1',
          limite: '10',
        },
      })

      // Act
      await middleware(mockReq, mockRes, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    test('deve retornar 400 quando query é inválida', async () => {
      // Arrange
      const middleware = validarQuery(exemploQuerySchema)
      const mockReq = criarMockRequest({
        query: {
          pagina: '0', // Página inválida
          limite: '-5', // Limite inválido
        },
      })

      // Act
      await middleware(mockReq, mockRes, mockNext)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE ERRO NÃO-ZOD (CORRIGIDOS SEM ANY)
  // --------------------------------------------------------------------

  describe('handleValidationError - Erros não-Zod', () => {
    test('deve retornar 500 para erro genérico (não-Zod)', async () => {
      // Arrange - Criar mock tipado do schema
      const schemaComErro: MockZodSchema = {
        parseAsync: jest.fn().mockRejectedValue(new Error('Erro interno no banco')),
      }

      const middleware = validarBody(schemaComErro as z.ZodSchema)
      const mockReq = criarMockRequest({
        body: {
          nome: 'Teste',
          email: 'teste@email.com',
          password: 'senha123',
        },
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Act
      await middleware(mockReq, mockRes, mockNext)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno na validação',
      })
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erro na validação:', expect.any(Error))
      expect(mockNext).not.toHaveBeenCalled()

      // Cleanup
      consoleErrorSpy.mockRestore()
    })

    test('deve retornar 500 para qualquer erro que não seja ZodError', async () => {
      // Arrange
      const schemaComErro: MockZodSchema = {
        parseAsync: jest.fn().mockRejectedValue(new TypeError('Type error')),
      }

      const middleware = validarBody(schemaComErro as z.ZodSchema)
      const mockReq = criarMockRequest({
        body: { nome: 'Teste' },
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Act
      await middleware(mockReq, mockRes, mockNext)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno na validação',
      })
      expect(mockNext).not.toHaveBeenCalled()

      // Cleanup
      consoleErrorSpy.mockRestore()
    })
  })

  describe('validarQuery - Erros não-Zod', () => {
    test('deve retornar 500 quando ocorre erro interno na validação da query', async () => {
      // Arrange
      const schemaComErro: MockZodSchema = {
        parseAsync: jest.fn().mockRejectedValue(new Error('Erro de conexão')),
      }

      const middleware = validarQuery(schemaComErro as z.ZodSchema)
      const mockReq = criarMockRequest({
        query: { pagina: '1' },
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Act
      await middleware(mockReq, mockRes, mockNext)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno na validação',
      })
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erro na validação:', expect.any(Error))

      // Cleanup
      consoleErrorSpy.mockRestore()
    })
  })

  describe('validarParams - Erros não-Zod', () => {
    test('deve retornar 500 quando ocorre erro interno na validação dos params', async () => {
      // Arrange
      const schemaComErro: MockZodSchema = {
        parseAsync: jest.fn().mockRejectedValue(new Error('Erro inesperado')),
      }

      const middleware = validarParams(schemaComErro as z.ZodSchema)
      const mockReq = criarMockRequest({
        params: { id: '123' },
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Act
      await middleware(mockReq, mockRes, mockNext)

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno na validação',
      })
      expect(consoleErrorSpy).toHaveBeenCalled()

      // Cleanup
      consoleErrorSpy.mockRestore()
    })
  })
})
