// src/__tests__/routes/usuarioRoutes.integration.test.ts

import request from 'supertest'
import app from '../../src/app'
import { Usuario } from '../../src/database/models/Usuario'

describe('Rotas de Usuário - Integração Real', () => {
  describe('POST /api/usuarios/cadastro', () => {
    it('deve criar um usuário com sucesso', async () => {
      // Arrange
      const dadosUsuario = {
        nome: 'João Silva',
        email: 'joao@email.com',
        password: 'senha123',
      }

      // Act
      const response = await request(app).post('/api/usuarios/cadastro').send(dadosUsuario)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        nome: 'João Silva',
        email: 'joao@email.com',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
      expect(response.body.password).toBeUndefined()
      expect(response.body.passwordHash).toBeUndefined()

      // Verifica no banco
      const usuarioNoBanco = await Usuario.findOne({ where: { email: 'joao@email.com' } })
      expect(usuarioNoBanco).toBeTruthy()
      expect(usuarioNoBanco?.nome).toBe('João Silva')
      expect(usuarioNoBanco?.passwordHash).not.toBe('senha123') // Deve estar hasheada
    })

    it('deve retornar 400 para email duplicado', async () => {
      // Arrange - Cria primeiro usuário
      await Usuario.create({
        nome: 'Usuário Existente',
        email: 'existente@email.com',
        passwordHash: 'hash_qualquer',
      })

      const dadosUsuario = {
        nome: 'Novo Usuário',
        email: 'existente@email.com', // Mesmo email
        password: 'senha123',
      }

      // Act
      const response = await request(app).post('/api/usuarios/cadastro').send(dadosUsuario)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Email já está em uso')
    })

    it('deve retornar 400 para dados inválidos', async () => {
      // Arrange
      const dadosInvalidos = {
        nome: '', // Nome vazio
        email: 'email-invalido', // Email inválido
        password: '123', // Senha muito curta
      }

      // Act
      const response = await request(app).post('/api/usuarios/cadastro').send(dadosInvalidos)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Dados de entrada inválidos')
      expect(response.body.detalhes).toBeInstanceOf(Array)
    })

    it('deve retornar 400 quando faltam campos obrigatórios', async () => {
      // Arrange
      const dadosIncompletos = {
        email: 'teste@email.com',
        // Faltam nome e password
      }

      // Act
      const response = await request(app).post('/api/usuarios/cadastro').send(dadosIncompletos)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Dados de entrada inválidos')
    })
  })

  describe('POST /api/usuarios/login', () => {
    beforeEach(async () => {
      // Cria um usuário para testes de login
      await request(app).post('/api/usuarios/cadastro').send({
        nome: 'Usuário Login',
        email: 'login@email.com',
        password: 'senha123',
      })
    })

    it('deve fazer login com credenciais corretas', async () => {
      // Arrange
      const credenciais = {
        email: 'login@email.com',
        password: 'senha123',
      }

      // Act
      const response = await request(app).post('/api/usuarios/login').send(credenciais)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        usuario: {
          id: expect.any(Number),
          nome: 'Usuário Login',
          email: 'login@email.com',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        token: expect.any(String),
      })
    })

    it('deve retornar 401 para senha incorreta', async () => {
      // Arrange
      const credenciaisInvalidas = {
        email: 'login@email.com',
        password: 'senha-errada',
      }

      // Act
      const response = await request(app).post('/api/usuarios/login').send(credenciaisInvalidas)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Credenciais inválidas')
    })

    it('deve retornar 401 para email não cadastrado', async () => {
      // Arrange
      const credenciaisInvalidas = {
        email: 'naoexiste@email.com',
        password: 'senha123',
      }

      // Act
      const response = await request(app).post('/api/usuarios/login').send(credenciaisInvalidas)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })

    it('deve retornar 400 para dados de login inválidos', async () => {
      // Arrange
      const dadosInvalidos = {
        email: 'email-invalido',
        password: '123',
      }

      // Act
      const response = await request(app).post('/api/usuarios/login').send(dadosInvalidos)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Dados de entrada inválidos')
    })
  })

  describe('Rotas Protegidas - Requer Autenticação', () => {
    let token: string
    let usuarioId: number

    beforeEach(async () => {
      // Cria usuário e faz login para obter token
      const cadastroResponse = await request(app).post('/api/usuarios/cadastro').send({
        nome: 'Usuário Autenticado',
        email: 'auth@email.com',
        password: 'senha123',
      })

      usuarioId = cadastroResponse.body.id

      const loginResponse = await request(app).post('/api/usuarios/login').send({
        email: 'auth@email.com',
        password: 'senha123',
      })

      token = loginResponse.body.token
    })

    describe('GET /api/usuarios/me', () => {
      it('deve retornar dados do usuário autenticado', async () => {
        // Act
        const response = await request(app).get('/api/usuarios/me').set('Authorization', `Bearer ${token}`)

        // Assert
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
          id: usuarioId,
          nome: 'Usuário Autenticado',
          email: 'auth@email.com',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      })

      it('deve retornar 401 sem token', async () => {
        // Act
        const response = await request(app).get('/api/usuarios/me')
        // Sem header Authorization

        // Assert
        expect(response.status).toBe(401)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toContain('Token não fornecido')
      })

      it('deve retornar 401 com token inválido', async () => {
        // Act
        const response = await request(app).get('/api/usuarios/me').set('Authorization', 'Bearer token-invalido')

        // Assert
        expect(response.status).toBe(401)
        expect(response.body.success).toBe(false)
        expect(response.body.message).toContain('Token inválido')
      })
    })

    describe('PUT /api/usuarios/me', () => {
      it('deve atualizar nome do usuário', async () => {
        // Arrange
        const dadosAtualizacao = {
          nome: 'Nome Atualizado',
        }

        // Act
        const response = await request(app).put('/api/usuarios/me').set('Authorization', `Bearer ${token}`).send(dadosAtualizacao)

        // Assert
        expect(response.status).toBe(200)
        expect(response.body.nome).toBe('Nome Atualizado')
        expect(response.body.email).toBe('auth@email.com') // Email não mudou

        // Verifica no banco
        const usuarioAtualizado = await Usuario.findByPk(usuarioId)
        expect(usuarioAtualizado?.nome).toBe('Nome Atualizado')
      })

      it('deve atualizar email do usuário', async () => {
        // Arrange
        const dadosAtualizacao = {
          email: 'novoemail@email.com',
        }

        // Act
        const response = await request(app).put('/api/usuarios/me').set('Authorization', `Bearer ${token}`).send(dadosAtualizacao)

        // Assert
        expect(response.status).toBe(200)
        expect(response.body.email).toBe('novoemail@email.com')

        // Verifica no banco
        const usuarioAtualizado = await Usuario.findByPk(usuarioId)
        expect(usuarioAtualizado?.email).toBe('novoemail@email.com')
      })

      it('deve retornar 400 para email duplicado na atualização', async () => {
        // Arrange - Cria outro usuário
        await request(app).post('/api/usuarios/cadastro').send({
          nome: 'Outro Usuário',
          email: 'outro@email.com',
          password: 'senha123',
        })

        const dadosAtualizacao = {
          email: 'outro@email.com', // Email já em uso
        }

        // Act
        const response = await request(app).put('/api/usuarios/me').set('Authorization', `Bearer ${token}`).send(dadosAtualizacao)

        // Assert
        expect(response.status).toBe(400)
        expect(response.body.error).toContain('Email já está em uso')
      })
    })

    describe('DELETE /api/usuarios/me', () => {
      it('deve deletar usuário com sucesso', async () => {
        // Act
        const response = await request(app).delete('/api/usuarios/me').set('Authorization', `Bearer ${token}`)

        // Assert
        expect(response.status).toBe(204)

        // Verifica se foi deletado do banco
        const usuarioDeletado = await Usuario.findByPk(usuarioId)
        expect(usuarioDeletado).toBeNull()
      })

      it('deve retornar 401 sem autenticação', async () => {
        // Act
        const response = await request(app).delete('/api/usuarios/me')
        // Sem token

        // Assert
        expect(response.status).toBe(401)
      })
    })
  })
})
