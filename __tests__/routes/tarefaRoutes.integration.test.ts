// src/__tests__/routes/tarefaRoutes.integration.test.ts

import request from 'supertest'
import app from '../../src/app'
import { Usuario } from '../../src/database/models/Usuario'
import { Tarefa } from '../../src/database/models/Tarefa'
import { criarTarefa } from '../../src/factories/TarefaFactory'

describe('Rotas de Tarefa - Integração Real', () => {
  let token: string
  let usuarioId: number
  let outroUsuarioId: number
  let outroUsuarioToken: string

  beforeEach(async () => {
    // Limpa as tabelas
    await Tarefa.destroy({ where: {}, force: true })
    await Usuario.destroy({ where: {}, force: true })

    // Cria usuário principal e faz login para obter token
    const cadastroResponse = await request(app).post('/api/usuarios/cadastro').send({
      nome: 'Usuário Tarefa Teste',
      email: 'tarefa@email.com',
      password: 'senha123',
    })

    usuarioId = cadastroResponse.body.id

    const loginResponse = await request(app).post('/api/usuarios/login').send({
      email: 'tarefa@email.com',
      password: 'senha123',
    })

    token = loginResponse.body.token

    // Cria outro usuário para testes de segurança
    const outroCadastroResponse = await request(app).post('/api/usuarios/cadastro').send({
      nome: 'Outro Usuário',
      email: 'outro@email.com',
      password: 'senha123',
    })

    outroUsuarioId = outroCadastroResponse.body.id

    const outroLoginResponse = await request(app).post('/api/usuarios/login').send({
      email: 'outro@email.com',
      password: 'senha123',
    })

    outroUsuarioToken = outroLoginResponse.body.token
  })

  // --------------------------------------------------------------------
  // TESTES DE CRIAÇÃO
  // --------------------------------------------------------------------

  describe('POST /api/tarefas', () => {
    it('deve criar uma tarefa com sucesso', async () => {
      // Arrange
      const novaTarefa = {
        titulo: 'Minha primeira tarefa',
        descricao: 'Descrição da tarefa',
        status: 'pendente',
      }

      // Act
      const response = await request(app).post('/api/tarefas').set('Authorization', `Bearer ${token}`).send(novaTarefa)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        success: true,
        message: 'Tarefa criada com sucesso',
        data: {
          id: expect.any(Number),
          titulo: 'Minha primeira tarefa',
          descricao: 'Descrição da tarefa',
          status: 'pendente',
          usuarioId: usuarioId,
        },
      })

      // Verifica no banco
      const tarefaNoBanco = await Tarefa.findOne({ where: { titulo: 'Minha primeira tarefa' } })
      expect(tarefaNoBanco).toBeTruthy()
      expect(tarefaNoBanco?.usuarioId).toBe(usuarioId)
    })

    it('deve criar tarefa com dados mínimos', async () => {
      // Arrange
      const tarefaMinima = {
        titulo: 'Tarefa mínima',
      }

      // Act
      const response = await request(app).post('/api/tarefas').set('Authorization', `Bearer ${token}`).send(tarefaMinima)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body.data.titulo).toBe('Tarefa mínima')
      expect(response.body.data.descricao).toBeNull()
      expect(response.body.data.status).toBe('pendente') // valor default
    })

    it('deve criar tarefa com status concluída', async () => {
      // Arrange
      const tarefaConcluida = {
        titulo: 'Tarefa concluída',
        status: 'concluida',
      }

      // Act
      const response = await request(app).post('/api/tarefas').set('Authorization', `Bearer ${token}`).send(tarefaConcluida)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body.data.status).toBe('concluida')
    })

    it('deve IGNORAR usuarioId enviado no body e usar do token', async () => {
      // Arrange
      const novaTarefa = {
        titulo: 'Tentativa de criar para outro usuário',
        descricao: 'Descrição',
        status: 'pendente',
        usuarioId: outroUsuarioId, // ❌ Tentativa de criar para outro usuário
      }

      // Act
      const response = await request(app).post('/api/tarefas').set('Authorization', `Bearer ${token}`).send(novaTarefa)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body.data.usuarioId).toBe(usuarioId) // ✅ Usuário do token
    })

    it('deve retornar 400 para dados inválidos', async () => {
      // Arrange
      const tarefaInvalida = {
        titulo: '', // título vazio - inválido
        status: 'status_invalido', // status inválido
      }

      // Act
      const response = await request(app).post('/api/tarefas').set('Authorization', `Bearer ${token}`).send(tarefaInvalida)

      // Assert
      expect(response.status).toBe(400)
      // Verifica se retorna success: false OU se retorna a estrutura de erro do Zod
      if (response.body.success !== undefined) {
        expect(response.body.success).toBe(false)
      } else {
        // Se não tem success, verifica se tem error (estrutura do Zod/middleware)
        expect(response.body).toHaveProperty('error')
      }
    })

    it('deve retornar 401 sem autenticação', async () => {
      // Act
      const response = await request(app).post('/api/tarefas').send({
        titulo: 'Tarefa sem auth',
      })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE LISTAGEM
  // --------------------------------------------------------------------

  describe('GET /api/tarefas', () => {
    beforeEach(async () => {
      // Cria tarefas para teste
      await criarTarefa(usuarioId, { titulo: 'Tarefa 1', status: 'pendente' })
      await criarTarefa(usuarioId, { titulo: 'Tarefa 2', status: 'concluida' })
    })

    it('deve listar todas as tarefas do usuário', async () => {
      // Act
      const response = await request(app).get('/api/tarefas').set('Authorization', `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.dados).toHaveLength(2)
      expect(response.body.dados[0]).toMatchObject({
        id: expect.any(Number),
        titulo: expect.any(String),
        usuarioId: usuarioId,
      })
    })

    it('deve retornar array vazio quando não há tarefas', async () => {
      // Arrange - Limpa tarefas
      await Tarefa.destroy({ where: {}, force: true })

      // Act
      const response = await request(app).get('/api/tarefas').set('Authorization', `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.dados).toEqual([])
    })

    it('outro usuário não pode acessar tarefas do usuário principal', async () => {
      // Arrange - Cria tarefa para usuário principal
      await criarTarefa(usuarioId, { titulo: 'Tarefa Privada' })

      // Act - Outro usuário tenta listar tarefas
      const response = await request(app).get('/api/tarefas').set('Authorization', `Bearer ${outroUsuarioToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.dados).toHaveLength(0)
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE BUSCA POR ID
  // --------------------------------------------------------------------

  describe('GET /api/tarefas/:id', () => {
    let tarefaId: number

    beforeEach(async () => {
      const tarefa = await criarTarefa(usuarioId, {
        titulo: 'Tarefa específica',
        descricao: 'Descrição detalhada',
        status: 'pendente',
      })
      tarefaId = tarefa.id
    })

    it('deve buscar tarefa por ID com sucesso', async () => {
      // Act
      const response = await request(app).get(`/api/tarefas/${tarefaId}`).set('Authorization', `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: tarefaId,
          titulo: 'Tarefa específica',
          descricao: 'Descrição detalhada',
          status: 'pendente',
          usuarioId: usuarioId,
        },
      })
    })

    it('deve retornar 404 para tarefa não encontrada', async () => {
      // Act
      const response = await request(app).get('/api/tarefas/9999').set('Authorization', `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })

    it('deve retornar 403 quando outro usuário tenta buscar tarefa', async () => {
      // Act
      const response = await request(app).get(`/api/tarefas/${tarefaId}`).set('Authorization', `Bearer ${outroUsuarioToken}`)

      // Assert
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('deve retornar 400 para ID inválido', async () => {
      // Act
      const response = await request(app).get('/api/tarefas/abc').set('Authorization', `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(400)
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE ATUALIZAÇÃO
  // --------------------------------------------------------------------

  describe('PUT /api/tarefas/:id', () => {
    let tarefaId: number

    beforeEach(async () => {
      const tarefa = await criarTarefa(usuarioId, {
        titulo: 'Tarefa para atualizar',
        descricao: 'Descrição antiga',
        status: 'pendente',
      })
      tarefaId = tarefa.id
    })

    it('deve atualizar tarefa com sucesso', async () => {
      // Arrange
      const dadosAtualizacao = {
        titulo: 'Tarefa atualizada',
        descricao: 'Nova descrição',
        status: 'concluida',
      }

      // Act
      const response = await request(app).put(`/api/tarefas/${tarefaId}`).set('Authorization', `Bearer ${token}`).send(dadosAtualizacao)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        message: 'Tarefa atualizada com sucesso',
        data: {
          id: tarefaId,
          titulo: 'Tarefa atualizada',
          descricao: 'Nova descrição',
          status: 'concluida',
          usuarioId: usuarioId,
        },
      })
    })

    it('deve atualizar apenas o título', async () => {
      // Arrange
      const dadosParciais = {
        titulo: 'Apenas título atualizado',
      }

      // Act
      const response = await request(app).put(`/api/tarefas/${tarefaId}`).set('Authorization', `Bearer ${token}`).send(dadosParciais)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.data.titulo).toBe('Apenas título atualizado')
      expect(response.body.data.descricao).toBe('Descrição antiga')
    })

    it('deve retornar 403 quando outro usuário tenta atualizar', async () => {
      // Act
      const response = await request(app)
        .put(`/api/tarefas/${tarefaId}`)
        .set('Authorization', `Bearer ${outroUsuarioToken}`)
        .send({ titulo: 'Tentativa de Atualização' })

      // Assert
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE DELEÇÃO
  // --------------------------------------------------------------------

  describe('DELETE /api/tarefas/:id', () => {
    let tarefaId: number

    beforeEach(async () => {
      const tarefa = await criarTarefa(usuarioId, {
        titulo: 'Tarefa para deletar',
      })
      tarefaId = tarefa.id
    })

    it('deve deletar tarefa com sucesso', async () => {
      // Act
      const response = await request(app).delete(`/api/tarefas/${tarefaId}`).set('Authorization', `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Tarefa deletada com sucesso')

      // Verifica se foi deletado do banco
      const tarefaDeletada = await Tarefa.findByPk(tarefaId)
      expect(tarefaDeletada).toBeNull()
    })

    it('deve retornar 403 quando outro usuário tenta deletar', async () => {
      // Act
      const response = await request(app).delete(`/api/tarefas/${tarefaId}`).set('Authorization', `Bearer ${outroUsuarioToken}`)

      // Assert
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)

      // Verifica que a tarefa NÃO foi deletada
      const tarefaAindaExiste = await Tarefa.findByPk(tarefaId)
      expect(tarefaAindaExiste).toBeTruthy()
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE FILTROS
  // --------------------------------------------------------------------

  describe('GET /api/tarefas com filtros', () => {
    beforeEach(async () => {
      await criarTarefa(usuarioId, {
        titulo: 'Estudar TypeScript',
        status: 'pendente',
      })
      await criarTarefa(usuarioId, {
        titulo: 'Fazer exercícios',
        status: 'em_andamento',
      })
      await criarTarefa(usuarioId, {
        titulo: 'Reunião concluída',
        status: 'concluida',
      })
    })

    it('deve filtrar tarefas por status pendente', async () => {
      // Act
      const response = await request(app).get('/api/tarefas').query({ status: 'pendente' }).set('Authorization', `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.dados).toHaveLength(1)
      expect(response.body.dados[0].status).toBe('pendente')
    })

    it('deve filtrar tarefas por título', async () => {
      // Act
      const response = await request(app).get('/api/tarefas').query({ titulo: 'TypeScript' }).set('Authorization', `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.dados).toHaveLength(1)
      expect(response.body.dados[0].titulo).toBe('Estudar TypeScript')
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE ROTAS ESPECÍFICAS
  // --------------------------------------------------------------------

  describe('GET /api/tarefas/status/:status', () => {
    beforeEach(async () => {
      await criarTarefa(usuarioId, { titulo: 'Pendente 1', status: 'pendente' })
      await criarTarefa(usuarioId, { titulo: 'Pendente 2', status: 'pendente' })
      await criarTarefa(usuarioId, { titulo: 'Concluída 1', status: 'concluida' })
    })

    it('deve buscar tarefas por status específico', async () => {
      // Act
      const response = await request(app).get('/api/tarefas/status/pendente').set('Authorization', `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.dados).toHaveLength(2)
      response.body.dados.forEach((tarefa: Tarefa) => {
        expect(tarefa.status).toBe('pendente')
      })
    })
  })

  describe('GET /api/tarefas/usuario/:usuarioId', () => {
    beforeEach(async () => {
      await criarTarefa(usuarioId, { titulo: 'Tarefa Usuário 1' })
      await criarTarefa(outroUsuarioId, { titulo: 'Tarefa Usuário 2' })
    })

    it('deve buscar tarefas do usuário específico', async () => {
      // Act
      const response = await request(app).get(`/api/tarefas/usuario/${usuarioId}`).set('Authorization', `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].usuarioId).toBe(usuarioId)
    })

    it('deve retornar 403 ao tentar acessar tarefas de outro usuário', async () => {
      // Act
      const response = await request(app).get(`/api/tarefas/usuario/${outroUsuarioId}`).set('Authorization', `Bearer ${token}`)

      // Assert
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  // --------------------------------------------------------------------
  // FLUXO COMPLETO
  // --------------------------------------------------------------------

  describe('Fluxo Completo de Tarefa', () => {
    it('deve completar fluxo: criar → listar → buscar → atualizar → deletar', async () => {
      // 1. Criar tarefa
      const criarResponse = await request(app).post('/api/tarefas').set('Authorization', `Bearer ${token}`).send({
        titulo: 'Tarefa Fluxo Completo',
        descricao: 'Descrição do fluxo',
        status: 'pendente',
      })

      expect(criarResponse.status).toBe(201)
      const tarefaId = criarResponse.body.data.id

      // 2. Listar tarefas
      const listarResponse = await request(app).get('/api/tarefas').set('Authorization', `Bearer ${token}`)

      expect(listarResponse.status).toBe(200)
      expect(listarResponse.body.dados.some((t: Tarefa) => t.id === tarefaId)).toBe(true)

      // 3. Buscar tarefa específica
      const buscarResponse = await request(app).get(`/api/tarefas/${tarefaId}`).set('Authorization', `Bearer ${token}`)

      expect(buscarResponse.status).toBe(200)
      expect(buscarResponse.body.data.titulo).toBe('Tarefa Fluxo Completo')

      // 4. Atualizar tarefa
      const atualizarResponse = await request(app).put(`/api/tarefas/${tarefaId}`).set('Authorization', `Bearer ${token}`).send({
        titulo: 'Tarefa Atualizada Fluxo',
        status: 'concluida',
      })

      expect(atualizarResponse.status).toBe(200)
      expect(atualizarResponse.body.data.titulo).toBe('Tarefa Atualizada Fluxo')

      // 5. Deletar tarefa
      const deletarResponse = await request(app).delete(`/api/tarefas/${tarefaId}`).set('Authorization', `Bearer ${token}`)

      expect(deletarResponse.status).toBe(200)
      expect(deletarResponse.body.success).toBe(true)
    })
  })
})
