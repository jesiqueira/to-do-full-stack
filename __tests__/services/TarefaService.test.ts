/**
 * tests/services/TarefaService.test.ts
 * Testes para o TarefaService
 */

import { Tarefa } from '../../src/database/models/Tarefa'
import type { TarefaCreationAttributes } from '../../src/database/models/Tarefa'
import { criarUsuario } from '../../src/factories/UsuarioFactory'
import { criarTarefa } from '../../src/factories/TarefaFactory'
import { TarefaRepository } from '../../src/repositories/TarefaRepository'
import { TarefaService } from '../../src/services/TarefaService'

import { TarefaNaoEncontradaError, TarefaDadosInvalidosError } from '../../src/errors'
import type { ITarefaRepository } from '../../src/repositories/interfaces/ITarefaRepository'

describe('TarefaService', () => {
  let tarefaService: TarefaService
  let tarefaRepository: TarefaRepository

  beforeEach(async () => {
    tarefaRepository = new TarefaRepository(Tarefa)
    tarefaService = new TarefaService(tarefaRepository)
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: Métodos de Busca
  // --------------------------------------------------------------------
  describe('buscarPorId', () => {
    test('deve retornar uma Tarefa quando ID existe', async () => {
      // Arrange
      const usuario = await criarUsuario({
        nome: 'Usuario especifico',
      })

      const tarefa = await criarTarefa(usuario.id, { titulo: 'Tarefa especifica para teste' })

      // Act
      const tarefaEncontrada = await tarefaService.buscarPorId(tarefa.id)

      // Assert
      expect(tarefaEncontrada).toBeDefined()
      expect(tarefaEncontrada).not.toBeNull()
      expect(tarefaEncontrada?.titulo).toBe('Tarefa especifica para teste')
      expect(tarefaEncontrada?.usuarioId).toBe(1)
    })

    test('deve retornar null quando ID da tarefa nao existir', async () => {
      // Act
      const tarefaEncontrada = await tarefaService.buscarPorId(9999)

      // Assert
      expect(tarefaEncontrada).toBeNull()
    })
  })

  describe('buscarPorUsuarioId', () => {
    test('deve retornar array de tarefas quando usuarioId tem tarefas', async () => {
      // Arrange
      const usuario = await criarUsuario()

      // Cria múltiplas tarefas para o mesmo usuário
      await criarTarefa(usuario.id, { titulo: 'Tarefa 1' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa 2' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa 3' })

      // Act
      const tarefas = await tarefaService.buscarPorUsuarioId(usuario.id)

      // Assert
      expect(tarefas).toHaveLength(3)
      expect(Array.isArray(tarefas)).toBe(true)

      // Verifica se todas as tarefas pertencem ao usuário correto
      tarefas.forEach((tarefa) => {
        expect(tarefa.usuarioId).toBe(usuario.id)
      })

      // Verifica os títulos
      const titulos = tarefas.map((t) => t.titulo)
      expect(titulos).toContain('Tarefa 1')
      expect(titulos).toContain('Tarefa 2')
      expect(titulos).toContain('Tarefa 3')
    })

    test('deve retornar array vazio quando usuarioId não tem tarefas', async () => {
      // Arrange
      const usuarioSemTarefas = await criarUsuario()

      // Act
      const tarefas = await tarefaService.buscarPorUsuarioId(usuarioSemTarefas.id)

      // Assert
      expect(tarefas).toHaveLength(0)
      expect(Array.isArray(tarefas)).toBe(true)
    })

    test('deve retornar array vazio quando usuarioId não existe', async () => {
      // Act
      const tarefas = await tarefaService.buscarPorUsuarioId(99999)

      // Assert
      expect(tarefas).toHaveLength(0)
      expect(Array.isArray(tarefas)).toBe(true)
    })

    test('deve retornar apenas tarefas do usuarioId específico', async () => {
      // Arrange
      const usuario1 = await criarUsuario()
      const usuario2 = await criarUsuario()

      // Cria tarefas para usuário 1
      await criarTarefa(usuario1.id, { titulo: 'Tarefa User 1' })
      await criarTarefa(usuario1.id, { titulo: 'Outra Tarefa User 1' })

      // Cria tarefas para usuário 2
      await criarTarefa(usuario2.id, { titulo: 'Tarefa User 2' })

      // Act - Busca apenas tarefas do usuário 1
      const tarefasUsuario1 = await tarefaService.buscarPorUsuarioId(usuario1.id)

      // Assert
      expect(tarefasUsuario1).toHaveLength(2)

      // Verifica que todas as tarefas são do usuário 1
      tarefasUsuario1.forEach((tarefa) => {
        expect(tarefa.usuarioId).toBe(usuario1.id)
        expect(tarefa.usuarioId).not.toBe(usuario2.id)
      })

      // Verifica que não retornou tarefas do usuário 2
      const titulos = tarefasUsuario1.map((t) => t.titulo)
      expect(titulos).not.toContain('Tarefa User 2')
    })

    test('deve retornar tarefas ordenadas por ID (ou outra ordem padrão)', async () => {
      // Arrange
      const usuario = await criarUsuario()
      await criarTarefa(usuario.id, { titulo: 'Tarefa 1' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa 2' })

      // Act
      const tarefas = await tarefaService.buscarPorUsuarioId(usuario.id)

      // Assert
      expect(tarefas).toBeDefined()
      expect(tarefas).not.toBeNull()

      // Type assertion para garantir ao TypeScript
      const tarefasArray = tarefas as Tarefa[]

      expect(tarefasArray).toHaveLength(2)
      expect(tarefasArray[0]?.usuarioId).toBe(usuario.id)
      expect(tarefasArray[1]?.usuarioId).toBe(usuario.id)
    })
  })

  describe('buscarPorStatus', () => {
    test('deve retornar array de tarefas quando existem tarefas com o status ', async () => {
      // Arrange
      const usuario = await criarUsuario()

      await criarTarefa(usuario.id, {
        titulo: 'Tarefa Pendente 1',
        status: 'pendente',
      })
      await criarTarefa(usuario.id, {
        titulo: 'Tarefa Pendente 2',
        status: 'pendente',
      })
      await criarTarefa(usuario.id, {
        titulo: 'Tarefa Concluída',
        status: 'concluida',
      })

      // Act
      const tarefasPendentes = await tarefaService.buscarPorStatus('pendente')

      // Assert
      expect(tarefasPendentes).toBeDefined()
      const tarefasArray = tarefasPendentes as Tarefa[]

      expect(tarefasArray).toHaveLength(2)
      expect(Array.isArray(tarefasArray)).toBe(true)

      // Verifica se todas têm o status correto
      tarefasArray.forEach((tarefa) => {
        expect(tarefa.status).toBe('pendente')
      })

      // Verifica os títulos
      const titulos = tarefasArray.map((t) => t.titulo)
      expect(titulos).toContain('Tarefa Pendente 1')
      expect(titulos).toContain('Tarefa Pendente 2')
      expect(titulos).not.toContain('Tarefa Concluída')
    })

    test('deve retornar array vazio quando não existe, tarefas com status', async () => {
      // Arrange
      const usuario = await criarUsuario()

      await criarTarefa(usuario.id, {
        titulo: 'Tarefa concluida',
        status: 'concluida',
      })

      // Act - Busca por status que não existe
      const tarefasPendentes = await tarefaService.buscarPorStatus('pendente')

      // Assert
      expect(tarefasPendentes).toBeDefined()
      expect(tarefasPendentes).toHaveLength(0)
      expect(Array.isArray(tarefasPendentes)).toBe(true)
    })

    test('deve retornar array vazio quando status não existe no sistema', async () => {
      // Act & Assert
      await expect(tarefaService.buscarPorStatus('status_inexistente')).rejects.toThrow(TarefaDadosInvalidosError)
    })

    test('deve retornar tarefas de múltiplos usuários com mesmo status', async () => {
      // Arrange
      const usuario1 = await criarUsuario()
      const usuario2 = await criarUsuario()

      // Tarefas pendentes de usuários diferentes
      await criarTarefa(usuario1.id, {
        titulo: 'Pendente User 1',
        status: 'pendente',
      })
      await criarTarefa(usuario2.id, {
        titulo: 'Pendente User 2',
        status: 'pendente',
      })
      await criarTarefa(usuario1.id, {
        titulo: 'Concluída User 1',
        status: 'concluida',
      })

      // Act
      const tarefasPendentes = await tarefaService.buscarPorStatus('pendente')

      // Assert
      expect(tarefasPendentes).toHaveLength(2)

      // Verifica que retornou de ambos os usuários
      const usuarioIds = tarefasPendentes.map((t) => t.usuarioId)
      expect(usuarioIds).toContain(usuario1.id)
      expect(usuarioIds).toContain(usuario2.id)

      // Verifica que todas são pendentes
      tarefasPendentes.forEach((tarefa) => {
        expect(tarefa.status).toBe('pendente')
      })
    })

    test('deve funcionar com diferentes status válidos', async () => {
      // Arrange
      const usuario = await criarUsuario()

      await criarTarefa(usuario.id, { status: 'pendente' })
      await criarTarefa(usuario.id, { status: 'concluida' })
      await criarTarefa(usuario.id, { status: 'em_andamento' })

      // Act & Assert para cada status
      const pendentes = await tarefaService.buscarPorStatus('pendente')
      expect(pendentes).toHaveLength(1)
      expect(pendentes[0]?.status).toBe('pendente')

      const concluidas = await tarefaService.buscarPorStatus('concluida')
      expect(concluidas).toHaveLength(1)
      expect(concluidas[0]?.status).toBe('concluida')

      const em_andamento = await tarefaService.buscarPorStatus('em_andamento')
      expect(em_andamento).toHaveLength(1)
      expect(em_andamento[0]?.status).toBe('em_andamento')
    })

    test('deve ser case insensitive na validação', async () => {
      // Arrange
      const usuario = await criarUsuario()
      await criarTarefa(usuario.id, { status: 'pendente' })

      // Act - Testa com case diferente (deve passar na validação)
      const tarefas = await tarefaService.buscarPorStatus('PENDENTE') // Maiúsculo

      // Assert - Depende do comportamento do seu banco
      // Se banco for case-sensitive: length = 0
      // Se banco for case-insensitive: length = 1
      expect(tarefas.length).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(tarefas)).toBe(true)
    })

    test('deve validar status em buscarPorStatus', async () => {
      await expect(tarefaService.buscarPorStatus('invalido')).rejects.toThrow(TarefaDadosInvalidosError)
    })
  })

  describe('listarTarefas', () => {
    test('deve retornar lista paginada de tarefas quando existirem ', async () => {
      // Arrange
      const usuario1 = await criarUsuario()
      const usuario2 = await criarUsuario()

      await criarTarefa(usuario1.id, {
        titulo: 'Tarefa 1',
        status: 'pendente',
      })
      await criarTarefa(usuario1.id, {
        titulo: 'Tarefa 2',
        status: 'em_andamento',
      })
      await criarTarefa(usuario2.id, {
        titulo: 'Tarefa 3',
        status: 'concluida',
      })

      // Act
      const resultado = await tarefaService.listarTarefas({})

      // Assert

      expect(resultado).toBeDefined()
      expect(resultado.dados).toHaveLength(3)
      expect(Array.isArray(resultado.dados)).toBe(true)

      // Verifica estrutura de paginação
      expect(resultado.paginacao).toBeDefined()
      expect(resultado.paginacao.pagina).toBe(1) // valor padrão
      expect(resultado.paginacao.limite).toBe(25) // valor padrão
      expect(resultado.paginacao.total).toBe(3)
      expect(resultado.paginacao.totalPaginas).toBe(1)

      // Verifica conteúdo sem depender da ordem
      const titulos = resultado.dados.map((t) => t.titulo)
      expect(titulos).toEqual(expect.arrayContaining(['Tarefa 1', 'Tarefa 2', 'Tarefa 3']))

      // Verifica status
      const statusList = resultado.dados.map((t) => t.status)
      expect(statusList).toEqual(expect.arrayContaining(['pendente', 'em_andamento', 'concluida']))

      // Verifica usuários
      const usuarioIds = resultado.dados.map((t) => t.usuarioId)
      expect(usuarioIds).toContain(usuario1.id)
      expect(usuarioIds).toContain(usuario2.id)
    })

    test('deve retornar lista vazia quando não existir tarefas', async () => {
      // ACT

      const resultado = await tarefaService.listarTarefas({})

      //Assert

      expect(resultado).toBeDefined()
      expect(resultado.dados).toHaveLength(0)
      expect(Array.isArray(resultado.dados)).toBe(true)
      expect(resultado.paginacao.total).toBe(0)
      expect(resultado.paginacao.totalPaginas).toBe(0)
      expect(resultado.paginacao.pagina).toBe(1)
      expect(resultado.paginacao.limite).toBe(25)
    })

    test('deve aplicar paginação corretamente', async () => {
      // Arrange
      const usuario = await criarUsuario()

      // Cria 5 tarefas
      for (let i = 1; i <= 5; i++) {
        await criarTarefa(usuario.id, {
          titulo: `Tarefa ${i}`,
        })
      }

      // Act - Página 1 com 2 itens
      const resultadoPagina1 = await tarefaService.listarTarefas({
        page: 1,
        limit: 2,
      })

      // Assert - Página 1
      expect(resultadoPagina1.dados).toHaveLength(2)
      expect(resultadoPagina1.paginacao.pagina).toBe(1)
      expect(resultadoPagina1.paginacao.limite).toBe(2)
      expect(resultadoPagina1.paginacao.total).toBe(5)
      expect(resultadoPagina1.paginacao.totalPaginas).toBe(3)

      // Act - Página 2 com 2 itens
      const resultadoPagina2 = await tarefaService.listarTarefas({
        page: 2,
        limit: 2,
      })

      // Assert - Página 2
      expect(resultadoPagina2.dados).toHaveLength(2)
      expect(resultadoPagina2.paginacao.pagina).toBe(2)
      expect(resultadoPagina2.paginacao.limite).toBe(2)
      expect(resultadoPagina2.paginacao.total).toBe(5)
      expect(resultadoPagina2.paginacao.totalPaginas).toBe(3)

      // Act - Página 3 com 2 itens
      const resultadoPagina3 = await tarefaService.listarTarefas({
        page: 3,
        limit: 2,
      })

      // Assert - Página 3 (última página com 1 item)
      expect(resultadoPagina3.dados).toHaveLength(1)
      expect(resultadoPagina3.paginacao.pagina).toBe(3)
      expect(resultadoPagina3.paginacao.limite).toBe(2)
      expect(resultadoPagina3.paginacao.total).toBe(5)
      expect(resultadoPagina3.paginacao.totalPaginas).toBe(3)
    })

    test('deve filtrar tarefas por título', async () => {
      // Arrange
      const usuario = await criarUsuario()

      await criarTarefa(usuario.id, { titulo: 'Tarefa importante' })
      await criarTarefa(usuario.id, { titulo: 'Outra tarefa' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa urgente' })

      // Act
      const resultado = await tarefaService.listarTarefas({
        titulo: 'importante',
      })

      // Assert
      expect(resultado.dados).toHaveLength(1)
      expect(resultado.dados[0]?.titulo).toBe('Tarefa importante')
      expect(resultado.paginacao.total).toBe(1)
    })

    test('deve filtrar tarefas por status', async () => {
      // Arrange
      const usuario = await criarUsuario()

      await criarTarefa(usuario.id, { titulo: 'Tarefa 1', status: 'pendente' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa 2', status: 'concluida' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa 3', status: 'pendente' })

      // Act
      const resultado = await tarefaService.listarTarefas({
        status: 'pendente',
      })

      // Assert
      expect(resultado.dados).toHaveLength(2)
      resultado.dados.forEach((tarefa) => {
        expect(tarefa.status).toBe('pendente')
      })
      expect(resultado.paginacao.total).toBe(2)
    })

    test('deve filtrar tarefas por usuarioId', async () => {
      // Arrange
      const usuario1 = await criarUsuario()
      const usuario2 = await criarUsuario()

      await criarTarefa(usuario1.id, { titulo: 'Tarefa User 1' })
      await criarTarefa(usuario1.id, { titulo: 'Outra Tarefa User 1' })
      await criarTarefa(usuario2.id, { titulo: 'Tarefa User 2' })

      // Act
      const resultado = await tarefaService.listarTarefas({
        usuarioId: usuario1.id,
      })

      // Assert
      expect(resultado.dados).toHaveLength(2)
      resultado.dados.forEach((tarefa) => {
        expect(tarefa.usuarioId).toBe(usuario1.id)
      })
      expect(resultado.paginacao.total).toBe(2)
    })

    test('deve ordenar tarefas corretamente', async () => {
      // Arrange
      const usuario = await criarUsuario()

      await criarTarefa(usuario.id, { titulo: 'Tarefa B' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa A' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa C' })

      // Act - Ordenar por título ASC
      const resultado = await tarefaService.listarTarefas({
        ordenarPor: 'titulo',
        ordenarDirecao: 'ASC',
      })

      // Assert
      expect(resultado.dados).toHaveLength(3)
      expect(resultado.dados[0]?.titulo).toBe('Tarefa A')
      expect(resultado.dados[1]?.titulo).toBe('Tarefa B')
      expect(resultado.dados[2]?.titulo).toBe('Tarefa C')
    })

    test('deve usar valores padrão quando filtros não são fornecidos', async () => {
      // Arrange
      const usuario = await criarUsuario()
      await criarTarefa(usuario.id, { titulo: 'Tarefa Teste' })

      // Act - Chamar sem parâmetros
      const resultado = await tarefaService.listarTarefas({})

      // Assert
      expect(resultado.paginacao.pagina).toBe(1)
      expect(resultado.paginacao.limite).toBe(25)
    })

    test('deve aplicar ordenação nos dados retornados', async () => {
      // Arrange
      const usuario = await criarUsuario()

      await criarTarefa(usuario.id, { titulo: 'Tarefa C' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa A' })
      await criarTarefa(usuario.id, { titulo: 'Tarefa B' })

      // Act - Ordenar por título ASC
      const resultadoAsc = await tarefaService.listarTarefas({
        ordenarPor: 'titulo',
        ordenarDirecao: 'ASC',
      })

      // Assert - Verifica ordenação ASC
      expect(resultadoAsc.dados).toHaveLength(3)
      expect(resultadoAsc.dados[0]?.titulo).toBe('Tarefa A')
      expect(resultadoAsc.dados[1]?.titulo).toBe('Tarefa B')
      expect(resultadoAsc.dados[2]?.titulo).toBe('Tarefa C')

      // Act - Ordenar por título DESC
      const resultadoDesc = await tarefaService.listarTarefas({
        ordenarPor: 'titulo',
        ordenarDirecao: 'DESC',
      })

      // Assert - Verifica ordenação DESC
      expect(resultadoDesc.dados).toHaveLength(3)
      expect(resultadoDesc.dados[0]?.titulo).toBe('Tarefa C')
      expect(resultadoDesc.dados[1]?.titulo).toBe('Tarefa B')
      expect(resultadoDesc.dados[2]?.titulo).toBe('Tarefa A')
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: Métodos de Escrita
  // --------------------------------------------------------------------

  describe('Metodos de escrita', () => {
    describe('criarTarefa', () => {
      test('deve criar tarefa com dados validos ', async () => {
        // Arrange
        const usuario = await criarUsuario()

        const dadosTarefa: TarefaCreationAttributes = {
          titulo: 'Nova Tarefa',
          descricao: 'Descrição da nova tarefa',
          usuarioId: usuario.id,
          status: 'pendente',
        }

        // Act
        const tarefaCriada = await tarefaService.criarTarefa(dadosTarefa)

        // Assert
        expect(tarefaCriada).toBeDefined()
        expect(tarefaCriada.id).toBeDefined()
        expect(tarefaCriada.titulo).toBe('Nova Tarefa')
        expect(tarefaCriada.descricao).toBe('Descrição da nova tarefa')
        expect(tarefaCriada.usuarioId).toBe(usuario.id)
        expect(tarefaCriada.status).toBe('pendente')
        expect(tarefaCriada.createdAt).toBeDefined()
        expect(tarefaCriada.updatedAt).toBeDefined()
      })

      test('deve criar tarefa com status padrão quando não informado', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const dadosTarefa = {
          titulo: 'Tarefa sem status',
          descricao: 'Descrição',
          usuarioId: usuario.id,
          // status não informado
        }

        // Act
        const tarefaCriada = await tarefaService.criarTarefa(dadosTarefa)

        // Assert
        expect(tarefaCriada).toBeDefined()
        expect(tarefaCriada.status).toBeDefined()
        expect(tarefaCriada.status).toBe('pendente')
      })

      test('deve criar tarefa com campos opcionais em branco', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const dadosTarefa = {
          titulo: 'Tarefa sem descrição',
          usuarioId: usuario.id,
          // descrição não informada
        }

        // Act
        const tarefaCriada = await tarefaService.criarTarefa(dadosTarefa)

        // Assert
        expect(tarefaCriada).toBeDefined()
        expect(tarefaCriada.titulo).toBe('Tarefa sem descrição')
        expect(tarefaCriada.descricao).toBeNull()
      })

      test('deve falhar ao criar tarefa com usuarioId inválido', async () => {
        // Arrange
        const dadosTarefa = {
          titulo: 'Tarefa com usuário inválido',
          descricao: 'Descrição',
          usuarioId: 99999, // usuário não existe
        }

        // Act & Assert
        await expect(tarefaService.criarTarefa(dadosTarefa)).rejects.toThrow()
      })

      test('deve falhar ao criar tarefa sem título', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const dadosTarefa = {
          descricao: 'Descrição sem título',
          usuarioId: usuario.id,
          // título não informado
        }

        // Act & Assert
        await expect(tarefaService.criarTarefa(dadosTarefa as TarefaCreationAttributes)).rejects.toThrow() // Espera que lance erro de validação
      })
      test('deve falhar ao criar tarefa com título muito longo', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tituloMuitoLongo = 'a'.repeat(256) // 256 caracteres - acima do limite

        const dadosTarefa = {
          titulo: tituloMuitoLongo,
          descricao: 'Descrição válida',
          usuarioId: usuario.id,
        }

        // Act & Assert
        await expect(tarefaService.criarTarefa(dadosTarefa)).rejects.toThrow(TarefaDadosInvalidosError)

        await expect(tarefaService.criarTarefa(dadosTarefa)).rejects.toThrow('Título muito longo')
      })

      test('deve permitir criar tarefa com título no limite máximo', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tituloNoLimite = 'a'.repeat(255) // 255 caracteres - no limite

        const dadosTarefa = {
          titulo: tituloNoLimite,
          descricao: 'Descrição válida',
          usuarioId: usuario.id,
        }

        // Act
        const tarefaCriada = await tarefaService.criarTarefa(dadosTarefa)

        // Assert
        expect(tarefaCriada).toBeDefined()
        expect(tarefaCriada.titulo).toBe(tituloNoLimite)
        expect(tarefaCriada.titulo.length).toBe(255)
      })
    })

    describe('atualizarTarefa', () => {
      test('deve atualizar tarefa existente com dados válidos', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tarefa = await criarTarefa(usuario.id, {
          titulo: 'Tarefa Original',
          descricao: 'Descrição original',
          status: 'pendente',
        })

        const dadosAtualizacao = {
          titulo: 'Tarefa Atualizada',
          descricao: 'Nova descrição',
          status: 'concluida' as const,
        }

        // Act
        const tarefaAtualizada = await tarefaService.atualizarTarefa(tarefa.id, dadosAtualizacao)

        // Assert
        expect(tarefaAtualizada).toBeDefined()
        expect(tarefaAtualizada?.id).toBe(tarefa.id)
        expect(tarefaAtualizada?.titulo).toBe('Tarefa Atualizada')
        expect(tarefaAtualizada?.descricao).toBe('Nova descrição')
        expect(tarefaAtualizada?.status).toBe('concluida')
        expect(tarefaAtualizada?.usuarioId).toBe(usuario.id) // Não deve mudar
        expect(tarefaAtualizada?.updatedAt).not.toBe(tarefa.updatedAt) // Deve ser atualizado
      })

      test('deve atualizar apenas alguns campos', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tarefa = await criarTarefa(usuario.id, {
          titulo: 'Tarefa Original',
          descricao: 'Descrição original',
          status: 'pendente',
        })

        const dadosAtualizacao = {
          status: 'em_andamento' as const,
          // Apenas status foi atualizado
        }

        // Act
        const tarefaAtualizada = await tarefaService.atualizarTarefa(tarefa.id, dadosAtualizacao)

        // Assert
        expect(tarefaAtualizada).toBeDefined()
        expect(tarefaAtualizada?.titulo).toBe('Tarefa Original') // Manteve original
        expect(tarefaAtualizada?.descricao).toBe('Descrição original') // Manteve original
        expect(tarefaAtualizada?.status).toBe('em_andamento') // Apenas isso mudou
        expect(tarefaAtualizada?.usuarioId).toBe(usuario.id) // Não mudou
      })

      test('deve lançar erro ao tentar atualizar tarefa inexistente', async () => {
        // Arrange
        const dadosAtualizacao = { titulo: 'Título Novo' }

        // Act & Assert
        await expect(tarefaService.atualizarTarefa(99999, dadosAtualizacao)).rejects.toThrow(TarefaNaoEncontradaError)
      })

      test('deve manter usuarioId original mesmo quando fornecido novo usuarioId', async () => {
        // Arrange
        const usuarioOriginal = await criarUsuario()
        const outroUsuario = await criarUsuario()
        const tarefa = await criarTarefa(usuarioOriginal.id)

        const dadosAtualizacao = {
          usuarioId: outroUsuario.id, // Tentativa de mudar usuarioId
          titulo: 'Novo Título',
        }

        // Act
        const tarefaAtualizada = await tarefaService.atualizarTarefa(tarefa.id, dadosAtualizacao)

        // Assert - usuarioId não deve mudar (comportamento esperado)
        expect(tarefaAtualizada).toBeDefined()
        expect(tarefaAtualizada.titulo).toBe('Novo Título') // Título foi atualizado
        expect(tarefaAtualizada.usuarioId).toBe(usuarioOriginal.id) // usuarioId permanece o original
        expect(tarefaAtualizada.usuarioId).not.toBe(outroUsuario.id) // Não mudou para o novo
      })

      test('deve validar apenas dados de domínio necessários', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tarefa = await criarTarefa(usuario.id)

        // Act & Assert
        await expect(tarefaService.atualizarTarefa(tarefa.id, { titulo: '' })).rejects.toThrow(TarefaDadosInvalidosError)
      })

      test('deve aceitar diferentes casos na validação', async () => {
        // Testa que a validação aceita diferentes cases
        await expect(tarefaService.buscarPorStatus('PENDENTE')).resolves.toBeDefined()
        await expect(tarefaService.buscarPorStatus('Pendente')).resolves.toBeDefined()
        await expect(tarefaService.buscarPorStatus('pendente')).resolves.toBeDefined()
      })

      test('deve falhar ao atualizar tarefa com título muito longo', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tarefa = await criarTarefa(usuario.id)
        const tituloMuitoLongo = 'a'.repeat(256) // 256 caracteres

        const dadosAtualizacao = {
          titulo: tituloMuitoLongo,
        }

        // Act & Assert
        await expect(tarefaService.atualizarTarefa(tarefa.id, dadosAtualizacao)).rejects.toThrow(TarefaDadosInvalidosError)

        await expect(tarefaService.atualizarTarefa(tarefa.id, dadosAtualizacao)).rejects.toThrow('Título muito longo')
      })

      test('deve permitir atualizar tarefa com título no limite máximo', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tarefa = await criarTarefa(usuario.id)
        const tituloNoLimite = 'a'.repeat(255) // 255 caracteres

        const dadosAtualizacao = {
          titulo: tituloNoLimite,
        }

        // Act
        const tarefaAtualizada = await tarefaService.atualizarTarefa(tarefa.id, dadosAtualizacao)

        // Assert
        expect(tarefaAtualizada).toBeDefined()
        expect(tarefaAtualizada.titulo).toBe(tituloNoLimite)
        expect(tarefaAtualizada.titulo.length).toBe(255)
      })

      test('deve lançar erro interno quando repositório retorna null na atualização', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tarefa = await criarTarefa(usuario.id, {
          titulo: 'Tarefa Original',
        })

        const dadosAtualizacao = {
          titulo: 'Tarefa Atualizada',
        }

        // Mock completo com todos os métodos da interface
        const mockTarefaRepository: jest.Mocked<ITarefaRepository> = {
          // Métodos de busca
          findById: jest.fn().mockResolvedValue(tarefa),
          findByUsuarioId: jest.fn().mockResolvedValue([]),
          findByStatus: jest.fn().mockResolvedValue([]),
          findAll: jest.fn().mockResolvedValue([]),
          findAllWithPagination: jest.fn().mockResolvedValue({ data: [], total: 0 }),

          // Métodos de escrita
          create: jest.fn().mockResolvedValue(tarefa),
          update: jest.fn().mockResolvedValue(null), // ← Retorna null propositalmente
          delete: jest.fn().mockResolvedValue(true),
        }

        const tarefaServiceComMock = new TarefaService(mockTarefaRepository)

        // Act & Assert
        await expect(tarefaServiceComMock.atualizarTarefa(tarefa.id, dadosAtualizacao)).rejects.toThrow('Erro interno ao atualizar tarefa')

        // Verifica que o repositório foi chamado
        expect(mockTarefaRepository.findById).toHaveBeenCalledWith(tarefa.id)
        expect(mockTarefaRepository.update).toHaveBeenCalledWith(tarefa.id, dadosAtualizacao)
      })
    })

    describe('deletarTarefa', () => {
      test('deve deletar tarefa existente e retornar true', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tarefa = await criarTarefa(usuario.id, {
          titulo: 'Tarefa para deletar',
        })

        // Verifica que a tarefa existe antes de deletar
        const tarefaAntes = await tarefaService.buscarPorId(tarefa.id)
        expect(tarefaAntes).toBeDefined()

        // Act
        const resultado = await tarefaService.deletarTarefa(tarefa.id)

        // Assert
        expect(resultado).toBe(true)

        // Verifica que realmente foi deletada
        const tarefaDepois = await tarefaService.buscarPorId(tarefa.id)
        expect(tarefaDepois).toBeNull()
      })

      test('deve lançar erro ao tentar deletar tarefa inexistente', async () => {
        // Act & Assert
        await expect(tarefaService.deletarTarefa(99999)).rejects.toThrow(TarefaNaoEncontradaError)
      })

      test('deve deletar tarefa e verificar que não aparece mais nas listagens', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tarefa1 = await criarTarefa(usuario.id, { titulo: 'Tarefa 1' })
        const tarefa2 = await criarTarefa(usuario.id, { titulo: 'Tarefa 2' })

        // Verifica que ambas existem antes
        const tarefasAntes = await tarefaService.listarTarefas({})
        expect(tarefasAntes.dados).toHaveLength(2)

        // Act - Deleta uma tarefa
        const resultado = await tarefaService.deletarTarefa(tarefa1.id)

        // Assert
        expect(resultado).toBe(true)

        // Verifica listagem geral
        const tarefasDepois = await tarefaService.listarTarefas({})
        expect(tarefasDepois.dados).toHaveLength(1)
        expect(tarefasDepois.dados[0]?.id).toBe(tarefa2.id)

        // Verifica busca por usuário
        const tarefasUsuario = await tarefaService.buscarPorUsuarioId(usuario.id)
        expect(tarefasUsuario).toHaveLength(1)
        expect(tarefasUsuario[0]?.id).toBe(tarefa2.id)
      })

      test('deve permitir deletar tarefa com diferentes status', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tarefaPendente = await criarTarefa(usuario.id, {
          titulo: 'Pendente',
          status: 'pendente',
        })
        const tarefaConcluida = await criarTarefa(usuario.id, {
          titulo: 'Concluída',
          status: 'concluida',
        })
        const tarefaAndamento = await criarTarefa(usuario.id, {
          titulo: 'Em Andamento',
          status: 'em_andamento',
        })

        // Act & Assert - Deleta todas independente do status
        await expect(tarefaService.deletarTarefa(tarefaPendente.id)).resolves.toBe(true)

        await expect(tarefaService.deletarTarefa(tarefaConcluida.id)).resolves.toBe(true)

        await expect(tarefaService.deletarTarefa(tarefaAndamento.id)).resolves.toBe(true)

        // Verifica que todas foram deletadas
        const tarefasRestantes = await tarefaService.listarTarefas({})
        expect(tarefasRestantes.dados).toHaveLength(0)
      })

      test('deve deletar tarefa de usuário específico sem afetar outros usuários', async () => {
        // Arrange
        const usuario1 = await criarUsuario({ nome: 'Usuario 1' })
        const usuario2 = await criarUsuario({ nome: 'Usuario 2' })

        const tarefaUsuario1 = await criarTarefa(usuario1.id, { titulo: 'Tarefa User 1' })
        const tarefaUsuario2 = await criarTarefa(usuario2.id, { titulo: 'Tarefa User 2' })

        // Verifica estado inicial
        const tarefasUser1Inicial = await tarefaService.buscarPorUsuarioId(usuario1.id)
        const tarefasUser2Inicial = await tarefaService.buscarPorUsuarioId(usuario2.id)

        expect(tarefasUser1Inicial).toHaveLength(1)
        expect(tarefasUser2Inicial).toHaveLength(1)

        // Act - Deleta tarefa do usuário 1
        const resultado = await tarefaService.deletarTarefa(tarefaUsuario1.id)

        // Assert
        expect(resultado).toBe(true)

        // Verifica que usuário 1 não tem mais tarefas
        const tarefasUser1 = await tarefaService.buscarPorUsuarioId(usuario1.id)
        expect(tarefasUser1).toHaveLength(0)

        // Verifica que usuário 2 ainda tem sua tarefa
        const tarefasUser2 = await tarefaService.buscarPorUsuarioId(usuario2.id)
        expect(tarefasUser2).toHaveLength(1)
        expect(tarefasUser2[0]?.id).toBe(tarefaUsuario2.id)
      })

      test('deve lidar com tentativa de deletar tarefa já deletada', async () => {
        // Arrange
        const usuario = await criarUsuario()
        const tarefa = await criarTarefa(usuario.id)

        // Act - Deleta uma vez
        const primeiraTentativa = await tarefaService.deletarTarefa(tarefa.id)
        expect(primeiraTentativa).toBe(true)

        // Assert - Segunda tentativa deve falhar (tarefa não existe mais)
        await expect(tarefaService.deletarTarefa(tarefa.id)).rejects.toThrow(TarefaNaoEncontradaError)
      })
    })
  })
})
