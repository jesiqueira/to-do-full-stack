/**
 * src/__tests__/models/Tarefa.test.ts
 * Testes para o model Tarefa com tipos type-safe
 */

import { Tarefa, TAREFA_TABLE_NAME, TAREFA_STATUS_VALUES } from '../../src/database/models/Tarefa'
import { Usuario } from '../../src/database/models/Usuario'
import type { TarefaCreationAttributes } from '../../src/database/models/Tarefa'
import type { UsuarioCreationAttributes } from '../../src/database/models/Usuario'
import type { Model, ModelStatic } from 'sequelize'

// ----------------------------------------------------------------------
// TIPOS PARA TESTES DO MODEL - TYPE SAFE
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
type TarefaSemDescricao = Omit<TarefaCreationTest, 'descricao'> & { descricao?: never }

// Tipo para status inválido (fora do enum)
type TarefaComStatusInvalido = Omit<TarefaCreationAttributes, 'status'> & {
  status: string // Permite qualquer string, não apenas os valores do enum
}

// ----------------------------------------------------------------------
// TESTES
// ----------------------------------------------------------------------

describe('Tarefa Model', () => {
  let usuario: Usuario

  // Cria um usuário antes de todos os testes de Tarefa
  beforeEach(async () => {
    const usuarioData: UsuarioCreationAttributes = {
      nome: 'Usuário para teste',
      email: 'usuario.tarefa@email.com',
      passwordHash: 'hash_usuario',
    }
    usuario = await Usuario.create(usuarioData)
  })

  // --------------------------------------------------------------------
  // TESTES BÁSICOS
  // --------------------------------------------------------------------
  describe('Definição do Model', () => {
    test('deve ter o nome da tabela correto', () => {
      expect(Tarefa.getTableName()).toBe(TAREFA_TABLE_NAME)
    })

    test('deve ter todos os campos definidos', () => {
      const attributes = Tarefa.getAttributes()

      expect(attributes).toHaveProperty('id')
      expect(attributes).toHaveProperty('titulo')
      expect(attributes).toHaveProperty('descricao')
      expect(attributes).toHaveProperty('status')
      expect(attributes).toHaveProperty('usuarioId')
    })

    test('deve ter valores válidos para status', () => {
      expect(TAREFA_STATUS_VALUES).toEqual(['pendente', 'em_andamento', 'concluida'])
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE CRIAÇÃO - COM TIPOS TYPE-SAFE
  // --------------------------------------------------------------------

  describe('Criação de Tarefa', () => {
    test('deve criar uma tarefa com dados válidos', async () => {
      // 🟢 ARRANGE
      const tarefaData: TarefaCreationAttributes = {
        titulo: 'Minha Primeira Tarefa',
        descricao: 'Descrição da tarefa',
        status: 'pendente',
        usuarioId: usuario.id,
      }

      // 🔵 ACT
      const tarefa = await Tarefa.create(tarefaData)

      // 🟣 ASSERT
      expect(tarefa.id).toBeDefined()
      expect(tarefa.titulo).toBe(tarefaData.titulo)
      expect(tarefa.descricao).toBe(tarefaData.descricao)
      expect(tarefa.status).toBe(tarefaData.status)
      expect(tarefa.usuarioId).toBe(usuario.id)
    })

    test('deve criar tarefa com status padrão "pendente"', async () => {
      // 🟢 ARRANGE - Não passa status, deve usar default
      const tarefaData: TarefaSemDescricao & { status?: never } = {
        titulo: 'Tarefa com Status Padrão',
        usuarioId: usuario.id,
      }

      // 🔵 ACT
      const tarefa = await Tarefa.create(tarefaData as TarefaCreationAttributes)

      // 🟣 ASSERT
      expect(tarefa.status).toBe('pendente')
    })

    test('deve criar tarefa sem descrição', async () => {
      // 🟢 ARRANGE - Usando tipo sem descrição
      const tarefaData: TarefaSemDescricao = {
        titulo: 'Tarefa sem Descrição',
        usuarioId: usuario.id,
      }

      // 🔵 ACT
      const tarefa = await Tarefa.create(tarefaData as TarefaCreationAttributes)

      // 🟣 ASSERT
      expect(tarefa.descricao).toBeUndefined()
    })

    test('deve criar tarefa com descrição null explícita', async () => {
      const tarefaData: TarefaCreationAttributes = {
        titulo: 'Tarefa com Descrição Null',
        descricao: null, // ← Passando null explicitamente
        usuarioId: usuario.id,
      }

      const tarefa = await Tarefa.create(tarefaData)

      // ✅ Quando passamos null explicitamente, deve ser null
      expect(tarefa.descricao).toBeNull()
    })

    test('deve criar tarefa com descrição vazia', async () => {
      const tarefaData: TarefaCreationAttributes = {
        titulo: 'Tarefa com Descrição Vazia',
        descricao: '', // ← String vazia
        usuarioId: usuario.id,
      }

      const tarefa = await Tarefa.create(tarefaData)

      // Quando passamos string vazia, deve ser string vazia
      expect(tarefa.descricao).toBe('')
    })

    test('deve criar tarefa com status explícito', async () => {
      // 🟢 ARRANGE
      const tarefaData: TarefaCreationAttributes = {
        titulo: 'Tarefa com Status Explícito',
        descricao: 'Descrição',
        status: 'em_andamento', // ← Status explícito
        usuarioId: usuario.id,
      }

      // 🔵 ACT
      const tarefa = await Tarefa.create(tarefaData)

      // 🟣 ASSERT
      expect(tarefa.status).toBe('em_andamento')
    })

    test('não deve criar tarefa sem título - COM TIPO TYPE-SAFE', async () => {
      // 🟢 ARRANGE - Tipo que garante que título está faltando
      const tarefaInvalida: TarefaSemTitulo = {
        usuarioId: usuario.id,
        descricao: 'Sem título, deve falhar',
      }

      // 🔵 ACT & 🟣 ASSERT
      await expect(Tarefa.create(tarefaInvalida as TarefaCreationAttributes)).rejects.toThrow()
    })

    test('não deve criar tarefa sem usuarioId - COM TIPO TYPE-SAFE', async () => {
      // Arrange - Tipo que garamte que usuarioId está faltando
      const tarefaInvalida: TarefaSemUsuarioId = {
        titulo: 'Tarefa sem usuarioId',
        descricao: 'Deve falha sem usuarioId',
      }

      // ACT & ASSERT
      await expect(Tarefa.create(tarefaInvalida as TarefaCreationAttributes)).rejects.toThrow()
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE VALIDAÇÃO DE STATUS
  // --------------------------------------------------------------------

  describe('Validação de Status', () => {
    test('deve aceitar status "em_andamento"', async () => {
      // 🟢 ARRANGE - Tipo com status específico
      const tarefaData: TarefaCreationAttributes = {
        titulo: 'Tarefa em Andamento',
        status: 'em_andamento',
        usuarioId: usuario.id,
      }

      // 🔵 ACT
      const tarefa = await Tarefa.create(tarefaData)

      // 🟣 ASSERT
      expect(tarefa.status).toBe('em_andamento')
    })

    test('deve aceitar status "concluida"', async () => {
      // 🟢 ARRANGE
      const tarefaData: TarefaCreationAttributes = {
        titulo: 'Tarefa Concluída',
        status: 'concluida',
        usuarioId: usuario.id,
      }

      // 🔵 ACT
      const tarefa = await Tarefa.create(tarefaData)

      // 🟣 ASSERT
      expect(tarefa.status).toBe('concluida')
    })

    test('NÃO deve aceitar status inválido', async () => {
      // 🟢 ARRANGE - Status que NÃO existe no ENUM
      const tarefaInvalida: TarefaComStatusInvalido = {
        titulo: 'Tarefa com Status Inválido',
        status: 'status_que_nao_existe', // ❌ Não existe no ENUM
        usuarioId: usuario.id,
      }

      // 🔵 ACT & 🟣 ASSERT - Deve lançar ERRO
      await expect(Tarefa.create(tarefaInvalida as TarefaCreationAttributes)).rejects.toThrow()
    })

    test('deve aceitar TODOS os status válidos do ENUM', async () => {
      // Testa cada status válido
      for (const statusValido of TAREFA_STATUS_VALUES) {
        // 🟢 ARRANGE
        const tarefaData: TarefaCreationAttributes = {
          titulo: `Tarefa com status ${statusValido}`,
          status: statusValido,
          usuarioId: usuario.id,
        }

        // 🔵 ACT
        const tarefa = await Tarefa.create(tarefaData)

        // 🟣 ASSERT - Deve criar SEM erro
        expect(tarefa.status).toBe(statusValido)
        expect(tarefa.id).toBeDefined()
      }
    })
  })

  // --------------------------------------------------------------------
  // TESTES COM MÚLTIPLOS USUÁRIOS
  // --------------------------------------------------------------------
  describe('Múltiplos Usuários', () => {
    test('deve criar tarefas para diferentes usuários', async () => {
      // 🟢 ARRANGE - Cria usuários DENTRO do teste
      const usuario1 = await Usuario.create({
        nome: 'Usuário 1 para Tarefas',
        email: 'usuario1.tarefas@email.com',
        passwordHash: 'hash_usuario1',
      })

      const usuario2 = await Usuario.create({
        nome: 'Usuário 2 para Tarefas',
        email: 'usuario2.tarefas@email.com',
        passwordHash: 'hash_usuario2',
      })

      // 🔵 ACT - Cria tarefas com pequena pausa
      const tarefaUsuario1 = await Tarefa.create({
        titulo: 'Tarefa do Usuário 1',
        usuarioId: usuario1.id,
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      const tarefaUsuario2 = await Tarefa.create({
        titulo: 'Tarefa do Usuário 2',
        usuarioId: usuario2.id,
      })

      // 🟣 ASSERT
      expect(tarefaUsuario1.usuarioId).toBe(usuario1.id)
      expect(tarefaUsuario2.usuarioId).toBe(usuario2.id)
      expect(tarefaUsuario1.usuarioId).not.toBe(tarefaUsuario2.usuarioId)

      // Limpeza
      await tarefaUsuario1.destroy()
      await tarefaUsuario2.destroy()
      await usuario1.destroy()
      await usuario2.destroy()
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE ATUALIZAÇÃO
  // --------------------------------------------------------------------
  describe('Atualização de Tarefa', () => {
    test('deve atualizar status da tarefa', async () => {
      // 🟢 ARRANGE
      const tarefa = await Tarefa.create({
        titulo: 'Tarefa para Atualizar',
        status: 'pendente',
        usuarioId: usuario.id,
      })

      // 🔵 ACT
      await tarefa.update({ status: 'concluida' })

      // 🟣 ASSERT
      expect(tarefa.status).toBe('concluida')
      expect(tarefa.titulo).toBe('Tarefa para Atualizar') // Não mudou
    })

    test('deve atualizar múltiplos campos', async () => {
      // 🟢 ARRANGE
      const tarefa = await Tarefa.create({
        titulo: 'Tarefa Original',
        descricao: 'Descrição Original',
        status: 'pendente',
        usuarioId: usuario.id,
      })

      // 🔵 ACT
      await tarefa.update({
        titulo: 'Tarefa Atualizada',
        status: 'em_andamento',
      })

      // 🟣 ASSERT
      expect(tarefa.titulo).toBe('Tarefa Atualizada')
      expect(tarefa.status).toBe('em_andamento')
      expect(tarefa.descricao).toBe('Descrição Original') // Não mudou
    })

    test('deve atualizar apenas os campos especificados', async () => {
      // 🟢 ARRANGE
      const tarefa = await Tarefa.create({
        titulo: 'Pedro Santos',
        descricao: 'Descrição Original',
        status: 'pendente',
        usuarioId: usuario.id,
      })

      const originalDescricao = tarefa.descricao
      const originalUsuarioId = tarefa.usuarioId

      // 🔵 ACT
      await tarefa.update({ titulo: 'Pedro Santos Modificado' })

      // 🟣 ASSERT
      expect(tarefa.titulo).toBe('Pedro Santos Modificado')
      expect(tarefa.descricao).toBe(originalDescricao)
      expect(tarefa.usuarioId).toBe(originalUsuarioId)
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE CONSULTA COM FILTROS
  // --------------------------------------------------------------------
  describe('Consultas com Filtros', () => {
    beforeEach(async () => {
      // Cria algumas tarefas para teste
      await Tarefa.bulkCreate([
        { titulo: 'Tarefa 1', status: 'pendente', usuarioId: usuario.id },
        { titulo: 'Tarefa 2', status: 'concluida', usuarioId: usuario.id },
        { titulo: 'Tarefa 3', status: 'pendente', usuarioId: usuario.id },
      ])
    })

    test('deve buscar tarefas por status', async () => {
      // 🔵 ACT
      const tarefasPendentes = await Tarefa.findAll({
        where: { status: 'pendente' },
      })

      // 🟣 ASSERT
      expect(tarefasPendentes).toHaveLength(2)
      tarefasPendentes.forEach((tarefa) => {
        expect(tarefa.status).toBe('pendente')
      })
    })

    test('deve buscar tarefas por usuarioId', async () => {
      // 🔵 ACT
      const tarefasDoUsuario = await Tarefa.findAll({
        where: { usuarioId: usuario.id },
      })

      // 🟣 ASSERT
      expect(tarefasDoUsuario).toHaveLength(3)
      tarefasDoUsuario.forEach((tarefa) => {
        expect(tarefa.usuarioId).toBe(usuario.id)
      })
    })

    test('deve retornar null ao buscar tarefa inexistente', async () => {
      // 🔵 ACT
      const tarefaInexistente = await Tarefa.findByPk(99999)

      // 🟣 ASSERT
      expect(tarefaInexistente).toBeNull()
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE DELEÇÃO
  // --------------------------------------------------------------------
  describe('Deleção de Tarefa', () => {
    test('deve deletar uma tarefa', async () => {
      // 🟢 ARRANGE
      const tarefa = await Tarefa.create({
        titulo: 'Tarefa para Deletar',
        usuarioId: usuario.id,
      })

      // 🔵 ACT
      await tarefa.destroy()

      // 🟣 ASSERT
      const tarefaDeletada = await Tarefa.findByPk(tarefa.id)
      expect(tarefaDeletada).toBeNull()
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE INSTÂNCIA
  // --------------------------------------------------------------------
  describe('Instância do Model', () => {
    test('deve converter para JSON corretamente', async () => {
      // 🟢 ARRANGE
      const tarefa = await Tarefa.create({
        titulo: 'Tarefa JSON Test',
        descricao: 'Descrição para JSON',
        status: 'em_andamento',
        usuarioId: usuario.id,
      })

      // 🔵 ACT
      const tarefaJson = tarefa.toJSON()

      // 🟣 ASSERT
      expect(tarefaJson.titulo).toBe('Tarefa JSON Test')
      expect(tarefaJson.descricao).toBe('Descrição para JSON')
      expect(tarefaJson.status).toBe('em_andamento')
      expect(tarefaJson.usuarioId).toBe(usuario.id)
      expect(tarefaJson.id).toBeDefined()
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE TIMESTAMPS AUTOMÁTICOS
  // --------------------------------------------------------------------
  describe('Timestamps Automáticos', () => {
    test('deve ter createdAt e updatedAt na criação', async () => {
      // 🟢 ARRANGE & 🔵 ACT
      const tarefa = await Tarefa.create({
        titulo: 'Teste Timestamps',
        usuarioId: usuario.id,
      })

      // 🟣 ASSERT
      expect(tarefa.createdAt).toBeInstanceOf(Date)
      expect(tarefa.updatedAt).toBeInstanceOf(Date)
    })

    test('deve atualizar updatedAt na modificação', async () => {
      // 🟢 ARRANGE
      const tarefa = await Tarefa.create({
        titulo: 'Tarefa para Atualizar Timestamp',
        usuarioId: usuario.id,
      })

      const originalUpdatedAt = tarefa.updatedAt

      // Aguarda um pouco para garantir diferença de tempo
      await new Promise((resolve) => setTimeout(resolve, 10))

      // 🔵 ACT
      await tarefa.update({ titulo: 'Título Atualizado' })

      // 🟣 ASSERT
      expect(tarefa.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    test('createdAt não deve mudar na atualização', async () => {
      // 🟢 ARRANGE
      const tarefa = await Tarefa.create({
        titulo: 'Tarefa Original',
        usuarioId: usuario.id,
      })

      const originalCreatedAt = tarefa.createdAt

      // 🔵 ACT
      await tarefa.update({ titulo: 'Novo Título' })

      // 🟣 ASSERT
      expect(tarefa.createdAt.getTime()).toBe(originalCreatedAt.getTime())
    })
  })

  // --------------------------------------------------------------------
  // TESTES DE COBERTURA DE BRANCHES DO associate (VERSÃO FINAL)
  // --------------------------------------------------------------------

  describe('Cobertura do Branch de Associação (Tarefa)', () => {
    test('deve garantir que o método associate não falhe quando Usuario é omitido (Caminho FALSE)', () => {
      // 🟢 ARRANGE
      // Tipagem Linter-Safe:
      // Criamos um objeto vazio que atende ao Record<string, ModelStatic<Model>>.
      // O 'as' é necessário para convencer o TS de que a forma do objeto é válida.
      const emptyModels: Record<string, ModelStatic<Model>> = {} as Record<string, ModelStatic<Model>>

      // 🔵 ACT & 🟣 ASSERT
      // Isso executa o if (Usuario) como FALSE, cobrindo o branch faltante.
      expect(() => Tarefa.associate(emptyModels)).not.toThrow()
    })
  })
})
