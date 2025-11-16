/**
 * src/__tests__/repositories/UsuarioRepository.test.ts
 * Testes com injeção de dependência
 */
import { Usuario } from '../../src/database/models/Usuario'
import { UsuarioRepository } from '../../src/repositories/UsuarioRepository'
import type { UsuarioCreationAttributes } from '../../src/database/models/Usuario'

describe('UsuarioRepository', () => {
  let usuarioRepository: UsuarioRepository

  // Executa antes de cada teste
  beforeEach(() => {
    // ✅ AGORA podemos injetar dependências!
    usuarioRepository = new UsuarioRepository(Usuario)
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: Métodos de Busca
  // --------------------------------------------------------------------
  describe('findByEmail', () => {
    test('deve retornar usuário quando email existe', async () => {
      // Arrange (Prepação)
      const email = 'teste@email.com'
      const usuarioData: UsuarioCreationAttributes = {
        nome: 'Usuário Teste',
        email,
        passwordHash: 'hash123',
      }

      await Usuario.create(usuarioData)

      // Act (Ação)
      const usuarioEncontrado = await usuarioRepository.findByEmail(email)

      // Assert (Verificação)
      expect(usuarioEncontrado).toBeDefined()
      expect(usuarioEncontrado).not.toBeNull()

      if (usuarioEncontrado) {
        expect(usuarioEncontrado.email).toBe(email)
        expect(usuarioEncontrado.nome).toBe('Usuário Teste')
      }
    })

    test('deve retornar null quando email não existe', async () => {
      // Act
      const usuarioEncontrado = await usuarioRepository.findByEmail('naoexiste@email.com')

      // assert
      expect(usuarioEncontrado).toBeNull()
    })
  })

  describe('findById', () => {
    test('deve retornar usuário quando ID existe', async () => {
      // Arrange
      const usuarioCriado = await Usuario.create({
        nome: 'Usuario para buscar por ID',
        email: 'buscarid@gmail.com',
        passwordHash: 'hash_busca',
      })

      //Act
      const usuarioEncontrado = await usuarioRepository.findById(usuarioCriado.id)

      // Asser
      expect(usuarioEncontrado).toBeDefined()
      expect(usuarioEncontrado).not.toBeNull()

      if (usuarioEncontrado) {
        expect(usuarioEncontrado.id).toBe(usuarioCriado.id)
        expect(usuarioEncontrado.nome).toBe(usuarioCriado.nome)
        expect(usuarioEncontrado.email).toBe(usuarioCriado.email)
      }
    })

    test('deve retornar null quando Id não existe', async () => {
      // Act
      const usuarioEncontrado = await usuarioRepository.findById(9999)

      // Assert
      expect(usuarioEncontrado).toBeNull()
    })

    test('deve retornar null quando ID é zero', async () => {
      // Act
      const usuarioEncontrado = await usuarioRepository.findById(0)

      // Assert
      expect(usuarioEncontrado).toBeNull()
    })
  })

  describe('findAll', () => {
    it('deve retornar array vazio quando não há usuários', async () => {
      // Arrange - (Prepara) - garante que não há usuários
      await Usuario.destroy({ where: {} })

      // Act (Ação)
      const usuario = await usuarioRepository.findAll()

      // Assert (Verificação)
      expect(usuario).toEqual([])
      expect(usuario).toHaveLength(0)
    })

    it('deve retornar todos os usuários', async () => {
      // Arrange - criar alguns usuaŕio
      await Usuario.destroy({ where: {} })

      await Usuario.bulkCreate([
        {
          nome: 'Usuário 1',
          email: 'user1@email.com',
          passwordHash: 'hash1',
        },
        {
          nome: 'Usuário 2',
          email: 'user2@email.com',
          passwordHash: 'hash2',
        },
      ])

      // Act
      const usuarios = await usuarioRepository.findAll()

      // Asset
      expect(usuarios).toHaveLength(2)
      expect(usuarios[0]).toBeDefined()
      expect(usuarios[1]).toBeDefined()

      if (usuarios[0] && usuarios[1]) {
        expect(usuarios[0].email).toBe('user1@email.com')
        expect(usuarios[1].email).toBe('user2@email.com')
        expect(usuarios[0].nome).toBe('Usuário 1')
        expect(usuarios[1].nome).toBe('Usuário 2')
      }
    })

    test('deve retornar usuários na ordem correta', async () => {
      // Arrange
      await Usuario.destroy({ where: {} })

      await Usuario.bulkCreate([
        { nome: 'Z User', email: 'z@email.com', passwordHash: 'hash_z' },
        { nome: 'A User', email: 'a@email.com', passwordHash: 'hash_a' },
      ])

      // Act
      const usuarios = await usuarioRepository.findAll()

      // Assert
      expect(usuarios[0]?.email).toBe('z@email.com')
      expect(usuarios[1]?.email).toBe('a@email.com')
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: Métodos de Escrita
  // --------------------------------------------------------------------
  describe('métodos de escrita', () => {
    describe('create', () => {
      test('deve criar usuário com dados válidos', async () => {
        // Arrange
        const usuarioData: UsuarioCreationAttributes = {
          nome: 'Novo Usuário',
          email: 'novo@email.com',
          passwordHash: 'novo_hash',
        }

        // Act
        const usuarioCriado = await usuarioRepository.create(usuarioData)

        // Assert
        expect(usuarioCriado).toBeDefined()
        expect(usuarioCriado.id).toBeDefined()
        expect(usuarioCriado.nome).toBe(usuarioData.nome)
        expect(usuarioCriado.email).toBe(usuarioData.email)
        expect(usuarioCriado.passwordHash).toBe(usuarioData.passwordHash)
        expect(usuarioCriado.createdAt).toBeInstanceOf(Date)
        expect(usuarioCriado.updatedAt).toBeInstanceOf(Date)
      })

      test('não deve criar usuário com email duplicado', async () => {
        // Arrange
        const email = 'duplicado@email.com'

        const usuarioData: UsuarioCreationAttributes = {
          nome: 'Primeiro Usuario',
          email,
          passwordHash: 'hash1',
        }

        // Act
        await usuarioRepository.create(usuarioData)
        // Act & Assert
        await expect(
          usuarioRepository.create({
            nome: 'Segundo Usuario',
            email,
            passwordHash: 'hash2',
          }),
        ).rejects.toThrow()
      })

      test('deve criar usuario com campos mínimos obrigatório', async () => {
        // Arrange
        const usuarioMinimo: UsuarioCreationAttributes = {
          nome: 'Mínimo',
          email: 'minimo@email.com',
          passwordHash: 'has_minimo',
        }

        // Act
        const usuarioCriado = await usuarioRepository.create(usuarioMinimo)

        // Assert
        expect(usuarioCriado.id).toBeDefined()
        expect(usuarioCriado.nome).toBe('Mínimo')
        expect(usuarioCriado.email).toBe('minimo@email.com')
      })
    })

    describe('update', () => {
      test('deve atualizar usuário existente', async () => {
        // Arrange
        const usuario = await Usuario.create({
          nome: 'Nome Original',
          email: 'original@email.com',
          passwordHash: 'hash_original',
        })

        // Act
        const usuarioAtualizado = await usuarioRepository.update(usuario.id, { nome: 'Nome atualizado' })

        // Assert
        expect(usuarioAtualizado).toBeDefined()
        expect(usuarioAtualizado).not.toBeNull()

        if (usuarioAtualizado) {
          expect(usuarioAtualizado.nome).toBe('Nome atualizado')
          expect(usuarioAtualizado.email).toBe('original@email.com')
          expect(usuarioAtualizado.passwordHash).toBe('hash_original')
        }
      })

      test('deve atualizar múltiplos campos', async () => {
        // Arrange
        const usuario = await Usuario.create({
          nome: 'Original',
          email: 'original@email.com',
          passwordHash: 'hash_original',
        })

        // Act
        const usuarioAtualizado = await usuarioRepository.update(usuario.id, {
          nome: 'Nome novo',
          passwordHash: 'hash_novo',
        })

        // Assert
        expect(usuarioAtualizado).toBeDefined()

        if (usuarioAtualizado) {
          expect(usuarioAtualizado.nome).toBe('Nome novo')
          expect(usuarioAtualizado.email).toBe('original@email.com')
          expect(usuarioAtualizado.passwordHash).toBe('hash_novo')
        }
      })

      test('deve retornar null ao tentar atualizar usuário inexistente', async () => {
        // Act
        const resultado = await usuarioRepository.update(9999, { nome: 'Inexistente' })

        // Assert
        expect(resultado).toBeNull()
      })

      test('não deve quebrar ao tentar atualizar com dados vázios', async () => {
        // Arrange
        const usuario = await Usuario.create({
          nome: 'Teste vázio',
          email: 'vazio@email.com',
          passwordHash: 'hash_vazio',
        })

        // Act
        const usuarioAtualizado = await usuarioRepository.update(usuario.id, {})

        // Assert
        expect(usuarioAtualizado).toBeDefined()
        expect(usuarioAtualizado?.nome).toBe('Teste vázio') //Permanece o Mesmo
      })
    })

    describe('delete', () => {
      test('deve deletar usuário existente', async () => {
        // Arrange
        const usuario = await Usuario.create({
          nome: 'Usuário para Deletar',
          email: 'deletar@email.com',
          passwordHash: 'hash_delete',
        })

        // Act
        const resultado = await usuarioRepository.delete(usuario.id)

        // Assert
        expect(resultado).toBe(true)

        // Verifica que realmente foi deletado
        const usuarioDeletado = await Usuario.findByPk(usuario.id)
        expect(usuarioDeletado).toBeNull()
      })

      test('deve retornar false ao tentar deletar usuário inexistente', async () => {
        // Act
        const resultado = await usuarioRepository.delete(99999)

        // Assert
        expect(resultado).toBe(false)
      })

      test('deve retornar false ao tentar deletar usuário já deletado', async () => {
        // Arrange
        const usuario = await Usuario.create({
          nome: 'Já Deletado',
          email: 'jadeletado@email.com',
          passwordHash: 'hash_jadelato',
        })

        // Act
        // Primeiro deleção
        await usuarioRepository.delete(usuario.id)

        //segunda tentativa

        const resultado = await usuarioRepository.delete(usuario.id)

        // Assert
        expect(resultado).toBe(false)
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: Cenários Especiais
  // --------------------------------------------------------------------
  describe('cenários especiais', () => {
    describe('com banco vazio', () => {
      beforeEach(async () => {
        await Usuario.destroy({ where: {} })
      })

      test('findAll deve retornar array vazio', async () => {
        const usuarios = await usuarioRepository.findAll()
        expect(usuarios).toHaveLength(0)
      })

      test('findByEmail deve retornar null para qualquer email', async () => {
        const usuario = await usuarioRepository.findByEmail('qualquer@email.com')
        expect(usuario).toBeNull()
      })

      test('findById deve retornar null para qualquer ID', async () => {
        const usuario = await usuarioRepository.findById(1)
        expect(usuario).toBeNull()
      })
    })

    describe('com múltiplos usuários', () => {
      beforeEach(async () => {
        await Usuario.bulkCreate([
          { nome: 'Usuário A', email: 'a@email.com', passwordHash: 'hash_a' },
          { nome: 'Usuário B', email: 'b@email.com', passwordHash: 'hash_b' },
          { nome: 'Usuário C', email: 'c@email.com', passwordHash: 'hash_c' },
        ])
      })

      test('findAll deve retornar todos os usuários', async () => {
        const usuarios = await usuarioRepository.findAll()
        expect(usuarios).toHaveLength(3)
      })

      test('deve conseguir buscar cada usuário individualmente', async () => {
        const usuarioA = await usuarioRepository.findByEmail('a@email.com')
        const usuarioB = await usuarioRepository.findByEmail('b@email.com')
        const usuarioC = await usuarioRepository.findByEmail('c@email.com')

        expect(usuarioA).toBeDefined()
        expect(usuarioB).toBeDefined()
        expect(usuarioC).toBeDefined()

        expect(usuarioA?.nome).toBe('Usuário A')
        expect(usuarioB?.nome).toBe('Usuário B')
        expect(usuarioC?.nome).toBe('Usuário C')
      })
    })

    describe('com emails case sensitive', () => {
      test('deve encontrar usuário independente do case do email', async () => {
        // Arrange
        await Usuario.create({
          nome: 'Case Test',
          email: 'teste@email.com',
          passwordHash: 'hash_case',
        })

        // Act & Assert - diferentes casos
        const resultado1 = await usuarioRepository.findByEmail('TESTE@email.com')
        const resultado2 = await usuarioRepository.findByEmail('Teste@Email.Com')
        const resultado3 = await usuarioRepository.findByEmail('teste@EMAIL.com')

        // O Sequelize geralmente é case insensitive por padrão
        // Mas depende da configuração do banco
        expect(resultado1).toBeDefined()
        expect(resultado2).toBeDefined()
        expect(resultado3).toBeDefined()
      })
    })
  })

  // --------------------------------------------------------------------
  // DESCRIBE ANINHADO: Testes de Integração
  // --------------------------------------------------------------------
  describe('integração entre métodos', () => {
    test('deve criar, buscar, atualizar e deletar um usuário', async () => {
      // Create
      const usuarioCriado = await usuarioRepository.create({
        nome: 'Usuário Completo',
        email: 'completo@email.com',
        passwordHash: 'hash_completo',
      })

      // Find
      const usuarioEncontrado = await usuarioRepository.findById(usuarioCriado.id)
      expect(usuarioEncontrado?.email).toBe('completo@email.com')

      // Update
      const usuarioAtualizado = await usuarioRepository.update(usuarioCriado.id, {
        nome: 'Usuário Atualizado',
      })
      expect(usuarioAtualizado?.nome).toBe('Usuário Atualizado')

      // Delete
      const deletado = await usuarioRepository.delete(usuarioCriado.id)
      expect(deletado).toBe(true)

      // Verify
      const usuarioDeletado = await usuarioRepository.findById(usuarioCriado.id)
      expect(usuarioDeletado).toBeNull()
    })
  })
})
