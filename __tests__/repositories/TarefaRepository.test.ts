/**
 * src/__tests__/repositories/TarefaRepository.test.ts
 * Testes para o TarefaRepository
 */
import { Tarefa } from '../../src/database/models/Tarefa'
import { TarefaRepository } from '../../src/repositories/TarefaRepository'
import type { ITarefaRepository } from '../../src/repositories/interfaces/ITarefaRepository'
import type { TarefaCreationAttributes } from '../../src/database/models/Tarefa'
import { Usuario } from '../../src/database/models/Usuario'
import type { UsuarioCreationAttributes } from '../../src/database/models/Usuario'

// ----------------------------------------------------------------------
// TIPOS PARA TESTES - TYPE SAFE
// ----------------------------------------------------------------------

// Tipo para criação de tarefa com campos opcionais para testes
type TarefaCreationTest = Partial<TarefaCreationAttributes> & {
  titulo?: string
  descricao?: string | null
  status?: 'pendente' | 'em_andamento' | 'concluida'
  usuarioId?: number
}

// Tipos específicos para cada cenário de validação
type TarefaSemTitulo = Omit<TarefaCreationTest, 'titulo'> & { titulo?: never }
type TarefaSemUsuarioId = Omit<TarefaCreationTest, 'usuarioId'> & { usuarioId?: never }
type TarefaComStatusCustom = TarefaCreationTest & { status: 'pendente' | 'em_andamento' | 'concluida' }

// ----------------------------------------------------------------------
// TESTES
// ----------------------------------------------------------------------

describe('TarefaRepository', () => {
  let tarefaRepository: ITarefaRepository
  let usuario: Usuario

  beforeEach(async () => {
    // Cria o repository
    tarefaRepository = new TarefaRepository()

    // ✅ CORREÇÃO: Cria usuário NOVO para CADA teste (igual ao teste da Model)
    const usuarioData: UsuarioCreationAttributes = {
      nome: 'Usuário para teste',
      email: 'usuario.tarefa@email.com', // ← MESMO email do teste da Model
      passwordHash: 'hash_usuario',
    }
    usuario = await Usuario.create(usuarioData)
  })
  // --------------------------------------------------------------------
  // TESTES DE BUSCA
  // --------------------------------------------------------------------
  describe('métodos de busca', () => {
    describe('findById', () => {
      test('deve retornar tarefa quando ID existe', async () => {
        // 🟢 ARRANGE
        const tarefaCriada = await Tarefa.create({
          titulo: 'Tarefa para Buscar por ID',
          usuarioId: usuario.id,
        })

        // 🔵 ACT
        const tarefaEncontrada = await tarefaRepository.findById(tarefaCriada.id)

        // 🟣 ASSERT
        expect(tarefaEncontrada).toBeDefined()
        expect(tarefaEncontrada).not.toBeNull()

        if (tarefaEncontrada) {
          expect(tarefaEncontrada.id).toBe(tarefaCriada.id)
          expect(tarefaEncontrada.titulo).toBe('Tarefa para Buscar por ID')
          expect(tarefaEncontrada.usuarioId).toBe(usuario.id)
        }
      })

      test('deve retornar null quando ID não existe', async () => {
        // 🔵 ACT & 🟣 ASSERT
        const tarefaEncontrada = await tarefaRepository.findById(99999)
        expect(tarefaEncontrada).toBeNull()
      })
    })

    describe('findByUsuarioId', () => {
      test('deve retornar tarefas de um usuário', async () => {
        // Arrange
        await Tarefa.bulkCreate([{ titulo: 'Tarefa 1 do Usuário', usuarioId: usuario.id }])
        await Tarefa.bulkCreate([{ titulo: 'Tarefa 21 do Usuário', usuarioId: usuario.id }])

        // Act
        const tarefas = await tarefaRepository.findByUsuarioId(usuario.id)

        // Assert
        expect(tarefas).toHaveLength(2)
        tarefas.forEach((tarefa) => {
          expect(tarefa.usuarioId).toBe(usuario.id)
        })
      })

      test('deve retornar array vazio para usuário sem tarefas', async () => {
        // Act & Assert
        const tarefas = await tarefaRepository.findByUsuarioId(99999)
        expect(tarefas).toEqual([])
        expect(tarefas).toHaveLength(0)
      })
    })

    describe('findByStatus', () => {
      test('deve retornar tarefas por status', async () => {
        // 🟢 ARRANGE
        await Tarefa.bulkCreate([
          { titulo: 'Tarefa Pendente 1', status: 'pendente', usuarioId: usuario.id },
          { titulo: 'Tarefa Concluída', status: 'concluida', usuarioId: usuario.id },
          { titulo: 'Tarefa Pendente 2', status: 'pendente', usuarioId: usuario.id },
        ])

        // 🔵 ACT
        const tarefasPendentes = await tarefaRepository.findByStatus('pendente')

        // 🟣 ASSERT
        expect(tarefasPendentes).toHaveLength(2)
        tarefasPendentes.forEach((tarefa) => {
          expect(tarefa.status).toBe('pendente')
        })
      })

      test('deve retornar array vazio para status sem tarefas', async () => {
        // 🔵 ACT & 🟣 ASSERT
        const tarefas = await tarefaRepository.findByStatus('em_andamento')
        expect(tarefas).toEqual([])
        expect(tarefas).toHaveLength(0)
      })
    })

    describe('findAll', () => {
      test('deve retornar array vazio quando não há tarefas', async () => {
        // 🟢 ARRANGE - garante que não há tarefas
        await Tarefa.destroy({ where: {} })

        // 🔵 ACT
        const tarefas = await tarefaRepository.findAll()

        // 🟣 ASSERT
        expect(tarefas).toEqual([])
        expect(tarefas).toHaveLength(0)
      })

      test('deve retornar todas as tarefas', async () => {
        // 🟢 ARRANGE - cria algumas tarefas
        await Tarefa.bulkCreate([
          { titulo: 'Tarefa 1', usuarioId: usuario.id },
          { titulo: 'Tarefa 2', usuarioId: usuario.id },
        ])

        // 🔵 ACT
        const tarefas = await tarefaRepository.findAll()

        // 🟣 ASSERT
        expect(tarefas).toHaveLength(2)
        expect(tarefas[0]).toBeDefined()
        expect(tarefas[1]).toBeDefined()

        if (tarefas[0] && tarefas[1]) {
          expect(tarefas[0].titulo).toBe('Tarefa 1')
          expect(tarefas[1].titulo).toBe('Tarefa 2')
        }
      })
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE ESCRITA
  // --------------------------------------------------------------------

  describe('métodos de escrita', () => {
    describe('create', () => {
      test('deve criar tarefa com dados válidos', async () => {
        // Arrange
        const tarefaData: TarefaCreationAttributes = {
          titulo: 'Nova Tarefa via Repository',
          descricao: 'Descrição da tarefa',
          status: 'pendente',
          usuarioId: usuario.id,
        }

        // Act
        const tarefaCriada = await tarefaRepository.create(tarefaData)

        // Assert
        expect(tarefaCriada.id).toBeDefined()
        expect(tarefaCriada.titulo).toBe(tarefaData.titulo)
        expect(tarefaCriada.descricao).toBe(tarefaData.descricao)
        expect(tarefaCriada.status).toBe(tarefaData.status)
        expect(tarefaCriada.usuarioId).toBe(usuario.id)
      })

      test('não deve criar tarefa sem título', async () => {
        // Arrange
        const tarefaInvalida: TarefaSemTitulo = {
          usuarioId: usuario.id,
          descricao: 'Sem título',
        }

        // Act & Assert
        await expect(tarefaRepository.create(tarefaInvalida as TarefaCreationAttributes)).rejects.toThrow()
      })

      test('não deve criar tarefa sem usuarioId', async () => {
        // Arrange
        const tarefaInvalida: TarefaSemUsuarioId = {
          titulo: 'Tarefa sem Usuário',
        }

        // Act & Assert
        await expect(tarefaRepository.create(tarefaInvalida as TarefaCreationAttributes)).rejects.toThrow()
      })
    })

    describe('update', () => {
      test('deve atualizar tarefa existente', async () => {
        // Arrange
        const tarefa = await Tarefa.create({
          titulo: 'Tarefa Original',
          usuarioId: usuario.id,
        })

        // Act
        const tarefaAtualizada = await tarefaRepository.update(tarefa.id, {
          titulo: 'Tarefa atualizada',
          status: 'concluida',
        })

        // Assert
        expect(tarefaAtualizada).toBeDefined()
        expect(tarefaAtualizada?.titulo).toBe('Tarefa atualizada')
        expect(tarefaAtualizada?.status).toBe('concluida')
        expect(tarefaAtualizada?.usuarioId).toBe(usuario.id)
      })

      test('deve retornar null ao atualizar tarefa inexistente', async () => {
        // Act  & Assert
        const resultado = await tarefaRepository.update(99999, {
          titulo: 'Tarefa Inexistente',
        })

        expect(resultado).toBeNull()
      })
    })

    describe('delete', () => {
      test('deve deletar tarefa existente', async () => {
        // Arrange
        const tarefa = await Tarefa.create({
          titulo: 'Tarefa para Deletar',
          usuarioId: usuario.id,
        })

        // Act
        const resultado = await tarefaRepository.delete(tarefa.id)
        // Assert
        expect(resultado).toBe(true)

        // Verifica que foi realmente deletada
        const tarefaDeletada = await Tarefa.findByPk(tarefa.id)
        expect(tarefaDeletada).toBeNull()
      })

      test('deve retornar false ao deletar tarefa inexistente', async () => {
        // Act & Assert
        const resultado = await tarefaRepository.delete(999999)
        expect(resultado).toBe(false)
      })
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE STATUS
  // --------------------------------------------------------------------
  describe('gerenciamento de status', () => {
    test('deve criar tarefa com diferentes status', async () => {
      // Arrange
      const tarefaPendente: TarefaComStatusCustom = {
        titulo: 'Tarefa Pendente',
        status: 'pendente',
        usuarioId: usuario.id,
      }
      const tarefaEmAndamento: TarefaComStatusCustom = {
        titulo: 'Tarefa Pendente',
        status: 'em_andamento',
        usuarioId: usuario.id,
      }

      // Act
      const criadaPendente = await tarefaRepository.create(tarefaPendente as TarefaCreationAttributes)
      const criadaEmAndamento = await tarefaRepository.create(tarefaEmAndamento as TarefaCreationAttributes)
      // Assert\
      expect(criadaPendente.status).toBe('pendente')
      expect(criadaEmAndamento.status).toBe('em_andamento')
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE INTEGRAÇÃO
  // --------------------------------------------------------------------
  describe('integração entre métodos', () => {
    test('deve criar, buscar, atualizar e deletar uma tarefa', async () => {
      // Create
      const tarefaCriada = await tarefaRepository.create({
        titulo: 'Tarefa Completa',
        usuarioId: usuario.id,
      })

      // Find
      const tarefaEncontrada = await tarefaRepository.findById(tarefaCriada.id)
      expect(tarefaEncontrada?.titulo).toBe('Tarefa Completa')

      // Update
      const tarefaAtualizada = await tarefaRepository.update(tarefaCriada.id, {
        status: 'concluida',
      })
      expect(tarefaAtualizada?.status).toBe('concluida')

      // Delete
      const deletado = await tarefaRepository.delete(tarefaCriada.id)
      expect(deletado).toBe(true)

      // Verify
      const tarefaDeletada = await tarefaRepository.findById(tarefaCriada.id)
      expect(tarefaDeletada).toBeNull()
    })
  })
})
